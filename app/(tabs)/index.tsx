import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
    Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/constants/theme';
import { Card, EmptyState, LoadingOverlay } from '../../src/components/Common';
import { ExpenseCard } from '../../src/components/ExpenseCard';
import { getSummary, getExpenses, getDefaultCategories } from '../../src/services/api';
import { getWebhookUrl } from '../../src/utils/storage';
import { SummaryData, Expense } from '../../src/types';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const [webhookConfigured, setWebhookConfigured] = useState(false);

    const loadData = async () => {
        try {
            const url = await getWebhookUrl();
            setWebhookConfigured(!!url);

            if (!url) {
                setLoading(false);
                return;
            }

            const [summaryResult, expensesResult] = await Promise.all([
                getSummary(),
                getExpenses({ limit: 5 }),
            ]);

            if (summaryResult.success && summaryResult.data) {
                setSummary(summaryResult.data);
            }

            if (expensesResult.success && expensesResult.data) {
                setRecentExpenses(expensesResult.data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getMonthName = (month: number) => {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        return months[month - 1];
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getPieChartData = () => {
        if (!summary?.categoryBreakdown?.length) return [];

        const categories = getDefaultCategories();

        return summary.categoryBreakdown.slice(0, 5).map((item, index) => {
            const category = categories.find(c => c.name === item.category);
            return {
                name: item.category,
                amount: item.amount,
                color: category?.color || `hsl(${index * 60}, 70%, 60%)`,
                legendFontColor: Colors.textSecondary,
                legendFontSize: 12,
            };
        });
    };

    if (loading) {
        return <LoadingOverlay visible={true} message="Yükleniyor..." />;
    }

    if (!webhookConfigured) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="🔗"
                    title="Webhook Yapılandırılmadı"
                    message="Harcamalarınızı kaydetmek için önce Ayarlar sayfasından Google Apps Script webhook URL'sini ekleyin."
                    actionLabel="Ayarlara Git"
                    onAction={() => { }}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Merhaba! 👋</Text>
                    <Text style={styles.subtitle}>
                        {summary ? `${getMonthName(summary.month)} ${summary.year}` : 'Bu Ay'}
                    </Text>
                </View>

                {/* Toplam Harcama Kartı */}
                <Card style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Bu Ay Toplam Harcama</Text>
                    <Text style={styles.totalAmount}>
                        {summary ? formatAmount(summary.totalAmount) : '0,00'} ₺
                    </Text>
                    <View style={styles.totalStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{summary?.expenseCount || 0}</Text>
                            <Text style={styles.statLabel}>İşlem</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {summary?.categoryBreakdown?.length || 0}
                            </Text>
                            <Text style={styles.statLabel}>Kategori</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {summary && summary.expenseCount > 0
                                    ? formatAmount(summary.totalAmount / summary.expenseCount)
                                    : '0'}
                            </Text>
                            <Text style={styles.statLabel}>Ortalama</Text>
                        </View>
                    </View>
                </Card>

                {/* Kategori Dağılımı */}
                {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
                    <Card style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
                        <PieChart
                            data={getPieChartData()}
                            width={screenWidth - Spacing.lg * 4}
                            height={180}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            absolute
                        />

                        {/* Kategori Listesi */}
                        <View style={styles.categoryList}>
                            {summary.categoryBreakdown.slice(0, 5).map((item, index) => {
                                const category = getDefaultCategories().find(c => c.name === item.category);
                                return (
                                    <View key={index} style={styles.categoryItem}>
                                        <View style={styles.categoryLeft}>
                                            <View style={[styles.categoryDot, { backgroundColor: category?.color || Colors.primary }]} />
                                            <Text style={styles.categoryName}>{item.category}</Text>
                                        </View>
                                        <View style={styles.categoryRight}>
                                            <Text style={styles.categoryAmount}>{formatAmount(item.amount)} ₺</Text>
                                            <Text style={styles.categoryPercent}>{item.percentage}%</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                )}

                {/* Son Harcamalar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Son Harcamalar</Text>
                    {recentExpenses.length > 0 ? (
                        recentExpenses.map((expense) => (
                            <ExpenseCard key={expense.id} expense={expense} />
                        ))
                    ) : (
                        <Card>
                            <Text style={styles.emptyText}>Henüz harcama yok</Text>
                        </Card>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    greeting: {
        ...Typography.h1,
        color: Colors.text,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    totalCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    totalLabel: {
        ...Typography.bodySmall,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: Spacing.xs,
    },
    totalAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    totalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...Typography.h3,
        color: Colors.text,
    },
    statLabel: {
        ...Typography.caption,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    chartCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    section: {
        paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    categoryList: {
        marginTop: Spacing.md,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.sm,
    },
    categoryName: {
        ...Typography.body,
        color: Colors.text,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryAmount: {
        ...Typography.body,
        color: Colors.text,
        marginRight: Spacing.sm,
    },
    categoryPercent: {
        ...Typography.caption,
        color: Colors.textMuted,
        minWidth: 35,
        textAlign: 'right',
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});

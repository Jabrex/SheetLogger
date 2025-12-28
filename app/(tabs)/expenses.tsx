import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/constants/theme';
import { EmptyState, LoadingOverlay } from '../../src/components/Common';
import { ExpenseCard, ExpenseListHeader } from '../../src/components/ExpenseCard';
import { getExpenses, deleteExpense, getDefaultCategories } from '../../src/services/api';
import { getWebhookUrl } from '../../src/utils/storage';
import { Expense, Category } from '../../src/types';

export default function ExpensesScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [webhookConfigured, setWebhookConfigured] = useState(false);

    const categories = getDefaultCategories();

    const loadExpenses = async () => {
        try {
            const url = await getWebhookUrl();
            setWebhookConfigured(!!url);

            if (!url) {
                setLoading(false);
                return;
            }

            const result = await getExpenses({
                category: selectedCategory || undefined,
            });

            if (result.success && result.data) {
                setExpenses(result.data);
            }
        } catch (error) {
            console.error('Harcamalar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadExpenses();
        }, [selectedCategory])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadExpenses();
        setRefreshing(false);
    };

    const handleDelete = (expense: Expense) => {
        Alert.alert(
            'Harcamayı Sil',
            `"${expense.description || expense.category}" harcamasını silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteExpense(expense.id);
                        if (result.success) {
                            setExpenses(expenses.filter(e => e.id !== expense.id));
                        } else {
                            Alert.alert('Hata', result.error || 'Harcama silinemedi');
                        }
                    },
                },
            ]
        );
    };

    const groupExpensesByDate = (expenses: Expense[]) => {
        const groups: { [key: string]: Expense[] } = {};

        expenses.forEach(expense => {
            const date = expense.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(expense);
        });

        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map(date => ({
                date,
                expenses: groups[date],
                total: groups[date].reduce((sum, e) => sum + e.amount, 0),
            }));
    };

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Bugün';
        if (isYesterday) return 'Dün';

        return date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    const getTotalAmount = () => {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
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
                    message="Harcamalarınızı görüntülemek için önce Ayarlar sayfasından webhook URL'sini ekleyin."
                />
            </SafeAreaView>
        );
    }

    const groupedExpenses = groupExpensesByDate(expenses);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Harcamalar</Text>
                <Text style={styles.totalAmount}>
                    Toplam: {getTotalAmount().toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </Text>
            </View>

            {/* Kategori Filtreleri */}
            <FlatList
                horizontal
                data={[{ id: 0, name: 'Tümü', icon: '📊', color: Colors.primary }, ...categories]}
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilter}
                contentContainerStyle={styles.categoryFilterContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            (selectedCategory === item.name || (item.id === 0 && !selectedCategory)) &&
                            { backgroundColor: item.color },
                        ]}
                        onPress={() => setSelectedCategory(item.id === 0 ? null : item.name)}
                    >
                        <Text style={styles.filterChipIcon}>{item.icon}</Text>
                        <Text style={[
                            styles.filterChipText,
                            (selectedCategory === item.name || (item.id === 0 && !selectedCategory)) &&
                            { color: Colors.text },
                        ]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Harcama Listesi */}
            {expenses.length === 0 ? (
                <EmptyState
                    icon="📝"
                    title="Harcama Bulunamadı"
                    message={selectedCategory
                        ? `"${selectedCategory}" kategorisinde harcama yok.`
                        : 'Henüz harcama eklemediniz.'}
                />
            ) : (
                <FlatList
                    data={groupedExpenses}
                    keyExtractor={item => item.date}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.dateGroup}>
                            <ExpenseListHeader title={formatDateHeader(item.date)} total={item.total} />
                            {item.expenses.map(expense => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    onDelete={() => handleDelete(expense)}
                                />
                            ))}
                        </View>
                    )}
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            )}
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
        paddingBottom: Spacing.md,
    },
    title: {
        ...Typography.h1,
        color: Colors.text,
    },
    totalAmount: {
        ...Typography.body,
        color: Colors.primary,
        marginTop: Spacing.xs,
    },
    categoryFilter: {
        maxHeight: 50,
        marginBottom: Spacing.md,
    },
    categoryFilterContent: {
        paddingHorizontal: Spacing.lg,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.full,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginRight: Spacing.sm,
    },
    filterChipIcon: {
        fontSize: 14,
        marginRight: Spacing.xs,
    },
    filterChipText: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
    },
    dateGroup: {
        marginBottom: Spacing.md,
    },
});

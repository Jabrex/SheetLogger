import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Keyboard,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/constants/theme';
import { Button, Card, InputCard, LoadingOverlay } from '../../src/components/Common';
import { CategoryPicker } from '../../src/components/CategoryPicker';
import { addExpense, getDefaultCategories } from '../../src/services/api';
import { getWebhookUrl } from '../../src/utils/storage';
import { Category, ExpenseFormData } from '../../src/types';

export default function AddExpenseScreen() {
    const router = useRouter();
    const categories = getDefaultCategories();

    const [loading, setLoading] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [webhookConfigured, setWebhookConfigured] = useState(true);

    const [formData, setFormData] = useState<ExpenseFormData>({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    useEffect(() => {
        checkWebhook();
    }, []);

    const checkWebhook = async () => {
        const url = await getWebhookUrl();
        setWebhookConfigured(!!url);
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setFormData({ ...formData, category: category.name });
        setShowCategoryPicker(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleAmountChange = (text: string) => {
        // Sadece sayı ve nokta/virgül kabul et
        const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
        setFormData({ ...formData, amount: cleaned });
    };

    const handleSubmit = async () => {
        // Validasyon
        if (!formData.category) {
            Alert.alert('Hata', 'Lütfen bir kategori seçin');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
            const result = await addExpense(formData);

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    'Başarılı! ✅',
                    result.message || 'Harcama başarıyla eklendi',
                    [
                        {
                            text: 'Tamam',
                            onPress: () => {
                                // Formu sıfırla
                                setFormData({
                                    category: '',
                                    description: '',
                                    amount: '',
                                    date: new Date().toISOString().split('T')[0],
                                });
                                setSelectedCategory(null);
                                // Dashboard'a yönlendir
                                router.push('/(tabs)');
                            },
                        },
                    ]
                );
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Hata', result.error || 'Harcama eklenemedi');
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Hata', error.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (!webhookConfigured) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <Text style={styles.warningTitle}>Webhook Gerekli</Text>
                    <Text style={styles.warningText}>
                        Harcama eklemek için önce Ayarlar sayfasından Google Apps Script webhook URL'sini yapılandırın.
                    </Text>
                    <Button
                        title="Ayarlara Git"
                        onPress={() => router.push('/(tabs)/settings')}
                        style={{ marginTop: Spacing.lg }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LoadingOverlay visible={loading} message="Ekleniyor..." />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Yeni Harcama</Text>
                    <Text style={styles.subtitle}>Harcamanızı kaydedin</Text>
                </View>

                {/* Tutar Girişi */}
                <Card style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Tutar</Text>
                    <View style={styles.amountInputContainer}>
                        <TextInput
                            style={styles.amountInput}
                            value={formData.amount}
                            onChangeText={handleAmountChange}
                            placeholder="0,00"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="decimal-pad"
                            autoFocus
                        />
                        <Text style={styles.currencySymbol}>₺</Text>
                    </View>
                </Card>

                {/* Form Alanları */}
                <View style={styles.formSection}>
                    {/* Kategori */}
                    <InputCard
                        label="Kategori"
                        value={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
                        placeholder="Kategori seçin"
                        icon="📁"
                        onPress={() => setShowCategoryPicker(true)}
                        style={styles.formItem}
                    />

                    {/* Açıklama */}
                    <View style={styles.formItem}>
                        <Text style={styles.inputLabel}>📝 Açıklama</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Harcama açıklaması (isteğe bağlı)"
                            placeholderTextColor={Colors.textMuted}
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Tarih */}
                    <InputCard
                        label="Tarih"
                        value={formatDate(formData.date)}
                        icon="📅"
                        style={styles.formItem}
                    />
                </View>

                {/* Hızlı Tutar Seçenekleri */}
                <View style={styles.quickAmounts}>
                    <Text style={styles.quickAmountsLabel}>Hızlı Seçim</Text>
                    <View style={styles.quickAmountsRow}>
                        {[50, 100, 200, 500].map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={styles.quickAmountButton}
                                onPress={() => {
                                    setFormData({ ...formData, amount: amount.toString() });
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text style={styles.quickAmountText}>{amount} ₺</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Kaydet Butonu */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Harcamayı Kaydet"
                        onPress={handleSubmit}
                        size="lg"
                        disabled={!formData.category || !formData.amount}
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Kategori Picker Modal */}
            <CategoryPicker
                visible={showCategoryPicker}
                categories={categories}
                selectedCategory={formData.category}
                onSelect={handleCategorySelect}
                onClose={() => setShowCategoryPicker(false)}
            />
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
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    amountCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    amountLabel: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountInput: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.text,
        minWidth: 150,
        textAlign: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: Spacing.sm,
    },
    formSection: {
        paddingHorizontal: Spacing.lg,
    },
    formItem: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    textInput: {
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.text,
        ...Typography.body,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    quickAmounts: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
    },
    quickAmountsLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    quickAmountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAmountButton: {
        flex: 1,
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        marginHorizontal: Spacing.xs,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    quickAmountText: {
        ...Typography.body,
        color: Colors.text,
        fontWeight: '500',
    },
    buttonContainer: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
    },
    warningContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    warningIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    warningTitle: {
        ...Typography.h2,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    warningText: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});

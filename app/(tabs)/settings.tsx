import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/constants/theme';
import { Button, Card } from '../../src/components/Common';
import { getSettings, saveSettings, getWebhookUrl, saveWebhookUrl } from '../../src/utils/storage';
import { validateWebhookUrl } from '../../src/services/api';
import { AppSettings } from '../../src/types';

export default function SettingsScreen() {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const saved = await getSettings();
        setSettings(saved);
        setWebhookUrl(saved.webhookUrl);
        if (saved.webhookUrl) {
            setIsValidUrl(true);
        }
    };

    const handleSaveWebhook = async () => {
        if (!webhookUrl.trim()) {
            Alert.alert('Hata', 'Lütfen webhook URL girin');
            return;
        }

        if (!webhookUrl.startsWith('https://script.google.com/')) {
            Alert.alert('Hata', 'Geçersiz URL. URL "https://script.google.com/" ile başlamalıdır.');
            return;
        }

        setValidating(true);

        try {
            const isValid = await validateWebhookUrl(webhookUrl);

            if (isValid) {
                await saveWebhookUrl(webhookUrl);
                setIsValidUrl(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Başarılı! ✅', 'Webhook URL başarıyla kaydedildi ve doğrulandı.');
            } else {
                setIsValidUrl(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                    'Doğrulama Başarısız',
                    'Webhook URL\'sine bağlanılamadı. Lütfen URL\'nin doğru olduğundan ve Apps Script\'in deploy edildiğinden emin olun.'
                );
            }
        } catch (error) {
            setIsValidUrl(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Hata', 'Webhook doğrulanırken bir hata oluştu.');
        } finally {
            setValidating(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Verileri Temizle',
            'Tüm yerel ayarlar silinecek. Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    style: 'destructive',
                    onPress: async () => {
                        await saveSettings({
                            webhookUrl: '',
                            theme: 'dark',
                            currency: '₺',
                        });
                        setWebhookUrl('');
                        setIsValidUrl(null);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Başarılı', 'Tüm ayarlar temizlendi.');
                    },
                },
            ]
        );
    };

    const openSetupGuide = () => {
        Alert.alert(
            'Kurulum Rehberi',
            '1. Google Sheets oluşturun\n2. Uzantılar → Apps Script açın\n3. Code.gs kodunu yapıştırın\n4. Deploy → New deployment\n5. Web app olarak deploy edin\n6. URL\'yi buraya yapıştırın\n\nDetaylı talimatlar için KURULUM.md dosyasına bakın.',
            [{ text: 'Tamam' }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Ayarlar</Text>
                    <Text style={styles.subtitle}>Uygulama yapılandırması</Text>
                </View>

                {/* Webhook Yapılandırması */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔗 Webhook Yapılandırması</Text>
                        <TouchableOpacity onPress={openSetupGuide}>
                            <Text style={styles.helpLink}>Nasıl yapılır?</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionDescription}>
                        Google Apps Script web app URL'sini girin. Bu URL harcamalarınızı Google Sheets'e kaydetmek için kullanılır.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                styles.urlInput,
                                isValidUrl === true && styles.urlInputValid,
                                isValidUrl === false && styles.urlInputInvalid,
                            ]}
                            value={webhookUrl}
                            onChangeText={(text) => {
                                setWebhookUrl(text);
                                setIsValidUrl(null);
                            }}
                            placeholder="https://script.google.com/macros/s/..."
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            multiline
                            numberOfLines={3}
                        />

                        {isValidUrl === true && (
                            <View style={styles.validBadge}>
                                <Text style={styles.validBadgeText}>✓ Doğrulandı</Text>
                            </View>
                        )}
                    </View>

                    <Button
                        title={validating ? 'Doğrulanıyor...' : 'Kaydet ve Doğrula'}
                        onPress={handleSaveWebhook}
                        loading={validating}
                        disabled={validating || !webhookUrl.trim()}
                    />
                </Card>

                {/* Uygulama Bilgileri */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>📱 Uygulama Bilgileri</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Uygulama</Text>
                        <Text style={styles.infoValue}>SheetLogger</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versiyon</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Platform</Text>
                        <Text style={styles.infoValue}>React Native + Expo</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Backend</Text>
                        <Text style={styles.infoValue}>Google Apps Script</Text>
                    </View>
                </Card>

                {/* Mimari */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>🏗️ Sistem Mimarisi</Text>

                    <View style={styles.architectureContainer}>
                        <View style={styles.archItem}>
                            <Text style={styles.archIcon}>📱</Text>
                            <Text style={styles.archLabel}>Android App</Text>
                        </View>
                        <Text style={styles.archArrow}>→</Text>
                        <View style={styles.archItem}>
                            <Text style={styles.archIcon}>🔗</Text>
                            <Text style={styles.archLabel}>HTTP POST</Text>
                        </View>
                        <Text style={styles.archArrow}>→</Text>
                        <View style={styles.archItem}>
                            <Text style={styles.archIcon}>⚡</Text>
                            <Text style={styles.archLabel}>Apps Script</Text>
                        </View>
                        <Text style={styles.archArrow}>→</Text>
                        <View style={styles.archItem}>
                            <Text style={styles.archIcon}>📊</Text>
                            <Text style={styles.archLabel}>Sheets</Text>
                        </View>
                    </View>
                </Card>

                {/* Tehlikeli Bölge */}
                <Card style={[styles.section, styles.dangerSection]}>
                    <Text style={styles.sectionTitle}>⚠️ Tehlikeli Bölge</Text>

                    <Button
                        title="Tüm Ayarları Temizle"
                        onPress={handleClearData}
                        variant="outline"
                        style={styles.dangerButton}
                        textStyle={{ color: Colors.error }}
                    />
                </Card>

                <View style={{ height: 120 }} />
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
    section: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text,
    },
    helpLink: {
        ...Typography.bodySmall,
        color: Colors.primary,
    },
    sectionDescription: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    urlInput: {
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.text,
        ...Typography.bodySmall,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    urlInputValid: {
        borderColor: Colors.success,
    },
    urlInputInvalid: {
        borderColor: Colors.error,
    },
    validBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: Colors.success + '20',
        borderRadius: BorderRadius.sm,
        paddingVertical: 2,
        paddingHorizontal: Spacing.sm,
    },
    validBadgeText: {
        ...Typography.caption,
        color: Colors.success,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoLabel: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    infoValue: {
        ...Typography.body,
        color: Colors.text,
    },
    architectureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
    },
    archItem: {
        alignItems: 'center',
        padding: Spacing.sm,
    },
    archIcon: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    archLabel: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    archArrow: {
        fontSize: 16,
        color: Colors.primary,
        marginHorizontal: Spacing.xs,
    },
    dangerSection: {
        borderColor: Colors.error + '40',
        borderWidth: 1,
    },
    dangerButton: {
        marginTop: Spacing.md,
        borderColor: Colors.error,
    },
});

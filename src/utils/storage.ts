import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@sheetlogger_settings';
const OFFLINE_QUEUE_KEY = '@sheetlogger_offline_queue';

const DEFAULT_SETTINGS: AppSettings = {
    webhookUrl: '',
    theme: 'dark',
    currency: '₺',
};

// Ayarları kaydet
export const saveSettings = async (settings: AppSettings): Promise<void> => {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Ayarlar kaydedilemedi:', error);
        throw error;
    }
};

// Ayarları oku
export const getSettings = async (): Promise<AppSettings> => {
    try {
        const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
        if (settingsJson) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Ayarlar okunamadı:', error);
        return DEFAULT_SETTINGS;
    }
};

// Webhook URL'sini kaydet
export const saveWebhookUrl = async (url: string): Promise<void> => {
    const settings = await getSettings();
    settings.webhookUrl = url;
    await saveSettings(settings);
};

// Webhook URL'sini oku
export const getWebhookUrl = async (): Promise<string> => {
    const settings = await getSettings();
    return settings.webhookUrl;
};

// Offline kuyruğa ekle
export const addToOfflineQueue = async (data: any): Promise<void> => {
    try {
        const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        queue.push({ ...data, queuedAt: new Date().toISOString() });
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Offline kuyruğa eklenemedi:', error);
    }
};

// Offline kuyruğu oku
export const getOfflineQueue = async (): Promise<any[]> => {
    try {
        const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
        console.error('Offline kuyruk okunamadı:', error);
        return [];
    }
};

// Offline kuyruğu temizle
export const clearOfflineQueue = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
        console.error('Offline kuyruk temizlenemedi:', error);
    }
};

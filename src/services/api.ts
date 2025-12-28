import { getWebhookUrl, addToOfflineQueue } from '../utils/storage';
import { Expense, Category, SummaryData, ApiResponse, ExpenseFormData } from '../types';

// Timeout süresi (ms)
const REQUEST_TIMEOUT = 15000;

// Fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

// Yeni harcama ekle
export const addExpense = async (data: ExpenseFormData): Promise<ApiResponse<Expense>> => {
    try {
        const webhookUrl = await getWebhookUrl();

        if (!webhookUrl) {
            return { success: false, error: 'Webhook URL ayarlanmamış. Lütfen Ayarlar sayfasından ekleyin.' };
        }

        const response = await fetchWithTimeout(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                category: data.category,
                description: data.description,
                amount: parseFloat(data.amount),
                date: data.date,
            }),
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        // Offline modda kuyruğa ekle
        if (error.name === 'AbortError' || !navigator.onLine) {
            await addToOfflineQueue({
                action: 'add',
                ...data,
            });
            return {
                success: true,
                message: 'Bağlantı yok. Harcama çevrimiçi olduğunuzda eklenecek.'
            };
        }
        return { success: false, error: error.message || 'Bağlantı hatası' };
    }
};

// Harcama sil
export const deleteExpense = async (id: string): Promise<ApiResponse<null>> => {
    try {
        const webhookUrl = await getWebhookUrl();

        if (!webhookUrl) {
            return { success: false, error: 'Webhook URL ayarlanmamış' };
        }

        const response = await fetchWithTimeout(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                id: id,
            }),
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        return { success: false, error: error.message || 'Bağlantı hatası' };
    }
};

// Harcamaları listele
export const getExpenses = async (params?: {
    month?: number;
    year?: number;
    category?: string;
    limit?: number;
}): Promise<ApiResponse<Expense[]>> => {
    try {
        const webhookUrl = await getWebhookUrl();

        if (!webhookUrl) {
            return { success: false, error: 'Webhook URL ayarlanmamış' };
        }

        const queryParams = new URLSearchParams({ action: 'list' });
        if (params?.month) queryParams.append('month', params.month.toString());
        if (params?.year) queryParams.append('year', params.year.toString());
        if (params?.category) queryParams.append('category', params.category);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetchWithTimeout(`${webhookUrl}?${queryParams}`, {
            method: 'GET',
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        return { success: false, error: error.message || 'Bağlantı hatası' };
    }
};

// Aylık özet al
export const getSummary = async (month?: number, year?: number): Promise<ApiResponse<SummaryData>> => {
    try {
        const webhookUrl = await getWebhookUrl();

        if (!webhookUrl) {
            return { success: false, error: 'Webhook URL ayarlanmamış' };
        }

        const now = new Date();
        const targetMonth = month || now.getMonth() + 1;
        const targetYear = year || now.getFullYear();

        const queryParams = new URLSearchParams({
            action: 'summary',
            month: targetMonth.toString(),
            year: targetYear.toString(),
        });

        const response = await fetchWithTimeout(`${webhookUrl}?${queryParams}`, {
            method: 'GET',
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        return { success: false, error: error.message || 'Bağlantı hatası' };
    }
};

// Kategorileri al
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    try {
        const webhookUrl = await getWebhookUrl();

        if (!webhookUrl) {
            // Varsayılan kategorileri döndür
            return {
                success: true,
                data: getDefaultCategories(),
            };
        }

        const queryParams = new URLSearchParams({ action: 'categories' });

        const response = await fetchWithTimeout(`${webhookUrl}?${queryParams}`, {
            method: 'GET',
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        // Hata durumunda varsayılan kategorileri döndür
        return {
            success: true,
            data: getDefaultCategories(),
        };
    }
};

// Varsayılan kategoriler
export const getDefaultCategories = (): Category[] => [
    { id: 1, name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
    { id: 2, name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
    { id: 3, name: 'Market', icon: '🛒', color: '#45B7D1' },
    { id: 4, name: 'Faturalar', icon: '💡', color: '#96CEB4' },
    { id: 5, name: 'Eğlence', icon: '🎬', color: '#FFEAA7' },
    { id: 6, name: 'Giyim', icon: '👕', color: '#DDA0DD' },
    { id: 7, name: 'Sağlık', icon: '💊', color: '#98D8C8' },
    { id: 8, name: 'Eğitim', icon: '📚', color: '#F7DC6F' },
    { id: 9, name: 'Kira', icon: '🏠', color: '#BB8FCE' },
    { id: 10, name: 'Diğer', icon: '💰', color: '#85C1E9' },
];

// Webhook URL'sini doğrula
export const validateWebhookUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetchWithTimeout(`${url}?action=categories`, {
            method: 'GET',
        });
        const result = await response.json();
        return result.success === true;
    } catch (error) {
        return false;
    }
};

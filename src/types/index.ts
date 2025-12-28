// Temel harcama tipi
export interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    timestamp: string;
}

// Kategori tipi
export interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
}

// API yanıt tipleri
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    count?: number;
}

// Özet veri tipi
export interface SummaryData {
    month: number;
    year: number;
    totalAmount: number;
    expenseCount: number;
    categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

// Form veri tipleri
export interface ExpenseFormData {
    category: string;
    description: string;
    amount: string;
    date: string;
}

// Ayarlar tipi
export interface AppSettings {
    webhookUrl: string;
    theme: 'light' | 'dark' | 'system';
    currency: string;
}

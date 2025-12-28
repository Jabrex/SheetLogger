export const Colors = {
    // Ana renkler
    primary: '#6C63FF',
    primaryDark: '#5A52CC',
    primaryLight: '#8B85FF',

    // Arka plan renkleri
    background: '#0F0F1A',
    backgroundSecondary: '#1A1A2E',
    backgroundTertiary: '#252542',

    // Kart ve yüzey renkleri
    surface: '#16213E',
    surfaceLight: '#1F2B52',

    // Metin renkleri
    text: '#FFFFFF',
    textSecondary: '#A0A0B2',
    textMuted: '#6B6B80',

    // Durum renkleri
    success: '#4ECDC4',
    warning: '#FFEAA7',
    error: '#FF6B6B',
    info: '#45B7D1',

    // Gradient renkleri
    gradientStart: '#6C63FF',
    gradientEnd: '#4ECDC4',

    // Kenarlık renkleri
    border: '#2A2A45',
    borderLight: '#3A3A55',

    // Gölge rengi
    shadow: '#000000',

    // Kategori renkleri
    categoryColors: {
        'Yemek': '#FF6B6B',
        'Ulaşım': '#4ECDC4',
        'Market': '#45B7D1',
        'Faturalar': '#96CEB4',
        'Eğlence': '#FFEAA7',
        'Giyim': '#DDA0DD',
        'Sağlık': '#98D8C8',
        'Eğitim': '#F7DC6F',
        'Kira': '#BB8FCE',
        'Diğer': '#85C1E9',
    } as Record<string, string>,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const Typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
};

export const Shadows = {
    sm: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
};

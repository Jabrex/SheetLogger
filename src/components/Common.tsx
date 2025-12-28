import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: BorderRadius.md,
            ...Shadows.sm,
        };

        // Size styles
        switch (size) {
            case 'sm':
                baseStyle.paddingVertical = Spacing.sm;
                baseStyle.paddingHorizontal = Spacing.md;
                break;
            case 'lg':
                baseStyle.paddingVertical = Spacing.lg;
                baseStyle.paddingHorizontal = Spacing.xl;
                break;
            default:
                baseStyle.paddingVertical = Spacing.md;
                baseStyle.paddingHorizontal = Spacing.lg;
        }

        // Variant styles
        switch (variant) {
            case 'secondary':
                baseStyle.backgroundColor = Colors.backgroundTertiary;
                break;
            case 'outline':
                baseStyle.backgroundColor = 'transparent';
                baseStyle.borderWidth = 1;
                baseStyle.borderColor = Colors.primary;
                break;
            case 'ghost':
                baseStyle.backgroundColor = 'transparent';
                (baseStyle as any).shadowOpacity = 0;
                (baseStyle as any).elevation = 0;
                break;
            default:
                baseStyle.backgroundColor = Colors.primary;
        }

        if (disabled) {
            baseStyle.opacity = 0.5;
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            ...Typography.button,
            color: Colors.text,
        };

        if (variant === 'outline') {
            baseStyle.color = Colors.primary;
        }

        if (size === 'sm') {
            baseStyle.fontSize = 14;
        } else if (size === 'lg') {
            baseStyle.fontSize = 18;
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[getButtonStyle(), style]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={Colors.text} size="small" />
            ) : (
                <>
                    {icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>}
                    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {children}
        </CardComponent>
    );
};

interface InputCardProps {
    label: string;
    value: string;
    placeholder?: string;
    icon?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const InputCard: React.FC<InputCardProps> = ({
    label,
    value,
    placeholder,
    icon,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity style={[styles.inputCard, style]} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.inputCardHeader}>
                {icon && <Text style={styles.inputCardIcon}>{icon}</Text>}
                <Text style={styles.inputCardLabel}>{label}</Text>
            </View>
            <Text style={[styles.inputCardValue, !value && styles.inputCardPlaceholder]}>
                {value || placeholder}
            </Text>
        </TouchableOpacity>
    );
};

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
    if (!visible) return null;

    return (
        <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
                {message && <Text style={styles.loadingMessage}>{message}</Text>}
            </View>
        </View>
    );
};

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionLabel,
    onAction,
}) => {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>{icon}</Text>
            <Text style={styles.emptyStateTitle}>{title}</Text>
            <Text style={styles.emptyStateMessage}>{message}</Text>
            {actionLabel && onAction && (
                <Button title={actionLabel} onPress={onAction} style={{ marginTop: Spacing.lg }} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.md,
    },
    inputCard: {
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    inputCardIcon: {
        fontSize: 16,
        marginRight: Spacing.xs,
    },
    inputCardLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    inputCardValue: {
        ...Typography.body,
        color: Colors.text,
    },
    inputCardPlaceholder: {
        color: Colors.textMuted,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContent: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        ...Shadows.lg,
    },
    loadingMessage: {
        ...Typography.body,
        color: Colors.text,
        marginTop: Spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    emptyStateTitle: {
        ...Typography.h3,
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyStateMessage: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});

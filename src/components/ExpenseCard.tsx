import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { Expense, Category } from '../types';
import { CategoryBadge } from './CategoryPicker';
import { getDefaultCategories } from '../services/api';

interface ExpenseCardProps {
    expense: Expense;
    onPress?: () => void;
    onDelete?: () => void;
    currency?: string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
    expense,
    onPress,
    onDelete,
    currency = '₺',
}) => {
    const categories = getDefaultCategories();
    const category = categories.find(c => c.name === expense.category) || {
        name: expense.category,
        icon: '💰',
        color: '#85C1E9',
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Bugün';
        if (isYesterday) return 'Dün';

        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Text style={styles.icon}>{category.icon}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.description} numberOfLines={1}>
                        {expense.description || category.name}
                    </Text>
                    <Text style={styles.amount}>
                        {formatAmount(expense.amount)} {currency}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <CategoryBadge
                        name={category.name}
                        icon={category.icon}
                        color={category.color}
                        size="sm"
                    />
                    <Text style={styles.date}>{formatDate(expense.date)}</Text>
                </View>
            </View>

            {onDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

interface ExpenseListHeaderProps {
    title: string;
    total: number;
    currency?: string;
}

export const ExpenseListHeader: React.FC<ExpenseListHeaderProps> = ({
    title,
    total,
    currency = '₺',
}) => {
    return (
        <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>{title}</Text>
            <Text style={styles.listHeaderTotal}>
                {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    icon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    description: {
        ...Typography.body,
        color: Colors.text,
        flex: 1,
        marginRight: Spacing.sm,
    },
    amount: {
        ...Typography.body,
        color: Colors.text,
        fontWeight: '600',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    deleteButton: {
        marginLeft: Spacing.sm,
        padding: Spacing.xs,
    },
    deleteIcon: {
        fontSize: 18,
        opacity: 0.7,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    listHeaderTitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listHeaderTotal: {
        ...Typography.bodySmall,
        color: Colors.primary,
        fontWeight: '600',
    },
});

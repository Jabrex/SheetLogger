import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { Category } from '../types';

interface CategoryPickerProps {
    visible: boolean;
    categories: Category[];
    selectedCategory: string;
    onSelect: (category: Category) => void;
    onClose: () => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
    visible,
    categories,
    selectedCategory,
    onSelect,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Kategori Seçin</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedCategory === category.name && styles.categoryItemSelected,
                                        { borderColor: category.color },
                                    ]}
                                    onPress={() => onSelect(category)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                                        <Text style={styles.icon}>{category.icon}</Text>
                                    </View>
                                    <Text style={[
                                        styles.categoryName,
                                        selectedCategory === category.name && { color: category.color }
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

interface CategoryBadgeProps {
    name: string;
    icon: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
    name,
    icon,
    color,
    size = 'md',
}) => {
    const getSize = () => {
        switch (size) {
            case 'sm':
                return { padding: Spacing.xs, fontSize: 10, iconSize: 12 };
            case 'lg':
                return { padding: Spacing.md, fontSize: 14, iconSize: 20 };
            default:
                return { padding: Spacing.sm, fontSize: 12, iconSize: 16 };
        }
    };

    const sizeStyles = getSize();

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: color + '20',
                paddingVertical: sizeStyles.padding,
                paddingHorizontal: sizeStyles.padding * 1.5,
            }
        ]}>
            <Text style={{ fontSize: sizeStyles.iconSize, marginRight: 4 }}>{icon}</Text>
            <Text style={[styles.badgeName, { color, fontSize: sizeStyles.fontSize }]}>{name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '70%',
        paddingBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        ...Typography.h3,
        color: Colors.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.backgroundTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    scrollView: {
        padding: Spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        backgroundColor: Colors.backgroundTertiary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryItemSelected: {
        backgroundColor: Colors.surface,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    icon: {
        fontSize: 24,
    },
    categoryName: {
        ...Typography.bodySmall,
        color: Colors.text,
        textAlign: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.full,
    },
    badgeName: {
        fontWeight: '500',
    },
});

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../../src/constants/theme';

interface TabIconProps {
    icon: string;
    label: string;
    focused: boolean;
}

const TabIcon = ({ icon, label, focused }: TabIconProps) => (
    <View style={styles.tabIconContainer}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
        <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📊" label="Dashboard" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Harcamalar',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📋" label="Harcamalar" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: 'Ekle',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.addButton}>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Ayarlar',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="⚙️" label="Ayarlar" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopWidth: 0,
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
        ...Shadows.lg,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    tabIconFocused: {
        transform: [{ scale: 1.1 }],
    },
    tabLabel: {
        fontSize: 10,
        color: Colors.textMuted,
    },
    tabLabelFocused: {
        color: Colors.primary,
        fontWeight: '600',
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        ...Shadows.lg,
    },
    addButtonIcon: {
        fontSize: 32,
        color: Colors.text,
        fontWeight: '300',
        marginTop: -2,
    },
});

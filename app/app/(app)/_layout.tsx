import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.light.tint,
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import CustomTabBar from '@/components/CustomTabBar';

export default function AppLayout() {
    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="voice"
                options={{
                    title: 'Voice',
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    );
}

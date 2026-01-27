import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome, {user?.name || 'User'}!</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        padding: 24,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: Colors.light.tabIconDefault,
        marginBottom: 48,
    },
    signOutButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

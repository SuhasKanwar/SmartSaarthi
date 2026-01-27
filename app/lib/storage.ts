import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// SecureStore is not available on web, use in-memory fallback
let webStorage: Record<string, string> = {};

export async function saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
        webStorage[TOKEN_KEY] = token;
    } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
}

export async function getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return webStorage[TOKEN_KEY] || null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
    if (Platform.OS === 'web') {
        delete webStorage[TOKEN_KEY];
    } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
}

export async function saveUser(user: { id: string; email: string; name: string }): Promise<void> {
    const userJson = JSON.stringify(user);
    if (Platform.OS === 'web') {
        webStorage[USER_KEY] = userJson;
    } else {
        await SecureStore.setItemAsync(USER_KEY, userJson);
    }
}

export async function getUser(): Promise<{ id: string; email: string; name: string } | null> {
    let userJson: string | null;
    if (Platform.OS === 'web') {
        userJson = webStorage[USER_KEY] || null;
    } else {
        userJson = await SecureStore.getItemAsync(USER_KEY);
    }
    return userJson ? JSON.parse(userJson) : null;
}

export async function deleteUser(): Promise<void> {
    if (Platform.OS === 'web') {
        delete webStorage[USER_KEY];
    } else {
        await SecureStore.deleteItemAsync(USER_KEY);
    }
}

export async function clearAuthStorage(): Promise<void> {
    await deleteToken();
    await deleteUser();
}

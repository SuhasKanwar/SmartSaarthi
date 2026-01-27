import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { saveToken, getToken, saveUser, getUser, clearAuthStorage } from '@/lib/storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored user on mount
    useEffect(() => {
        async function loadStoredAuth() {
            try {
                const storedUser = await getUser();
                const storedToken = await getToken();
                if (storedUser && storedToken) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Failed to load stored auth:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadStoredAuth();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const response = await api.post('/api/auth/signin', { email, password });
            
            if (response.data.success && response.data.data) {
                const { token, user: userData } = response.data.data;
                await saveToken(token);
                await saveUser(userData);
                setUser(userData);
                return { success: true, message: 'Signed in successfully' };
            }
            
            return { success: false, message: response.data.message || 'Sign in failed' };
        } catch (error: any) {
            console.error('Sign in error:', error);
            return { success: false, message: error.response?.data?.message || 'Network error' };
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, name: string) => {
        try {
            const response = await api.post('/api/auth/signup', { email, password, name });
            
            if (response.data.success && response.data.data) {
                const { token, user: userData } = response.data.data;
                await saveToken(token);
                await saveUser(userData);
                setUser(userData);
                return { success: true, message: 'Signed up successfully' };
            }
            
            return { success: false, message: response.data.message || 'Sign up failed' };
        } catch (error: any) {
            console.error('Sign up error:', error);
            return { success: false, message: error.response?.data?.message || 'Network error' };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await api.post('/api/auth/signout');
        } catch (error) {
            console.error('Sign out API error:', error);
        } finally {
            await clearAuthStorage();
            setUser(null);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

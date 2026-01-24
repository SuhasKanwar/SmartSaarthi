import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";
import { NEXTAUTH_SECRET } from "@/lib/config";
import { AuthResponse } from "@/types/api";

export const authOptions: NextAuthOptions = {
    secret: NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                name: { label: "Name", type: "text" },
                isSignUp: { label: "Is Sign Up", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                try {
                    const isSignUp = credentials.isSignUp === "true";
                    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";

                    const payload = isSignUp
                        ? { email: credentials.email, password: credentials.password, name: credentials.name }
                        : { email: credentials.email, password: credentials.password };

                    const response = await api.post<AuthResponse>(endpoint, payload);

                    if (response.data.success && response.data.data?.user) {
                        const user = response.data.data.user;
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                        };
                    }

                    throw new Error(response.data.message || "Authentication failed");
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        throw new Error(error.message || "Authentication failed");
                    }
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
};
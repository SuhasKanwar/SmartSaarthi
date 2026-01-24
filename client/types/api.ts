export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
}
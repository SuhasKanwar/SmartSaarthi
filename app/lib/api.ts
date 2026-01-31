import axios from "axios";
import { HTTP_SERVER_BASE_URL, MICROSERVICE_BASE_URL } from "./config";
import { getToken } from "./storage";

export const api = axios.create({
    baseURL: HTTP_SERVER_BASE_URL,
});

api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('Authentication error - token may be expired');
        }
        return Promise.reject(error);
    }
);

export const microserviceApi = axios.create({
    baseURL: MICROSERVICE_BASE_URL,
});

export const createConversation = async () => {
    try {
        const response = await api.post('/api/chat/conversation');
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
};

export const getConversations = async () => {
    try {
        const response = await api.get('/api/chat/conversation');
        return response.data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
}

export const deleteConversation = async (id: string) => {
    try {
        const response = await api.delete(`/api/chat/conversation/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};

export const renameConversation = async (id: string, title: string) => {
    try {
        const response = await api.put(`/api/chat/conversation/${id}`, { title });
        return response.data;
    } catch (error) {
        console.error("Error renaming conversation:", error);
        throw error;
    }
};

export const getConversationMessages = async (id: string) => {
    try {
        const response = await api.get(`/api/chat/conversation/${id}/messages`);
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const sendMessage = async (conversationId: string, content: string, file?: any) => {
    try {
        // Use FormData to support files
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        formData.append('content', content || ""); // Ensure content is string

        if (file) {
            // file object from expo-document-picker: { uri, name, mimeType }
            // React Native FormData expects { uri, name, type }
            formData.append('files', {
                uri: file.uri,
                name: file.name || 'upload.bin',
                type: file.mimeType || 'application/octet-stream'
            } as any);
        }

        const response = await api.post('/api/chat/message', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

import axios from 'axios';
import FormData from 'form-data';
import { MICROSERVICE_BASE_URL } from './config';

export interface SessionMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface MicroserviceFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

export interface MicroserviceResponse {
    content: string;
    location?: { lat: number; lng: number };
    action?: string;
    place_name?: string;
    address?: string;
}

export const generateChatResponse = async (
    prompt: string,
    history: SessionMessage[],
    files: MicroserviceFile[] = [],
    location?: { lat: number; lng: number }
): Promise<MicroserviceResponse> => {
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('session_history', JSON.stringify(history));

        if (location) {
            formData.append('location', JSON.stringify(location));
        }

        files.forEach((file) => {
            formData.append('files', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        });

        const response = await axios.post(`${MICROSERVICE_BASE_URL}/generate-chat`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        if (response.data && response.data.response) {
            // Handle both string (legacy/error) and object (structured) responses
            const resp = response.data.response;
            if (typeof resp === 'string') {
                return { content: resp };
            }
            return resp as MicroserviceResponse;
        } else {
            throw new Error("Invalid response format from microservice");
        }
    } catch (error) {
        console.error("Error calling microservice:", error);
        throw error;
    }
};

import axios from "axios";
import { HTTP_SERVER_BASE_URL, MICROSERVICE_BASE_URL } from "./config";
import { getToken } from "./storage";

export const api = axios.create({
    baseURL: HTTP_SERVER_BASE_URL,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - could trigger logout here
            console.log('Authentication error - token may be expired');
        }
        return Promise.reject(error);
    }
);

export const microserviceApi = axios.create({
    baseURL: MICROSERVICE_BASE_URL,
});
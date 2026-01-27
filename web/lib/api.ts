import axios from "axios";
import { HTTP_SERVER_BASE_URL, MICROSERVICE_BASE_URL } from "./config";

export const api = axios.create({
    baseURL: HTTP_SERVER_BASE_URL,
    withCredentials: true,
});

export const microserviceApi = axios.create({
    baseURL: MICROSERVICE_BASE_URL,
});
export const PORT: number = Number(process.env.PORT) || 9000;
export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const NODE_ENV: string = process.env.NODE_ENV || "production";
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";
export const MICROSERVICE_BASE_URL: string = process.env.MICROSERVICE_BASE_URL || "http://localhost:8000";
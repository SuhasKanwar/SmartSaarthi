import { PrismaClient } from "../generated/prisma/client";
import { Request, Express } from 'express';

declare global {
  var __prisma: PrismaClient | undefined;
  namespace Express {
    interface Request {
        userId?: string;
        name?: string;
    }
  }
}


declare module 'express' {
    interface Request {
        userId?: string;
        name?: string;
    }
}
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../lib/config";

export function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Support both cookie-based auth (web) and Bearer token auth (mobile)
        let token = req.cookies.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: "No token provided"
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded.userId) {
            req.userId = decoded.userId;
            req.name = decoded.name;
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid token"
            });
            return;
        }
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: err
        });
    }
}
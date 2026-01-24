import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../lib/config";

export async function signinHandler(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            res.json({
                success: false,
                message: "User not found"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.json({
                success: false,
                message: "Invalid password"
            });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.cookie("token", token, {
            httpOnly: NODE_ENV === "production",
            secure: NODE_ENV === "production",
            sameSite: "lax"
        });

        res.json({
            success: true,
            message: "User signed in successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        });
    }
    catch (err) {
        res.json({
            success: false,
            message: "Error signing in user",
            error: err
        });
    }
}

export async function signupHandler(req: Request, res: Response) {
    try {
        const { email, name, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            res.json({
                success: false,
                message: "User already exists"
            });
            return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                passwordHash: passwordHash
            }
        });

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);

        res.cookie("token", token, {
            httpOnly: NODE_ENV === "production",
            secure: NODE_ENV === "production",
            sameSite: "lax"
        });

        res.json({
            success: true,
            message: "User signed up successfully",
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name
                }
            }
        });
    }
    catch (err) {
        res.json({
            success: false,
            message: "Error signing in user",
            error: err
        });
    }
}

export function signoutHandler(req: Request, res: Response) {
    try {
        res.clearCookie("token");
        res.json({
            success: true,
            message: "User signed out successfully"
        });
    }
    catch (err) {
        res.json({
            success: false,
            message: "Error signing in user",
            error: err
        });
    }
}
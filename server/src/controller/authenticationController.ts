import { Request, Response } from "express";

export function signinHandler(req: Request, res: Response) {
    try {
    }
    catch (err) {
        res.json({
            success: false,
            message: "Error signing in user",
            error: err
        });
    }
}

export function signupHandler(req: Request, res: Response) {
    try {
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
    }
    catch (err) {
        res.json({
            success: false,
            message: "Error signing in user",
            error: err
        });
    }
}
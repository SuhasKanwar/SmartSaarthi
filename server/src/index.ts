import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import { PORT } from "./lib/config";

const app = express();


app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "SmartSaarthi server is running!!!"
    })
    return;
});

import authRouter from "./routes/authRouter";
import chatRouter from "./routes/chatRouter";
import { authenticateMiddleware } from "./middlewares/authentication";
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server ->", err);
    } else {
        console.log(`Server is running on port -> ${PORT}`);
    }
});
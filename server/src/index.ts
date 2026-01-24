import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./lib/config";

const app = express();

app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "SmartSaarthi server is running!!!"
    })
    return;
});

import authRouter from "./routes/authRouter";
app.use('/api/auth', authRouter);

app.listen(PORT, (err) => {
    if(err) {
        console.error("Error starting server ->", err);
        console.log(`Server is running on port -> ${PORT}`);
    } else {
    }
});
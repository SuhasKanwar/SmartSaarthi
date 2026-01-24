import express, { Request, Response } from "express";
import cors from "cors";
import { PORT } from "./lib/config";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "SmartSaarthi server is running!!!"
    })
    return;
});


app.listen(PORT, (err) => {
    if(err) {
        console.error("Error starting server ->", err);
        console.log(`Server is running on port -> ${PORT}`);
    } else {
    }
});
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
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.get('/api/user', (req: Request, res: Response) => {
    try {
        res.json({
            success: true,
            message: "User fetched successfully",
            data: {
                profile: {
                    id: "BS-USER-8821",
                    name: "Suhas Kanwar",
                    phoneNumber: "+91 98765 43210",
                    email: "suhas.kanwar@gmail.com",
                    vehicleNumber: "DL-3S-CX-4421",
                    vehicleModel: "Mahindra Treo",
                    kycStatus: "VERIFIED",
                    accountStatus: "ACTIVE",
                    joinedDate: "2023-11-15T10:00:00Z"
                },
                wallet: {
                    balance: 450.50,
                    currency: "INR",
                    lastTransactionDate: "2024-01-29T14:30:00Z"
                },
                statistics: {
                    totalSwaps: 142,
                    totalDistanceKm: 6850,
                    co2SavedKg: 520,
                    fuelSavedLitres: 340
                },
                invoices: [
                    {
                        invoiceId: "INV-2024-JAN-05",
                        date: "2024-01-30T18:45:00Z",
                        amount: 120.00,
                        status: "PAID",
                        type: "SWAP",
                        stationName: "Mayur Vihar Phase 1 Station",
                        url: "https://smartsaarthi-bucket.s3.ap-south-1.amazonaws.com/INV-2024-JAN-02.pdf"
                    },
                    {
                        invoiceId: "INV-2024-JAN-04",
                        date: "2024-01-28T09:15:00Z",
                        amount: 120.00,
                        status: "PAID",
                        type: "SWAP",
                        stationName: "Laxmi Nagar Hub",
                        url: "https://smartsaarthi-bucket.s3.ap-south-1.amazonaws.com/INV-2024-JAN-03.pdf"
                    },
                    {
                        invoiceId: "INV-2024-JAN-03",
                        date: "2024-01-25T13:20:00Z",
                        amount: 500.00,
                        status: "PAID",
                        type: "WALLET_RECHARGE",
                        paymentMethod: "UPI",
                        url: "https://smartsaarthi-bucket.s3.ap-south-1.amazonaws.com/INV-2024-JAN-04.pdf"
                    },
                    {
                        invoiceId: "INV-2024-JAN-02",
                        date: "2024-01-25T13:10:00Z",
                        amount: 110.00,
                        status: "PAID",
                        type: "SWAP",
                        stationName: "Noida Sec 18 Point",
                        url: "https://smartsaarthi-bucket.s3.ap-south-1.amazonaws.com/INV-2024-JAN-05.pdf"
                    },
                    {
                        invoiceId: "INV-2024-JAN-01",
                        date: "2024-01-22T08:30:00Z",
                        amount: 120.00,
                        status: "PAID",
                        type: "SWAP",
                        stationName: "Mayur Vihar Phase 1 Station",
                        url: "https://smartsaarthi-bucket.s3.ap-south-1.amazonaws.com/INV-2024-JAN-05.pdf"
                    }
                ],
                upcomingDues: {
                    amount: 0.00,
                    dueDate: null
                },
                subscription: {
                    planName: "Premium",
                    status: "ACTIVE",
                    autoRenew: true,
                    billingCycle: "ANNUAL",
                    price: 2999.00,
                    currency: "INR",
                    validFrom: "2024-01-01T00:00:00Z",
                    validTo: "2025-01-01T00:00:00Z",
                    nextRenewalDate: "2025-01-01T00:00:00Z",
                    renewals: [
                        {
                            renewalId: "RNL-2024-01-01",
                            date: "2024-01-01T00:00:00Z",
                            amount: 2999.00,
                            method: "UPI",
                            status: "SUCCESS"
                        }
                    ],
                    pricingClarification: "Premium plan (₹2,999/year) includes unlimited swaps up to 300 km/month. Taxes and extra distance charges apply. Auto-renew enabled; cancellations before nextRenewalDate prevent further charges. Refunds are prorated based on remaining days."
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: err
        });
    }
});

app.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server ->", err);
    } else {
        console.log(`Server is running on port -> ${PORT}`);
    }
});
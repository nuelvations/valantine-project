import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import appRoutes from "@/routes/app.routes";
import { PORT, DB_URL } from "@/utils/env.utils";

dotenv.config({ quiet: true });

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "https://val-connect.vercel.app"] }));
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api", appRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "Server is up and running, yay! " });
});

mongoose.connect(DB_URL as string)
    .then(() => {
        console.log('Connected to the DB')
        app.listen(PORT, () => {
            console.log(`Server connected to port ${PORT}`)
        })
    })
    .catch((error) => console.log({ "Error": error }));

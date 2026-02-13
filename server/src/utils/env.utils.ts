import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const DB_URL = process.env.DB_URL as string;

export const PORT = process.env.PORT || 9800;
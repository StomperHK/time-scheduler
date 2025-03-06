import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();
export const sql = neon(process.env.DATABASE_URL);

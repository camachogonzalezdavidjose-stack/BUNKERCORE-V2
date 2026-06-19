import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_AcCkMF3U0JPB@ep-raspy-fog-a6rsudxc.us-west-2.aws.neon.tech/neondb?sslmode=require",
        ssl: {
            rejectUnauthorized: false // Requerido para conexiones seguras a Neon DB desde Termux
        }
    }),
    socialProviders: {
        // Deshabilitados temporalmente para evitar warnings
    }
});

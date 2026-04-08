import { config } from "dotenv";
import { z } from "zod";

// Load .env file (safe — does not overwrite existing process.env vars)
config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  PORT: z.coerce.number().default(3001),

  // Database — optional so tests can run without a real DB
  DATABASE_URL: z.string().url().optional(),

  // Optional services
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(1).optional(),
  ML_SERVICE_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

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

  // Optional services. Empty strings are coerced to undefined so that
  // docker-compose's `${VAR:-}` default (which expands to "") doesn't fail validation.
  REDIS_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  JWT_SECRET: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  ML_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
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

import { config } from "dotenv";
import { z } from "zod";

// Load .env file (safe — does not overwrite existing process.env vars)
config();

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  PORT: z.coerce.number().default(3001),

  // Database — optional so unit tests can run without a real DB.
  // Integration tests inject DATABASE_URL via tests/setup.ts.
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

  // Auth / hashing
  BCRYPT_ROUNDS: z.coerce.number().int().min(1).max(20).default(12),
  JWT_EXPIRES_IN: z.string().default("24h"),

  // Admin seed (read by db:seed script only)
  ADMIN_EMAIL: z
    .string()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  ADMIN_PASSWORD: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const parsed = baseSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

// Production-only enforcement: JWT_SECRET MUST be ≥32 chars in prod.
// In dev/test we accept any non-empty value (or even undefined for unit tests).
if (parsed.data.NODE_ENV === "production") {
  const secret = parsed.data.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error(
      "JWT_SECRET must be set and at least 32 characters in production"
    );
    process.exit(1);
  }
}

export const env = parsed.data;
export type Env = typeof env;

// Vitest global setup. Runs BEFORE any test file is imported, so any module
// that reads process.env at top-level (like src/config/env.ts) sees these
// values. Do NOT import application code here.

process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-secret-32chars-padding-padding-x";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "4";

// Integration tests need a real Postgres. The default points at the
// docker-compose postgres container exposed on host port 5433.
// CI overrides this with its own service container DATABASE_URL.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://smart_inv:smart_inv@localhost:5433/smart_inv_test";

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL must be set to run drizzle-kit");
}

export default defineConfig({
  // Glob over individual schema files — drizzle-kit uses CJS resolution and
  // does not understand `.js` extension imports inside index.ts barrel files.
  schema: "./src/db/schema/{users,products}.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  strict: true,
  verbose: true,
});

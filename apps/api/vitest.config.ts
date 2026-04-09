import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // setupFiles run BEFORE any test file is imported, so they can set
    // process.env vars that the app's env.ts (loaded at module init) requires.
    setupFiles: ["./tests/setup.ts"],
    // Integration tests share a single Postgres connection — running them
    // serially avoids cross-test interference on truncate.
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
    },
  },
});

import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import { initSentry } from "./adapters/sentry.js";
import logger from "./adapters/logger.js";
import { healthHandler } from "./middleware/health.js";

// Initialize Sentry at startup (no-op when SENTRY_DSN is absent)
initSentry();

export const app: Express = express();

// Middleware
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.get("/health", healthHandler);

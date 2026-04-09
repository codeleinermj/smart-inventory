import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import { initSentry } from "./adapters/sentry.js";
import logger from "./adapters/logger.js";
import { healthHandler } from "./middleware/health.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authRouter } from "./routes/auth.routes.js";
import { productsRouter } from "./routes/products.routes.js";

// Initialize Sentry at startup (no-op when SENTRY_DSN is absent)
initSentry();

export const app: Express = express();

// Middleware
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.get("/health", healthHandler);
app.use("/auth", authRouter);
app.use("/products", productsRouter);

// 404 + central error handler — must be LAST
app.use(notFoundHandler);
app.use(errorHandler);

import * as Sentry from "@sentry/node";
import { env } from "../config/env.js";
import logger from "./logger.js";

export function initSentry(): void {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
    logger.info("Sentry initialized");
  } else {
    logger.info("Sentry disabled (no DSN)");
  }
}

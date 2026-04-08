import pino from "pino";
import { env } from "../config/env.js";

// JSON-only output. Spec CAP-6 mandates structured JSON logs.
// If pretty-printing is desired locally, pipe through `pino-pretty` at the shell.
const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "api",
    env: env.NODE_ENV,
  },
});

export default logger;

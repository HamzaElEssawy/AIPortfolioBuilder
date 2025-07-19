import pino from "pino";
import { env } from "./env";

// Create base logger with appropriate configuration
export const logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
    },
  } : undefined,
});

// Helper to create request-scoped logger
export function withReq(reqId: string) {
  return logger.child({ reqId });
}

// Helper to create module-scoped logger
export function withModule(module: string) {
  return logger.child({ module });
}
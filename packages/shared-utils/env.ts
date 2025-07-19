import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number).default("5000"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SESSION_SECRET: z.string().min(32).default("default-session-secret-change-in-production"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("admin"),
});

export type Environment = z.infer<typeof envSchema>;

function validateEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("Environment validation failed:", error);
    process.exit(1);
  }
}

export const env = validateEnvironment();
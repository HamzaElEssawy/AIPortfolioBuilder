import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock process.env before importing
const mockProcessEnv = {
  PORT: "3000",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/testdb",
  NODE_ENV: "test",
  SESSION_SECRET: "test-secret-key-with-enough-length",
  ADMIN_USERNAME: "testadmin",
  ADMIN_PASSWORD: "testpass"
};

// Mock console.error to prevent error logging during tests
const mockConsoleError = vi.fn();
global.console.error = mockConsoleError;

describe("Environment Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.env mock
    Object.keys(mockProcessEnv).forEach(key => {
      process.env[key] = mockProcessEnv[key as keyof typeof mockProcessEnv];
    });
  });

  it("validates valid environment variables", async () => {
    // Dynamically import to ensure mocks are applied
    const { env } = await import("../env");
    
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/testdb");
    expect(env.NODE_ENV).toBe("test");
    expect(env.SESSION_SECRET).toBe("test-secret-key-with-enough-length");
    expect(env.ADMIN_USERNAME).toBe("testadmin");
    expect(env.ADMIN_PASSWORD).toBe("testpass");
  });

  it("uses default values for optional variables", async () => {
    delete process.env.SESSION_SECRET;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    
    // Clear the module cache to force re-evaluation
    vi.resetModules();
    const { env } = await import("../env");
    
    expect(env.SESSION_SECRET).toBe("default-session-secret-change-in-production");
    expect(env.ADMIN_USERNAME).toBe("admin");
    expect(env.ADMIN_PASSWORD).toBe("admin");
  });

  it("converts PORT string to number", async () => {
    process.env.PORT = "8080";
    vi.resetModules();
    const { env } = await import("../env");
    
    expect(typeof env.PORT).toBe("number");
    expect(env.PORT).toBe(8080);
  });

  it("throws error for invalid environment", async () => {
    delete process.env.DATABASE_URL;
    vi.resetModules();
    
    expect(async () => {
      await import("../env");
    }).rejects.toThrow("Environment validation failed");
  });
});
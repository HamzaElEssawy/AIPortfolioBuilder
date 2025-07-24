import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
vi.mock("../../packages/shared-utils/env", () => ({
  env: {
    PORT: 5000,
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NODE_ENV: "test",
    SESSION_SECRET: "test-secret",
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "admin"
  }
}));

// Mock logger to prevent console spam during tests
vi.mock("../../packages/shared-utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  },
  withReq: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })),
  withModule: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Reset all mocks before each test
import { beforeEach } from "vitest";
beforeEach(() => {
  vi.clearAllMocks();
});
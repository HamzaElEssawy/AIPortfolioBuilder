import { vi } from "vitest";

/**
 * Test utilities for the monorepo testing suite
 */

// Mock Express Request object for testing
export const createMockRequest = (overrides: any = {}) => ({
  method: "GET",
  path: "/test",
  headers: {},
  body: {},
  params: {},
  query: {},
  ...overrides
});

// Mock Express Response object for testing
export const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    headersSent: false
  };
  return res;
};

// Mock Next function for middleware testing
export const createMockNext = () => vi.fn();

// Helper to wait for async operations in tests
export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to create test database URL
export const createTestDatabaseUrl = (dbName: string = "test") => 
  `postgresql://test:test@localhost:5432/${dbName}`;

// Common test constants
export const TEST_CONSTANTS = {
  VALID_EMAIL: "test@example.com",
  VALID_PASSWORD: "testPassword123",
  TEST_USER_ID: "test-user-123",
  TEST_REQUEST_ID: "req-123"
} as const;
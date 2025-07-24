import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler";
import { AppError } from "../../../../packages/shared-utils/AppError";

// Mock the logger
vi.mock("../../../../packages/shared-utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  },
  withReq: vi.fn(() => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }))
}));

describe("Error Handler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      path: "/test",
      headers: {
        "user-agent": "test-agent"
      }
    } as Partial<Request>;

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false
    };

    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("errorHandler", () => {
    it("handles AppError correctly", () => {
      const appError = new AppError("Test error", 400, "TEST_ERROR", { field: "test" });
      
      errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "TEST_ERROR",
          message: "Test error",
          details: { field: "test" }
        }
      });
    });

    it("handles generic Error correctly", () => {
      const genericError = new Error("Generic error");
      
      errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INTERNAL",
          message: "Application error occurred"
        }
      });
    });

    it("handles non-Error objects", () => {
      const stringError = new Error("String error");
      
      errorHandler(stringError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INTERNAL",
          message: "Application error occurred"
        }
      });
    });

    it("does not send response if headers already sent", () => {
      const appError = new AppError("Test error", 400);
      mockRes.headersSent = true;
      
      errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("notFoundHandler", () => {
    it("creates 404 AppError for unmatched routes", () => {
      notFoundHandler(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: "NOT_FOUND",
          message: "Route not found: GET /test"
        })
      );
    });
  });
});
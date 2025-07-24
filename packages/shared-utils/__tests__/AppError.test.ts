import { describe, it, expect } from "vitest";
import { AppError } from "../AppError";

describe("AppError", () => {
  it("creates basic AppError with message", () => {
    const error = new AppError("Test error", 400, "BAD_REQUEST");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.details).toBeUndefined();
  });

  it("creates AppError with custom code and details", () => {
    const details = { field: "email", reason: "invalid format" };
    const error = new AppError("Validation failed", 422, "VALIDATION_ERROR", details);
    
    expect(error.message).toBe("Validation failed");
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual(details);
  });

  it("creates BadRequest error correctly", () => {
    const error = AppError.badRequest("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.message).toBe("Invalid input");
  });

  it("creates Unauthorized error correctly", () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.message).toBe("Unauthorized");
  });

  it("creates Forbidden error correctly", () => {
    const error = AppError.forbidden("Access denied");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Access denied");
  });

  it("creates NotFound error correctly", () => {
    const error = AppError.notFound("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Resource not found");
  });

  it("creates Conflict error correctly", () => {
    const details = { conflict: "email already exists" };
    const error = AppError.conflict("User already exists", details);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.message).toBe("User already exists");
    expect(error.details).toEqual(details);
  });

  it("creates InternalServer error correctly", () => {
    const error = AppError.internal();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.message).toBe("Internal server error");
  });

  it("extends Error class properly", () => {
    const error = new AppError("Test error", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.stack).toBeDefined();
  });
});
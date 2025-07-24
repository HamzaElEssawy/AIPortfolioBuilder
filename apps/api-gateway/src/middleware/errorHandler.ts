import { Request, Response, NextFunction } from "express";
import { AppError, withModule } from "../../../../packages/shared-utils";

const moduleLogger = withModule("errorHandler");

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Express error handler middleware
 * Handles AppError instances and generic errors with proper formatting
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };

    moduleLogger.warn("Application error occurred", {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
      path: req.path,
      method: req.method,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle generic errors
  moduleLogger.error("Unhandled error occurred", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL",
      message: "An internal server error occurred",
    },
  };

  res.status(500).json(errorResponse);
}

/**
 * Async route wrapper that catches errors and passes them to error handler
 */
export function asyncHandler<
  T extends Request = Request,
  U extends Response = Response,
>(fn: (req: T, res: U, next: NextFunction) => Promise<any>) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler - should be used after all routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = AppError.notFound(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Validation error helper
 */
export function createValidationError(
  message: string,
  errors: Record<string, any>
): AppError {
  return AppError.badRequest(message, { validation: errors });
}

/**
 * Database error helper
 */
export function createDatabaseError(originalError: Error): AppError {
  // Don't expose internal database details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  return AppError.internal(
    "Database operation failed",
    isDevelopment ? { originalError: originalError.message } : undefined
  );
}

/**
 * Authorization error helper
 */
export function createAuthError(
  message: string = "Authentication required"
): AppError {
  return AppError.unauthorized(message);
}

/**
 * Permission error helper
 */
export function createPermissionError(
  message: string = "Insufficient permissions"
): AppError {
  return AppError.forbidden(message);
}

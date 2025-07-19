export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }

  // Common error factory methods
  static badRequest(message: string, details?: Record<string, any>) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message: string = "Unauthorized", details?: Record<string, any>) {
    return new AppError(message, 401, "UNAUTHORIZED", details);
  }

  static forbidden(message: string = "Forbidden", details?: Record<string, any>) {
    return new AppError(message, 403, "FORBIDDEN", details);
  }

  static notFound(message: string = "Not found", details?: Record<string, any>) {
    return new AppError(message, 404, "NOT_FOUND", details);
  }

  static conflict(message: string, details?: Record<string, any>) {
    return new AppError(message, 409, "CONFLICT", details);
  }

  static internal(message: string = "Internal server error", details?: Record<string, any>) {
    return new AppError(message, 500, "INTERNAL_ERROR", details);
  }
}
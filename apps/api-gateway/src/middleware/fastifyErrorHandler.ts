import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError, withModule } from '../../../../packages/shared-utils';

const moduleLogger = withModule('fastifyErrorHandler');

export interface FastifyErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Fastify error handler function
 * Use with: fastify.setErrorHandler(fastifyErrorHandler)
 */
export async function fastifyErrorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Handle AppError instances
  if (error instanceof AppError) {
    const errorResponse: FastifyErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };

    moduleLogger.warn('Application error occurred', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    });

    await reply.status(error.statusCode).send(errorResponse);
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    const errorResponse: FastifyErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          validation: error.validation,
          validationContext: error.validationContext
        }
      }
    };

    moduleLogger.warn('Validation error occurred', {
      validation: error.validation,
      validationContext: error.validationContext,
      url: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params
    });

    await reply.status(400).send(errorResponse);
    return;
  }

  // Handle generic errors - log stack trace and return 500
  moduleLogger.error('Unhandled error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    statusCode: (error as FastifyError).statusCode,
    url: request.url,
    method: request.method,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    body: request.body,
    query: request.query,
    params: request.params
  });

  const errorResponse: FastifyErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL',
      message: 'An internal server error occurred'
    }
  };

  const statusCode = (error as FastifyError).statusCode || 500;
  await reply.status(statusCode).send(errorResponse);
}

/**
 * Fastify preHandler hook to wrap route handlers with error handling
 */
export async function errorPreHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // This preHandler can be used to add request-specific error context
  // or perform authentication checks that throw AppErrors
}

/**
 * Helper to create standardized route handlers with error handling
 */
export function createRouteHandler<T = any>(
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<T>
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const result = await handler(request, reply);
      
      // Only send response if not already sent
      if (!reply.sent) {
        await reply.send(result);
      }
    } catch (error) {
      // Let Fastify's error handler deal with it
      throw error;
    }
  };
}

/**
 * Validation error helper for Fastify
 */
export function createFastifyValidationError(message: string, errors: Record<string, any>): AppError {
  return AppError.badRequest(message, { validation: errors });
}

/**
 * Route-specific error helpers
 */
export class RouteErrorHelpers {
  static notFound(resource: string = 'Resource'): AppError {
    return AppError.notFound(`${resource} not found`);
  }

  static unauthorized(message: string = 'Authentication required'): AppError {
    return AppError.unauthorized(message);
  }

  static forbidden(action: string = 'perform this action'): AppError {
    return AppError.forbidden(`You do not have permission to ${action}`);
  }

  static badRequest(message: string, details?: Record<string, any>): AppError {
    return AppError.badRequest(message, details);
  }

  static conflict(resource: string): AppError {
    return AppError.conflict(`${resource} already exists or conflicts with existing data`);
  }

  static internal(message: string = 'An unexpected error occurred'): AppError {
    return AppError.internal(message);
  }
}

/**
 * Example Fastify plugin that sets up error handling
 */
export async function errorHandlingPlugin(fastify: any) {
  // Register the error handler
  fastify.setErrorHandler(fastifyErrorHandler);

  // Register not found handler
  fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    throw AppError.notFound(`Route ${request.method} ${request.url} not found`);
  });

  // Add error helpers to fastify instance
  fastify.decorate('errors', RouteErrorHelpers);
}
// Example Fastify application using the error handler
import Fastify, { FastifyInstance } from 'fastify';
import { 
  fastifyErrorHandler, 
  createRouteHandler, 
  RouteErrorHelpers,
  errorHandlingPlugin 
} from './fastifyErrorHandler';
import { AppError } from '../../../../packages/shared-utils';

const fastify: FastifyInstance = Fastify({ logger: true });

// Register the error handling plugin
fastify.register(errorHandlingPlugin);

// Example route with proper error handling
fastify.get('/api/example/:id', createRouteHandler(async (request, reply) => {
  const { id } = request.params as { id: string };
  
  if (!id || isNaN(parseInt(id))) {
    throw AppError.badRequest('Valid ID required');
  }
  
  // Simulate some business logic
  if (parseInt(id) === 404) {
    throw RouteErrorHelpers.notFound('Item');
  }
  
  if (parseInt(id) === 403) {
    throw RouteErrorHelpers.forbidden('access this item');
  }
  
  return {
    success: true,
    data: {
      id: parseInt(id),
      name: `Item ${id}`,
      created: new Date()
    }
  };
}));

// Example POST route with validation
fastify.post('/api/example', createRouteHandler(async (request, reply) => {
  const body = request.body as any;
  
  if (!body.name) {
    throw AppError.badRequest('Name is required', { 
      validation: { name: 'Name field is missing' }
    });
  }
  
  if (body.name.length < 3) {
    throw AppError.badRequest('Name must be at least 3 characters', {
      validation: { name: 'Name too short' }
    });
  }
  
  // Simulate duplicate check
  if (body.name === 'duplicate') {
    throw RouteErrorHelpers.conflict('Item with this name');
  }
  
  return {
    success: true,
    data: {
      id: Math.random(),
      name: body.name,
      created: new Date()
    }
  };
}));

// Example route that throws generic error
fastify.get('/api/error', createRouteHandler(async (request, reply) => {
  // This will be caught by the error handler and return 500 with code: 'INTERNAL'
  throw new Error('Something went wrong in business logic');
}));

// Example admin-only route
fastify.get('/api/admin/stats', {
  preHandler: async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw RouteErrorHelpers.unauthorized('Bearer token required');
    }
    
    // In real app, validate the token
    const token = authHeader.split(' ')[1];
    if (token !== 'valid-admin-token') {
      throw RouteErrorHelpers.forbidden('access admin endpoints');
    }
  }
}, createRouteHandler(async (request, reply) => {
  return {
    success: true,
    stats: {
      users: 100,
      documents: 50,
      errors: 5
    }
  };
}));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Fastify server listening on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

export { fastify };

// Uncomment to run standalone:
// start();
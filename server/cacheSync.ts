import { cache } from './cache';
import { logger } from './logger';

interface CacheSyncOptions {
  invalidatePortfolio?: boolean;
  invalidateContent?: boolean;
  invalidateSpecific?: string[];
  broadcastUpdate?: boolean;
}

class CacheSynchronizer {
  private static instance: CacheSynchronizer;
  private clients: Set<any> = new Set();

  private constructor() {}

  static getInstance(): CacheSynchronizer {
    if (!CacheSynchronizer.instance) {
      CacheSynchronizer.instance = new CacheSynchronizer();
    }
    return CacheSynchronizer.instance;
  }

  // Register WebSocket client for real-time updates
  addClient(client: any): void {
    this.clients.add(client);
    logger.debug('Cache sync client connected', { clientCount: this.clients.size });
  }

  removeClient(client: any): void {
    this.clients.delete(client);
    logger.debug('Cache sync client disconnected', { clientCount: this.clients.size });
  }

  // Comprehensive cache invalidation for content updates
  async invalidateContentCache(options: CacheSyncOptions = {}): Promise<void> {
    const patterns = [];

    if (options.invalidatePortfolio) {
      patterns.push('route:/api/portfolio');
      patterns.push('route:/content');
      patterns.push('route:/images');
      patterns.push('route:/metrics');
      patterns.push('route:/skills');
      patterns.push('route:/timeline');
      patterns.push('route:/core-values');
    }

    if (options.invalidateContent) {
      patterns.push('route:/api/portfolio/content');
      patterns.push('route:/content/hero');
      patterns.push('route:/content/about');
    }

    if (options.invalidateSpecific) {
      patterns.push(...options.invalidateSpecific);
    }

    // Default comprehensive invalidation
    if (patterns.length === 0) {
      patterns.push('route:/api/portfolio');
      patterns.push('route:/content');
    }

    let totalInvalidated = 0;
    for (const pattern of patterns) {
      const count = cache.deletePattern(pattern);
      totalInvalidated += count;
    }

    logger.info('Cache invalidation completed', {
      patterns: patterns.length,
      entriesInvalidated: totalInvalidated,
      broadcastUpdate: options.broadcastUpdate
    });

    // Broadcast to connected clients for real-time updates
    if (options.broadcastUpdate && this.clients.size > 0) {
      this.broadcastUpdate({
        type: 'cache_invalidated',
        patterns,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Targeted cache invalidation for specific content sections
  async invalidateSection(section: string): Promise<void> {
    const patterns = [
      `route:/api/portfolio/content/${section}`,
      `route:/content/${section}`,
      `route:/images/${section}`,
      'route:/api/portfolio' // Always invalidate main portfolio cache
    ];

    let totalInvalidated = 0;
    for (const pattern of patterns) {
      const count = cache.deletePattern(pattern);
      totalInvalidated += count;
    }

    logger.info('Section cache invalidation completed', {
      section,
      patterns: patterns.length,
      entriesInvalidated: totalInvalidated
    });

    // Broadcast section update
    this.broadcastUpdate({
      type: 'section_updated',
      section,
      timestamp: new Date().toISOString()
    });
  }

  // Preemptive cache warming for critical content
  async warmCriticalContent(): Promise<void> {
    const criticalEndpoints = [
      '/api/portfolio/content/hero',
      '/api/portfolio/content/about',
      '/api/portfolio/metrics',
      '/api/portfolio/skills'
    ];

    const warmupPromises = criticalEndpoints.map(async (endpoint) => {
      try {
        // This would typically make a request to warm the cache
        logger.debug('Warming cache for endpoint', { endpoint });
      } catch (error) {
        logger.warn('Cache warming failed for endpoint', { endpoint, error });
      }
    });

    await Promise.all(warmupPromises);
    logger.info('Critical content cache warming completed', {
      endpoints: criticalEndpoints.length
    });
  }

  // Broadcast updates to connected clients
  private broadcastUpdate(update: any): void {
    const message = JSON.stringify(update);
    let successCount = 0;
    let errorCount = 0;

    this.clients.forEach((client) => {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
          successCount++;
        } else {
          this.clients.delete(client);
        }
      } catch (error) {
        errorCount++;
        this.clients.delete(client);
        logger.warn('Failed to broadcast update to client', { error });
      }
    });

    logger.debug('Update broadcast completed', {
      successCount,
      errorCount,
      totalClients: this.clients.size
    });
  }

  // Get cache statistics for monitoring
  getCacheStats(): any {
    const stats = cache.getStats();
    return {
      ...stats,
      connectedClients: this.clients.size,
      timestamp: new Date().toISOString()
    };
  }

  // Clean up expired cache entries
  async cleanup(): Promise<void> {
    // The cache manager handles its own cleanup
    logger.debug('Cache cleanup initiated');
  }
}

export const cacheSync = CacheSynchronizer.getInstance();

// Middleware to handle cache invalidation on content updates
export function cacheSyncMiddleware(section?: string) {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(body: any) {
      // Only invalidate cache on successful updates
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
          setImmediate(async () => {
            if (section) {
              await cacheSync.invalidateSection(section);
            } else {
              await cacheSync.invalidateContentCache({
                invalidatePortfolio: true,
                invalidateContent: true,
                broadcastUpdate: true
              });
            }
          });
        }
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}
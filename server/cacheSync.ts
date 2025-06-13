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

  addClient(client: any): void {
    this.clients.add(client);
    logger.debug('Cache sync client connected', { clientCount: this.clients.size });
  }

  removeClient(client: any): void {
    this.clients.delete(client);
    logger.debug('Cache sync client disconnected', { clientCount: this.clients.size });
  }

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

    if (options.broadcastUpdate && this.clients.size > 0) {
      this.broadcastUpdate({
        type: 'cache_invalidated',
        patterns,
        timestamp: new Date().toISOString()
      });
    }
  }

  async invalidateSection(section: string): Promise<void> {
    const patterns = [
      `route:/api/portfolio/content/${section}`,
      `route:/content/${section}`,
      `route:/images/${section}`,
      'route:/api/portfolio',
      'route:/content/about',
      'route:/api/portfolio/content'
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

    if (this.clients.size > 0) {
      this.broadcastUpdate({
        type: 'section_invalidated',
        section,
        patterns,
        timestamp: new Date().toISOString()
      });
    }
  }

  async warmCriticalContent(): Promise<void> {
    try {
      const criticalRoutes = [
        'route:/content/hero',
        'route:/content/about',
        'route:/api/portfolio/content'
      ];
      
      logger.debug('Warming critical content routes', { routes: criticalRoutes.length });
    } catch (error) {
      logger.error('Failed to warm critical content', { error });
    }
  }

  private broadcastUpdate(update: any): void {
    if (this.clients.size === 0) return;
    
    let successCount = 0;
    let errorCount = 0;
    
    this.clients.forEach(client => {
      try {
        if (client.readyState === 1) {
          client.send(JSON.stringify(update));
          successCount++;
        } else {
          this.clients.delete(client);
        }
      } catch (error) {
        errorCount++;
        this.clients.delete(client);
        logger.warn('Failed to broadcast to client', { error });
      }
    });

    logger.debug('Update broadcast completed', {
      successCount,
      errorCount,
      totalClients: this.clients.size
    });
  }

  getCacheStats(): any {
    const stats = cache.getStats();
    return {
      ...stats,
      connectedClients: this.clients.size,
      timestamp: new Date().toISOString()
    };
  }

  async cleanup(): Promise<void> {
    logger.debug('Cache cleanup initiated');
  }
}

export const cacheSync = CacheSynchronizer.getInstance();

export function cacheSyncMiddleware(section?: string) {
  return async (req: any, res: any, next: any) => {
    next();
  };
}
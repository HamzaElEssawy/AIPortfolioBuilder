import { logger } from './logger';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private disabledPatterns: Set<string> = new Set();
  private stats = {
    hits: 0,
    misses: 0
  };

  private constructor() {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanExpired();
    }, 5 * 60 * 1000);
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
      hits: 0
    };

    this.cache.set(key, entry);
    
    logger.debug('Cache entry set', { 
      key, 
      ttlSeconds, 
      size: JSON.stringify(data).length 
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug('Cache expired', { key });
      return null;
    }

    // Update hit count and stats
    entry.hits++;
    this.stats.hits++;
    
    logger.debug('Cache hit', { key, hits: entry.hits });
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    
    logger.info('Cache cleared', { previousSize: size });
  }

  // Cache with pattern matching
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;
    
    // Add pattern to disabled list temporarily
    this.disabledPatterns.add(pattern);
    
    // Clear matching cache entries
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    logger.info('Cache pattern delete', { pattern, deleted });
    
    // Re-enable pattern after 2 seconds to allow fresh data loading
    setTimeout(() => {
      this.disabledPatterns.delete(pattern);
      logger.info('Cache pattern re-enabled', { pattern });
    }, 2000);
    
    return deleted;
  }

  isPatternDisabled(key: string): boolean {
    for (const pattern of this.disabledPatterns) {
      const regex = new RegExp(pattern);
      if (regex.test(key)) {
        return true;
      }
    }
    return false;
  }

  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cache cleanup completed', { cleaned });
    }
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    let memoryUsage = 0;
    let oldestTimestamp = now;
    let newestTimestamp = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += JSON.stringify({ key, entry }).length;
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      memoryUsage,
      oldestEntry: oldestTimestamp === now ? 0 : now - oldestTimestamp,
      newestEntry: now - newestTimestamp
    };
  }

  // Get most accessed entries
  getTopEntries(limit: number = 10): Array<{ key: string; hits: number; age: number }> {
    const entries: Array<{ key: string; hits: number; age: number }> = [];
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        hits: entry.hits,
        age: now - entry.timestamp
      });
    }
    
    return entries
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  // Warmup cache with common queries
  async warmup(): Promise<void> {
    try {
      logger.info('Starting cache warmup');
      
      // Add common cache entries that are frequently accessed
      const commonQueries = [
        { key: 'portfolio:hero', ttl: 3600 },
        { key: 'portfolio:about', ttl: 3600 },
        { key: 'portfolio:skills', ttl: 1800 },
        { key: 'portfolio:metrics', ttl: 1800 },
        { key: 'portfolio:timeline', ttl: 3600 }
      ];
      
      for (const query of commonQueries) {
        if (!this.has(query.key)) {
          // Pre-populate with placeholder that will be replaced by actual data
          this.set(query.key, { placeholder: true }, query.ttl);
        }
      }
      
      logger.info('Cache warmup completed', { 
        entries: commonQueries.length 
      });
    } catch (error) {
      logger.error('Cache warmup failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

// Middleware for automatic caching
export function cacheMiddleware(ttlSeconds: number = 300) {
  return (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for admin routes
    if (req.path.includes('/admin/')) {
      return next();
    }

    // Skip caching if cache-bypass header is present
    if (req.headers['x-cache-bypass']) {
      logger.debug('Cache bypassed by header', { path: req.path });
      return next();
    }

    const cacheKey = `route:${req.path}:${JSON.stringify(req.query)}`;
    
    // Check if caching is disabled for this pattern
    if (cache.isPatternDisabled(cacheKey)) {
      logger.debug('Route cache disabled by pattern', { path: req.path });
      return next();
    }
    
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logger.debug('Route cache hit', { path: req.path });
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttlSeconds);
        logger.debug('Route cached', { path: req.path, ttl: ttlSeconds });
      }
      return originalJson(data);
    };

    next();
  };
}

export const cache = CacheManager.getInstance();
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  slowRequests: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  uptime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: {
    requests: Array<{ timestamp: number; responseTime: number; error: boolean; endpoint: string }>;
    startTime: number;
    lastCpuUsage?: NodeJS.CpuUsage;
  };

  private constructor() {
    this.metrics = {
      requests: [],
      startTime: Date.now(),
    };
    
    // Track CPU usage
    this.metrics.lastCpuUsage = process.cpuUsage();
    
    // Clean old metrics every 5 minutes
    setInterval(() => {
      this.cleanOldMetrics();
    }, 5 * 60 * 1000);
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private cleanOldMetrics(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics.requests = this.metrics.requests.filter(
      req => req.timestamp > oneHourAgo
    );
  }

  recordRequest(responseTime: number, isError: boolean, endpoint: string): void {
    this.metrics.requests.push({
      timestamp: Date.now(),
      responseTime,
      error: isError,
      endpoint
    });

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        endpoint,
        responseTime,
        threshold: 1000
      });
    }

    // Log performance metrics every 100 requests
    if (this.metrics.requests.length % 100 === 0) {
      const metrics = this.getMetrics();
      logger.info('Performance metrics', metrics);
    }
  }

  getMetrics(): PerformanceMetrics {
    const recentRequests = this.metrics.requests.filter(
      req => req.timestamp > Date.now() - (60 * 60 * 1000) // Last hour
    );

    const requestCount = recentRequests.length;
    const averageResponseTime = requestCount > 0 
      ? recentRequests.reduce((sum, req) => sum + req.responseTime, 0) / requestCount 
      : 0;
    
    const errorCount = recentRequests.filter(req => req.error).length;
    const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
    
    const slowRequests = recentRequests.filter(req => req.responseTime > 1000).length;
    
    const memoryUsage = process.memoryUsage();
    const uptime = (Date.now() - this.metrics.startTime) / 1000;

    let cpuUsage: NodeJS.CpuUsage | undefined;
    if (this.metrics.lastCpuUsage) {
      cpuUsage = process.cpuUsage(this.metrics.lastCpuUsage);
      this.metrics.lastCpuUsage = process.cpuUsage();
    }

    return {
      requestCount,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      memoryUsage,
      cpuUsage,
      uptime: Math.round(uptime)
    };
  }

  getSlowestEndpoints(limit = 10): Array<{ endpoint: string; averageTime: number; count: number }> {
    const endpointMetrics: Record<string, { total: number; count: number }> = {};
    
    this.metrics.requests.forEach(req => {
      if (!endpointMetrics[req.endpoint]) {
        endpointMetrics[req.endpoint] = { total: 0, count: 0 };
      }
      endpointMetrics[req.endpoint].total += req.responseTime;
      endpointMetrics[req.endpoint].count++;
    });

    return Object.entries(endpointMetrics)
      .map(([endpoint, metrics]) => ({
        endpoint,
        averageTime: Math.round(metrics.total / metrics.count),
        count: metrics.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Track original res.end
  const originalEnd = res.end.bind(res);
  
  res.end = function(chunk?: any, encoding?: BufferEncoding, cb?: () => void) {
    const responseTime = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    
    // Record metrics
    performanceMonitor.recordRequest(responseTime, isError, req.path);
    
    // Log request
    logger.logRequest(req, res, responseTime);
    
    // Call original end with proper arguments
    if (arguments.length === 0) {
      return originalEnd();
    } else if (arguments.length === 1) {
      return originalEnd(chunk);
    } else if (arguments.length === 2) {
      return originalEnd(chunk, encoding as any);
    } else {
      return originalEnd(chunk, encoding as any, cb);
    }
  };
  
  next();
}
import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  responseTime?: number;
  statusCode?: number;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private logDirectory: string;
  private maxBufferSize = 100;
  private flushInterval = 5000; // 5 seconds

  private constructor() {
    this.logDirectory = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.startPeriodicFlush();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDirectory, `${level}-${date}.log`);
  }

  private writeToFile(entry: LogEntry): void {
    try {
      const fileName = this.getLogFileName(entry.level);
      const logLine = this.formatLogEntry(entry);
      fs.appendFileSync(fileName, logLine);
    } catch (error) {
      console.error('Failed to write log entry:', error);
    }
  }

  private flush(): void {
    if (this.logBuffer.length === 0) return;

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    entries.forEach(entry => this.writeToFile(entry));
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    // Always write errors immediately
    if (level === 'error') {
      this.writeToFile(entry);
    } else {
      this.logBuffer.push(entry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.maxBufferSize) {
        this.flush();
      }
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  // API request logging
  logRequest(req: any, res: any, responseTime: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'error' : 'info',
      message: `${req.method} ${req.path}`,
      context: {
        endpoint: req.path,
        method: req.method,
        responseTime,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.session?.userId || 'anonymous'
      }
    };

    if (entry.level === 'error') {
      this.writeToFile(entry);
    } else {
      this.logBuffer.push(entry);
    }
  }

  // Get recent logs for admin dashboard
  async getRecentLogs(level?: string, limit = 100): Promise<LogEntry[]> {
    const logs: LogEntry[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    const logLevels = level ? [level] : ['info', 'warn', 'error', 'debug'];
    
    for (const logLevel of logLevels) {
      const fileName = path.join(this.logDirectory, `${logLevel}-${today}.log`);
      
      if (fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            logs.push(entry);
          } catch (error) {
            // Skip malformed log entries
          }
        });
      }
    }

    // Sort by timestamp and limit
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Performance metrics
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, {
      duration,
      operation,
      ...metadata
    });
  }

  // Security events
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      severity,
      event,
      ...context
    });
  }
}

export const logger = Logger.getInstance();
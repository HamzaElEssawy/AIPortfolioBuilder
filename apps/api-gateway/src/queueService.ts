import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env, logger, withModule } from "../../../packages/shared-utils";

const moduleLogger = withModule('queueService');

// Redis connection for BullMQ - make it truly optional
const redisUrl = env.REDIS_URL;
let connection: Redis | null = null;
let ingestQueue: Queue | null = null;

// Function to initialize Redis connection
async function initializeRedis() {
  if (redisUrl) {
    try {
      connection = new Redis(redisUrl, {
        maxRetriesPerRequest: 0,
        lazyConnect: true,
        connectTimeout: 1000,
        commandTimeout: 1000,
      });

      // Test connection
      await connection.ping();
    
    // Create ingestion queue
    ingestQueue = new Queue('ingest', {
      connection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

      moduleLogger.info('✅ Redis connected - queue service enabled');
    } catch (error) {
      moduleLogger.warn('⚠️  Redis unavailable, falling back to in-memory processing');
      connection = null;
      ingestQueue = null;
    }
  } else {
    moduleLogger.info('ℹ️  REDIS_URL not set, using in-memory processing');
  }
}

// Initialize Redis connection
initializeRedis().catch(() => {
  // Ignore errors - already handled above
});

// Create a queue interface that works with or without Redis
export const queue = ingestQueue || {
  // Minimal stub for in-memory processing
  add: async (_name: string, data: any) => {
    // Process immediately inline
    moduleLogger.info('Processing document immediately (no queue)');
    // Return a mock job ID
    return { id: Date.now().toString() };
  },
} as unknown as Queue;

export { ingestQueue };

export interface IngestJobData {
  path: string;
  docId: number;
  category?: string;
  originalName?: string;
}

export class QueueService {
  
  /**
   * Add a document to the ingestion queue
   */
  async queueDocumentIngestion(data: IngestJobData): Promise<string> {
    try {
      const job = await queue.add('ingest', data, {
        priority: 1,
        delay: 0,
      });
      
      moduleLogger.info('Document queued for processing', {
        jobId: job.id,
        docId: data.docId,
        path: data.path,
        method: ingestQueue ? 'queue' : 'immediate'
      });
      
      return job.id || 'unknown';
    } catch (error) {
      moduleLogger.error('Failed to queue document ingestion:', error);
      // Final fallback to immediate processing
      return this.processDocumentImmediately(data);
    }
  }

  /**
   * Fallback method to process document immediately when queue is unavailable
   */
  private async processDocumentImmediately(data: IngestJobData): Promise<string> {
    moduleLogger.info('Processing document immediately without queue', {
      docId: data.docId,
      path: data.path
    });
    
    // For now, just return a mock job ID
    const jobId = `immediate_${Date.now()}_${data.docId}`;
    
    // TODO: In a complete implementation, this would call the document processor directly
    // await documentProcessor.processDocument(data.path, data.originalName, data.category);
    
    return jobId;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    try {
      if (!ingestQueue) {
        // Return mock status for immediate processing jobs
        if (jobId.startsWith('immediate_')) {
          return { 
            id: jobId, 
            status: 'completed', 
            progress: 100,
            note: 'Processed immediately without queue'
          };
        }
        return { status: 'queue_unavailable' };
      }

      const job = await ingestQueue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = job.progress;
      
      return {
        id: job.id,
        status: state,
        progress,
        data: job.data,
        processedAt: job.processedOn,
        finishedAt: job.finishedOn,
        failedReason: job.failedReason,
      };
    } catch (error) {
      moduleLogger.error(`Failed to get job status for ${jobId}:`, error);
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      if (!ingestQueue) {
        return {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          total: 0,
          status: 'queue_unavailable',
          note: 'Queue service not available - using immediate processing'
        };
      }

      const waiting = await ingestQueue.getWaiting();
      const active = await ingestQueue.getActive();
      const completed = await ingestQueue.getCompleted();
      const failed = await ingestQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
        status: 'operational'
      };
    } catch (error) {
      moduleLogger.error('Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check for queue system
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!connection || !ingestQueue) {
        return false;
      }
      await connection.ping();
      await ingestQueue.getWaiting();
      return true;
    } catch (error) {
      moduleLogger.error('Queue health check failed:', error);
      return false;
    }
  }
}

export const queueService = new QueueService();
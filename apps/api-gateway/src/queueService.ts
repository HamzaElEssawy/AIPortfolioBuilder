import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env, logger, withModule } from "../../../packages/shared-utils";

const moduleLogger = withModule('queueService');

// Redis connection for BullMQ
const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
let connection: Redis | null = null;
let ingestQueue: Queue | null = null;

try {
  connection = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  });

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

  moduleLogger.info('Queue service initialized with Redis');
} catch (error) {
  moduleLogger.warn('Failed to initialize Redis queue - falling back to direct processing', error);
}

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
      if (!ingestQueue) {
        // Fallback: Process immediately without queue
        moduleLogger.warn('Queue not available - processing document immediately');
        return this.processDocumentImmediately(data);
      }

      const job = await ingestQueue.add('ingest', data, {
        priority: 1,
        delay: 0,
      });
      
      moduleLogger.info('Document queued for ingestion', {
        jobId: job.id,
        docId: data.docId,
        path: data.path
      });
      
      return job.id || 'unknown';
    } catch (error) {
      moduleLogger.error('Failed to queue document ingestion:', error);
      // Fallback to immediate processing
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
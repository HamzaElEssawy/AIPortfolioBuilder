import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../../shared/schema";
import { knowledgeBaseDocuments } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { textExtractor } from './textExtractor';
import { embeddingService } from './embeddingService';
import { vectorRepo } from '../../../packages/vector-repo';

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

// Redis connection for BullMQ
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

console.log('Starting ingestion worker...');

// Job interface
interface IngestJob {
  path: string;
  docId: number;
  category?: string;
  originalName?: string;
}

// Create the worker
const worker = new Worker(
  'ingest',
  async (job) => {
    const { path, docId, category = 'general', originalName } = job.data as IngestJob;
    
    console.log(`Processing ingestion job ${job.id} for document ${docId}`);
    
    try {
      // Update document status to processing
      await db.update(knowledgeBaseDocuments)
        .set({ 
          status: "processing",
          processedAt: new Date()
        })
        .where(eq(knowledgeBaseDocuments.id, docId));

      // Get document info from database
      const [document] = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, docId))
        .limit(1);

      if (!document) {
        throw new Error(`Document with ID ${docId} not found`);
      }

      // Determine content type
      const contentType = textExtractor.getContentType(originalName || document.originalName);
      
      // Extract text from document
      console.log(`Extracting text from ${path} (type: ${contentType})`);
      const extractionResult = await textExtractor.extractText(path, contentType);
      
      if (!extractionResult.text || extractionResult.text.trim().length === 0) {
        throw new Error('No text content extracted from document');
      }

      // Chunk the text for better embeddings
      console.log(`Chunking text (${extractionResult.text.length} characters)`);
      const chunks = await textExtractor.chunkText(extractionResult.text, {
        maxChunkSize: 1000,
        overlap: 200,
        category,
        preserveParagraphs: true
      });

      console.log(`Generated ${chunks.length} chunks for processing`);

      // Generate embeddings for each chunk
      const embeddingPromises = chunks.map(chunk => 
        embeddingService.generateEmbedding(chunk.text)
      );
      
      const embeddingResults = await Promise.all(embeddingPromises);
      
      // Prepare embeddings for storage
      const successfulEmbeddings = [];
      for (let i = 0; i < chunks.length; i++) {
        const embeddingResult = embeddingResults[i];
        if (embeddingResult.success && embeddingResult.embedding) {
          successfulEmbeddings.push({
            text: chunks[i].text,
            embedding: embeddingResult.embedding,
            documentId: docId,
            category,
            metadata: {
              ...chunks[i].metadata,
              ...extractionResult.metadata,
              chunkIndex: i,
              totalChunks: chunks.length
            }
          });
        } else {
          console.warn(`Failed to generate embedding for chunk ${i}:`, embeddingResult.error);
        }
      }

      if (successfulEmbeddings.length === 0) {
        throw new Error('No embeddings could be generated for any chunks');
      }

      // Store embeddings in vector repository
      console.log(`Storing ${successfulEmbeddings.length} embeddings in vector database`);
      const vectorIds = await vectorRepo.storeEmbeddings(successfulEmbeddings);

      // Update document with processed content and primary vector ID
      await db.update(knowledgeBaseDocuments)
        .set({
          contentText: extractionResult.text,
          vectorId: vectorIds[0] || null,
          status: vectorIds.length > 0 ? "embedded" : "processed",
          processedAt: new Date(),
          metadata: JSON.stringify({
            ...extractionResult.metadata,
            chunksProcessed: chunks.length,
            embeddingsStored: successfulEmbeddings.length,
            vectorIds: vectorIds
          })
        })
        .where(eq(knowledgeBaseDocuments.id, docId));

      console.log(`Successfully processed document ${docId}: ${successfulEmbeddings.length} embeddings stored`);
      
      return {
        docId,
        chunksProcessed: chunks.length,
        embeddingsStored: successfulEmbeddings.length,
        vectorIds,
        status: 'embedded'
      };

    } catch (error) {
      console.error(`Processing failed for document ${docId}:`, error);
      
      // Update document status to failed
      await db.update(knowledgeBaseDocuments)
        .set({ 
          status: "failed",
          processedAt: new Date(),
          metadata: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString()
          })
        })
        .where(eq(knowledgeBaseDocuments.id, docId));

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 jobs concurrently
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs for debugging
  }
);

// Worker event handlers
worker.on('ready', () => {
  console.log('Ingestion worker is ready and waiting for jobs');
});

worker.on('active', (job) => {
  console.log(`Started processing job ${job.id} for document ${job.data.docId}`);
});

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down ingestion worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Terminating ingestion worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

console.log('Ingestion worker started successfully');
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../../apps/shared/schema";
import { vectorEmbeddings } from "../../apps/shared/schema";
import { eq } from "drizzle-orm";

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

export interface EmbeddingChunk {
  text: string;
  embedding: number[];
  documentId: number;
  category: string;
  metadata?: Record<string, any>;
}

export class VectorRepository {
  
  /**
   * Store document embeddings in the database
   */
  async storeEmbeddings(chunks: EmbeddingChunk[]): Promise<number[]> {
    try {
      const vectorIds: number[] = [];
      
      for (const chunk of chunks) {
        const [result] = await db.insert(vectorEmbeddings).values({
          documentId: chunk.documentId,
          embedding: JSON.stringify(chunk.embedding),
          textContent: chunk.text,
          category: chunk.category,
          metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null,
          createdAt: new Date()
        }).returning();
        
        vectorIds.push(result.id);
      }
      
      return vectorIds;
    } catch (error) {
      console.error('Error storing embeddings:', error);
      throw new Error(`Failed to store embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store a single embedding
   */
  async storeEmbedding(
    documentId: number,
    embedding: number[],
    textContent: string,
    category: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    try {
      const [result] = await db.insert(vectorEmbeddings).values({
        documentId,
        embedding: JSON.stringify(embedding),
        textContent,
        category,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date()
      }).returning();
      
      return result.id;
    } catch (error) {
      console.error('Error storing single embedding:', error);
      throw new Error(`Failed to store embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for similar embeddings using cosine similarity
   */
  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 5,
    category?: string
  ): Promise<Array<{
    id: number;
    textContent: string;
    documentId: number;
    category: string;
    similarity: number;
    metadata?: any;
  }>> {
    try {
      // For now, return empty array as we don't have vector search implemented
      // In production, this would use pgvector or a similar solution
      console.log('Vector search not yet implemented, returning empty results');
      return [];
    } catch (error) {
      console.error('Error searching embeddings:', error);
      return [];
    }
  }

  /**
   * Get embeddings for a specific document
   */
  async getDocumentEmbeddings(documentId: number): Promise<Array<{
    id: number;
    textContent: string;
    embedding: number[];
    category: string;
    metadata?: any;
  }>> {
    try {
      const results = await db.select()
        .from(vectorEmbeddings)
        .where(eq(vectorEmbeddings.documentId, documentId));

      return results.map(result => ({
        id: result.id,
        textContent: result.textContent,
        embedding: JSON.parse(result.embedding),
        category: result.category,
        metadata: result.metadata ? JSON.parse(result.metadata) : undefined
      }));
    } catch (error) {
      console.error('Error getting document embeddings:', error);
      return [];
    }
  }

  /**
   * Delete embeddings for a document
   */
  async deleteDocumentEmbeddings(documentId: number): Promise<void> {
    try {
      await db.delete(vectorEmbeddings)
        .where(eq(vectorEmbeddings.documentId, documentId));
    } catch (error) {
      console.error('Error deleting document embeddings:', error);
      throw new Error(`Failed to delete embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const vectorRepo = new VectorRepository();
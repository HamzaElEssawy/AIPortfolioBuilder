import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../db';
import { knowledgeBaseDocuments } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface EmbeddingResult {
  embedding: number[];
  success: boolean;
  error?: string;
}

interface SimilarDocument {
  id: number;
  filename: string;
  category: string;
  contentText: string;
  similarity: number;
}

export class VectorEmbeddingService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for embeddings');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate embeddings for text using Google's embedding model
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      
      // Clean and prepare text for embedding
      const cleanText = this.preprocessText(text);
      
      const result = await model.embedContent(cleanText);
      const embedding = result.embedding.values;
      
      if (!embedding || embedding.length === 0) {
        throw new Error('Failed to generate embedding - empty result');
      }

      return {
        embedding: Array.from(embedding),
        success: true
      };
    } catch (error) {
      console.error('Embedding generation error:', error);
      return {
        embedding: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown embedding error'
      };
    }
  }

  /**
   * Store embedding for a document
   */
  async storeEmbedding(
    documentId: number, 
    embedding: number[], 
    content: string, 
    category: string
  ): Promise<string> {
    try {
      // Store embedding as JSON string in vectorId field
      const vectorId = JSON.stringify(embedding);
      
      console.log(`Storing embedding for document ${documentId}, embedding length: ${embedding.length}`);
      
      return vectorId;
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw new Error(`Failed to store embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate and store embeddings for a document
   */
  async generateDocumentEmbedding(documentId: number): Promise<boolean> {
    try {
      // Get document content
      const document = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, documentId))
        .limit(1);

      if (!document[0]) {
        throw new Error(`Document with ID ${documentId} not found`);
      }

      const doc = document[0];
      if (!doc.contentText) {
        throw new Error('Document has no content text for embedding');
      }

      // Generate embedding
      const embeddingResult = await this.generateEmbedding(doc.contentText);
      
      if (!embeddingResult.success) {
        throw new Error(`Failed to generate embedding: ${embeddingResult.error}`);
      }

      // Store embedding as JSON string in vectorId field
      const vectorId = JSON.stringify(embeddingResult.embedding);
      
      await db.update(knowledgeBaseDocuments)
        .set({ 
          vectorId,
          status: 'embedded',
          processedAt: new Date()
        })
        .where(eq(knowledgeBaseDocuments.id, documentId));

      console.log(`Successfully generated embedding for document ${documentId}`);
      return true;
    } catch (error) {
      console.error(`Error generating embedding for document ${documentId}:`, error);
      
      // Update status to failed
      await db.update(knowledgeBaseDocuments)
        .set({ status: 'failed' })
        .where(eq(knowledgeBaseDocuments.id, documentId));
        
      return false;
    }
  }

  /**
   * Find similar documents using cosine similarity
   */
  async findSimilarDocuments(query: string, limit: number = 5): Promise<SimilarDocument[]> {
    try {
      // Generate embedding for query
      const queryEmbeddingResult = await this.generateEmbedding(query);
      
      if (!queryEmbeddingResult.success) {
        throw new Error('Failed to generate query embedding');
      }

      const queryEmbedding = queryEmbeddingResult.embedding;

      // Get all documents with embeddings
      const documents = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.status, 'embedded'));

      const similarities: SimilarDocument[] = [];

      for (const doc of documents) {
        if (!doc.vectorId) continue;

        try {
          const docEmbedding = JSON.parse(doc.vectorId);
          const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
          
          similarities.push({
            id: doc.id,
            filename: doc.filename,
            category: doc.category,
            contentText: doc.contentText || '',
            similarity
          });
        } catch (parseError) {
          console.warn(`Failed to parse embedding for document ${doc.id}:`, parseError);
        }
      }

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .filter(doc => doc.similarity > 0.3); // Minimum similarity threshold
    } catch (error) {
      console.error('Error finding similar documents:', error);
      return [];
    }
  }

  /**
   * Get relevant context for AI assistant based on query
   */
  async getRelevantContext(query: string, maxDocuments: number = 3): Promise<string> {
    try {
      const similarDocs = await this.findSimilarDocuments(query, maxDocuments);
      
      if (similarDocs.length === 0) {
        return '';
      }

      const contextParts = similarDocs.map(doc => {
        const preview = doc.contentText.substring(0, 500);
        return `[${doc.category.toUpperCase()} - ${doc.filename}]\n${preview}...`;
      });

      return `RELEVANT CONTEXT:\n${contextParts.join('\n\n')}`;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return '';
    }
  }

  /**
   * Process all unprocessed documents for embeddings
   */
  async processAllDocuments(): Promise<{ processed: number; failed: number }> {
    try {
      const unprocessedDocs = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.status, 'processing'));

      let processed = 0;
      let failed = 0;

      for (const doc of unprocessedDocs) {
        const success = await this.generateDocumentEmbedding(doc.id);
        if (success) {
          processed++;
        } else {
          failed++;
        }

        // Add delay to avoid rate limiting
        await this.sleep(1000);
      }

      return { processed, failed };
    } catch (error) {
      console.error('Error processing all documents:', error);
      return { processed: 0, failed: 0 };
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Preprocess text for better embedding quality
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
      .trim()
      .substring(0, 8192); // Limit length for API
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const vectorEmbeddingService = new VectorEmbeddingService();
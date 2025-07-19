import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EmbeddingResult {
  success: boolean;
  embedding?: number[];
  error?: string;
}

export class EmbeddingService {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.client = new GoogleGenerativeAI(apiKey);
        console.log("Embedding service initialized successfully");
      } else {
        console.warn("GEMINI_API_KEY not found - embedding service unavailable");
      }
    } catch (error) {
      console.error("Failed to initialize embedding service:", error);
    }
  }

  /**
   * Generate embeddings for text using Google's embedding model
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.client) {
      return {
        success: false,
        error: "Embedding service not initialized - missing GEMINI_API_KEY"
      };
    }

    try {
      const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      
      if (result.embedding && result.embedding.values) {
        return {
          success: true,
          embedding: result.embedding.values
        };
      } else {
        return {
          success: false,
          error: "No embedding values returned from API"
        };
      }
    } catch (error) {
      console.error("Embedding generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown embedding error"
      };
    }
  }

  /**
   * Generate embeddings for multiple text chunks
   */
  async generateBatchEmbeddings(texts: string[]): Promise<Array<EmbeddingResult>> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.generateEmbedding(text));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Check if the embedding service is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }
}

export const embeddingService = new EmbeddingService();
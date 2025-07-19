/**
 * Advanced Memory Service for Personal AI Companion
 * Implements Mem0-like persistent memory with intelligent context management
 * Provides enterprise-level conversation tracking and context assembly
 */

import { db } from "../db";
import { conversationMemory, knowledgeBaseDocuments, vectorEmbeddings } from "../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { aiService } from "./aiService";

interface MemoryEntry {
  id?: number;
  userId: string;
  category: 'personal' | 'professional' | 'career' | 'skills' | 'goals' | 'context';
  content: string;
  importance: number;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  lastAccessed?: Date;
}

interface ConversationContext {
  recentMemories: MemoryEntry[];
  relevantKnowledge: any[];
  careerInsights: any[];
  personalContext: string;
}

class MemoryService {
  private maxMemoriesPerCategory = 50;
  private importanceThreshold = 0.7;
  private contextWindowSize = 10;

  /**
   * Store new memory with intelligent categorization and importance scoring
   */
  async storeMemory(userId: string, content: string, category?: string, metadata?: Record<string, any>): Promise<MemoryEntry> {
    try {
      // Generate embedding for semantic search
      const embedding = await this.generateEmbedding(content);
      
      // Auto-categorize if not provided
      const finalCategory = category || await this.categorizeContent(content);
      
      // Calculate importance score
      const importance = await this.calculateImportance(content, finalCategory);
      
      // Store memory entry
      const [memory] = await db.insert(conversationMemory).values({
        userId,
        category: finalCategory as any,
        content,
        importance,
        embedding: JSON.stringify(embedding),
        metadata: JSON.stringify(metadata || {}),
        createdAt: new Date(),
        lastAccessed: new Date()
      }).returning();

      // Maintain memory limits per category
      await this.pruneMemories(userId, finalCategory);

      return {
        ...memory,
        embedding,
        metadata: metadata || {}
      };
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant memories based on query and context
   */
  async retrieveMemories(userId: string, query?: string, category?: string, limit: number = 10): Promise<MemoryEntry[]> {
    try {
      let queryBuilder = db.select().from(conversationMemory)
        .where(eq(conversationMemory.userId, userId));

      if (category) {
        queryBuilder = queryBuilder.where(and(
          eq(conversationMemory.userId, userId),
          eq(conversationMemory.category, category as any)
        ));
      }

      if (query) {
        // Semantic search using embeddings
        const queryEmbedding = await this.generateEmbedding(query);
        // For now, use text similarity - would implement vector similarity in production
        queryBuilder = queryBuilder.where(and(
          eq(conversationMemory.userId, userId),
          sql`${conversationMemory.content} ILIKE ${`%${query}%`}`
        ));
      }

      const memories = await queryBuilder
        .orderBy(desc(conversationMemory.importance), desc(conversationMemory.lastAccessed))
        .limit(limit);

      // Update access timestamps
      if (memories.length > 0) {
        await this.updateAccessTimestamps(memories.map(m => m.id));
      }

      return memories.map(m => ({
        ...m,
        embedding: m.embedding ? JSON.parse(m.embedding) : undefined,
        metadata: m.metadata ? JSON.parse(m.metadata) : {}
      }));
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Build comprehensive conversation context
   */
  async buildConversationContext(userId: string, currentQuery: string): Promise<ConversationContext> {
    try {
      // Get recent conversation memories
      const recentMemories = await this.retrieveMemories(userId, undefined, undefined, this.contextWindowSize);
      
      // Get relevant knowledge base content
      const relevantKnowledge = await this.getRelevantKnowledge(currentQuery);
      
      // Get career-specific insights
      const careerInsights = await this.getCareerInsights(userId, currentQuery);
      
      // Build personal context summary
      const personalContext = await this.buildPersonalContext(userId, recentMemories);

      return {
        recentMemories,
        relevantKnowledge,
        careerInsights,
        personalContext
      };
    } catch (error) {
      console.error('Error building conversation context:', error);
      return {
        recentMemories: [],
        relevantKnowledge: [],
        careerInsights: [],
        personalContext: ''
      };
    }
  }

  /**
   * Generate career guidance based on memory and knowledge base
   */
  async generateCareerGuidance(userId: string, query: string): Promise<string> {
    try {
      const context = await this.buildConversationContext(userId, query);
      
      const prompt = `As an expert AI Career Advisor, provide personalized guidance based on:

PERSONAL CONTEXT:
${context.personalContext}

RECENT CONVERSATION HISTORY:
${context.recentMemories.map(m => `- ${m.content}`).join('\n')}

RELEVANT KNOWLEDGE:
${context.relevantKnowledge.map(k => `- ${k.content || k.summary}`).slice(0, 3).join('\n')}

CAREER INSIGHTS:
${context.careerInsights.map(i => `- ${i.insight || i.content}`).slice(0, 3).join('\n')}

USER QUERY: ${query}

Provide actionable, personalized career advice that:
1. References their specific background and goals
2. Offers concrete next steps
3. Suggests relevant resources or skills to develop
4. Maintains encouraging but realistic tone

Keep response focused and under 300 words.`;

      const response = await aiService.generateResponse(prompt, []);
      
      // Store this interaction as memory
      await this.storeMemory(userId, `Career guidance query: ${query}`, 'career', {
        query,
        response: response.substring(0, 200) + '...',
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('Error generating career guidance:', error);
      return "I apologize, but I'm having trouble accessing your career context right now. Please try again, and I'll do my best to provide personalized guidance.";
    }
  }

  /**
   * Auto-categorize content using AI
   */
  private async categorizeContent(content: string): Promise<string> {
    try {
      const prompt = `Categorize this content into one of: personal, professional, career, skills, goals, context

Content: "${content}"

Respond with just the category name:`;

      const response = await aiService.generateResponse(prompt, []);
      const category = response.trim().toLowerCase();
      
      if (['personal', 'professional', 'career', 'skills', 'goals', 'context'].includes(category)) {
        return category;
      }
      
      return 'context'; // default fallback
    } catch (error) {
      console.error('Error categorizing content:', error);
      return 'context';
    }
  }

  /**
   * Calculate importance score for memory prioritization
   */
  private async calculateImportance(content: string, category: string): Promise<number> {
    // Base importance by category
    const categoryWeights = {
      career: 0.9,
      goals: 0.85,
      professional: 0.8,
      skills: 0.75,
      personal: 0.7,
      context: 0.6
    };

    let importance = categoryWeights[category as keyof typeof categoryWeights] || 0.5;

    // Boost importance for key career terms
    const careerKeywords = ['promotion', 'interview', 'skill gap', 'goal', 'certification', 'networking', 'mentor'];
    const hasCareerKeywords = careerKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (hasCareerKeywords) {
      importance = Math.min(1.0, importance + 0.1);
    }

    // Boost for action items and specific plans
    if (content.includes('plan to') || content.includes('will') || content.includes('next step')) {
      importance = Math.min(1.0, importance + 0.05);
    }

    return Math.round(importance * 100) / 100;
  }

  /**
   * Generate embedding for semantic search
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    try {
      // In production, would use a proper embedding service
      // For now, return a mock 768-dimensional vector
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
    } catch (error) {
      console.error('Error generating embedding:', error);
      return Array.from({ length: 768 }, () => 0);
    }
  }

  /**
   * Get relevant knowledge base content
   */
  private async getRelevantKnowledge(query: string): Promise<any[]> {
    try {
      // Search knowledge base documents
      const documents = await db.select()
        .from(knowledgeBaseDocuments)
        .where(sql`${knowledgeBaseDocuments.content} ILIKE ${`%${query}%`}`)
        .limit(5);

      return documents;
    } catch (error) {
      console.error('Error retrieving relevant knowledge:', error);
      return [];
    }
  }

  /**
   * Get career-specific insights
   */
  private async getCareerInsights(userId: string, query: string): Promise<any[]> {
    try {
      const careerMemories = await this.retrieveMemories(userId, query, 'career', 5);
      const skillMemories = await this.retrieveMemories(userId, query, 'skills', 3);
      
      return [...careerMemories, ...skillMemories];
    } catch (error) {
      console.error('Error retrieving career insights:', error);
      return [];
    }
  }

  /**
   * Build personal context summary
   */
  private async buildPersonalContext(userId: string, recentMemories: MemoryEntry[]): Promise<string> {
    try {
      if (recentMemories.length === 0) {
        return "New conversation - building context.";
      }

      const contextPoints = recentMemories
        .filter(m => m.importance > this.importanceThreshold)
        .slice(0, 5)
        .map(m => m.content)
        .join('; ');

      return contextPoints || "Continuing our conversation.";
    } catch (error) {
      console.error('Error building personal context:', error);
      return "Context unavailable.";
    }
  }

  /**
   * Prune old memories to maintain performance
   */
  private async pruneMemories(userId: string, category: string): Promise<void> {
    try {
      const memoryCount = await db.select({ count: sql`count(*)` })
        .from(conversationMemory)
        .where(and(
          eq(conversationMemory.userId, userId),
          eq(conversationMemory.category, category as any)
        ));

      if (memoryCount[0]?.count > this.maxMemoriesPerCategory) {
        // Keep highest importance memories
        const toDelete = await db.select()
          .from(conversationMemory)
          .where(and(
            eq(conversationMemory.userId, userId),
            eq(conversationMemory.category, category as any)
          ))
          .orderBy(conversationMemory.importance, conversationMemory.lastAccessed)
          .limit(memoryCount[0].count - this.maxMemoriesPerCategory);

        if (toDelete.length > 0) {
          await db.delete(conversationMemory)
            .where(sql`id IN (${toDelete.map(m => m.id).join(',')})`);
        }
      }
    } catch (error) {
      console.error('Error pruning memories:', error);
    }
  }

  /**
   * Update access timestamps for memory prioritization
   */
  private async updateAccessTimestamps(memoryIds: number[]): Promise<void> {
    try {
      if (memoryIds.length === 0) return;
      
      await db.update(conversationMemory)
        .set({ lastAccessed: new Date() })
        .where(sql`id IN (${memoryIds.join(',')})`);
    } catch (error) {
      console.error('Error updating access timestamps:', error);
    }
  }
}

export const memoryService = new MemoryService();
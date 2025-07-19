/**
 * Advanced Memory Service for Personal AI Companion
 * Implements Mem0-like persistent memory with intelligent context management
 * Provides enterprise-level conversation tracking and context assembly
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../../../shared/schema";
import { env, logger, withModule } from "shared-utils";
import { conversationMemory, knowledgeBaseDocuments, vectorEmbeddings } from "../../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const moduleLogger = withModule('memoryService');

// Database connection for AI orchestrator
const sql_db = neon(env.DATABASE_URL);
const db = drizzle(sql_db, { schema });

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

export class MemoryService {
  private maxMemoriesPerCategory = 50;
  private importanceThreshold = 0.7;
  private contextWindowSize = 10;

  /**
   * Store new memory with intelligent categorization and importance scoring
   */
  async storeMemory(userId: string, content: string, category?: string, metadata?: Record<string, any>): Promise<MemoryEntry> {
    try {
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
        metadata: JSON.stringify(metadata || {}),
        createdAt: new Date(),
        lastAccessed: new Date()
      }).returning();

      // Maintain memory limits per category
      await this.pruneMemories(userId, finalCategory);

      return {
        ...memory,
        metadata: metadata || {}
      };
    } catch (error) {
      moduleLogger.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve memories by category and importance
   */
  async getMemories(
    userId: string, 
    category?: string, 
    limit: number = 10,
    minImportance: number = 0.5
  ): Promise<MemoryEntry[]> {
    try {
      let query = db.select()
        .from(conversationMemory)
        .where(
          and(
            eq(conversationMemory.userId, userId),
            sql`${conversationMemory.importance} >= ${minImportance}`
          )
        );

      if (category) {
        query = query.where(eq(conversationMemory.category, category as any));
      }

      const memories = await query
        .orderBy(desc(conversationMemory.importance), desc(conversationMemory.lastAccessed))
        .limit(limit);

      // Update last accessed timestamp
      if (memories.length > 0) {
        const memoryIds = memories.map(m => m.id);
        await db.update(conversationMemory)
          .set({ lastAccessed: new Date() })
          .where(sql`${conversationMemory.id} = ANY(${memoryIds})`);
      }

      return memories.map(m => ({
        ...m,
        metadata: m.metadata ? JSON.parse(m.metadata) : {}
      }));
    } catch (error) {
      moduleLogger.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Search memories by semantic similarity
   */
  async searchMemories(
    userId: string, 
    query: string, 
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    try {
      // For now, use keyword-based search
      // TODO: Implement proper vector similarity search
      const keywords = query.toLowerCase().split(' ');
      
      const memories = await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.userId, userId));

      const scored = memories.map(memory => {
        let score = 0;
        const content = memory.content.toLowerCase();
        
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            score += memory.importance * 0.1;
          }
        });
        
        return { ...memory, relevanceScore: score };
      });

      return scored
        .filter(m => m.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .map(m => ({
          ...m,
          metadata: m.metadata ? JSON.parse(m.metadata) : {}
        }));
    } catch (error) {
      moduleLogger.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Build comprehensive conversation context
   */
  async buildConversationContext(
    userId: string, 
    currentQuery: string,
    sessionId?: number
  ): Promise<ConversationContext> {
    try {
      const [recentMemories, relevantKnowledge] = await Promise.all([
        this.getMemories(userId, undefined, this.contextWindowSize),
        this.searchMemories(userId, currentQuery, 3)
      ]);

      // Build personal context summary
      const personalContext = this.synthesizePersonalContext(recentMemories);

      return {
        recentMemories,
        relevantKnowledge,
        careerInsights: [], // TODO: Implement career insights extraction
        personalContext
      };
    } catch (error) {
      moduleLogger.error('Error building conversation context:', error);
      return {
        recentMemories: [],
        relevantKnowledge: [],
        careerInsights: [],
        personalContext: ''
      };
    }
  }

  // Private helper methods

  private async categorizeContent(content: string): Promise<string> {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('career') || lowerContent.includes('job') || lowerContent.includes('position')) {
      return 'career';
    }
    if (lowerContent.includes('skill') || lowerContent.includes('technology') || lowerContent.includes('learn')) {
      return 'skills';
    }
    if (lowerContent.includes('goal') || lowerContent.includes('objective') || lowerContent.includes('target')) {
      return 'goals';
    }
    if (lowerContent.includes('experience') || lowerContent.includes('work') || lowerContent.includes('company')) {
      return 'professional';
    }
    
    return 'context';
  }

  private async calculateImportance(content: string, category: string): Promise<number> {
    let importance = 0.5; // Base importance
    
    // Boost importance based on category
    const categoryBoosts = {
      career: 0.3,
      skills: 0.2,
      goals: 0.25,
      professional: 0.2,
      personal: 0.1,
      context: 0.05
    };
    
    importance += categoryBoosts[category as keyof typeof categoryBoosts] || 0;
    
    // Boost for specific keywords
    const importantKeywords = [
      'goal', 'achievement', 'milestone', 'promotion', 'leadership',
      'startup', 'funding', 'product', 'strategy', 'vision'
    ];
    
    const lowerContent = content.toLowerCase();
    importantKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        importance += 0.1;
      }
    });
    
    // Length factor
    if (content.length > 200) importance += 0.1;
    if (content.length > 500) importance += 0.1;
    
    return Math.min(importance, 1.0);
  }

  private async pruneMemories(userId: string, category: string): Promise<void> {
    try {
      const memoryCount = await db.select({ count: sql`count(*)` })
        .from(conversationMemory)
        .where(
          and(
            eq(conversationMemory.userId, userId),
            eq(conversationMemory.category, category as any)
          )
        );

      const count = Number(memoryCount[0]?.count || 0);
      
      if (count > this.maxMemoriesPerCategory) {
        const excess = count - this.maxMemoriesPerCategory;
        
        // Remove oldest, least important memories
        const toDelete = await db.select()
          .from(conversationMemory)
          .where(
            and(
              eq(conversationMemory.userId, userId),
              eq(conversationMemory.category, category as any)
            )
          )
          .orderBy(conversationMemory.importance, conversationMemory.lastAccessed)
          .limit(excess);

        if (toDelete.length > 0) {
          const deleteIds = toDelete.map(m => m.id);
          await db.delete(conversationMemory)
            .where(sql`${conversationMemory.id} = ANY(${deleteIds})`);
          
          moduleLogger.debug(`Pruned ${excess} memories from category ${category}`);
        }
      }
    } catch (error) {
      moduleLogger.error('Error pruning memories:', error);
    }
  }

  private synthesizePersonalContext(memories: MemoryEntry[]): string {
    if (memories.length === 0) return '';
    
    const contextPieces = memories
      .filter(m => m.importance > this.importanceThreshold)
      .map(m => m.content)
      .slice(0, 3);
    
    return contextPieces.join('; ');
  }
}

export const memoryService = new MemoryService();
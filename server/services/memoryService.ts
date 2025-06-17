import { db } from "../db";
import { conversationMemory, conversationSessions } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface MemoryInsight {
  type: string;
  content: string;
  importance: number;
  context: string[];
}

export class MemoryService {
  
  // Store conversational memory with intelligent categorization
  async storeMemory(
    sessionId: number, 
    memoryType: string, 
    content: string, 
    importance = 5,
    contextTags: string[] = []
  ) {
    try {
      await db.insert(conversationMemory).values({
        sessionId,
        memoryType,
        content,
        importanceScore: importance,
        contextTags
      });
    } catch (error) {
      console.error("Error storing memory:", error);
    }
  }

  // Retrieve contextual memories for conversation
  async getContextualMemories(sessionId: number, query: string, limit = 10) {
    try {
      // Get memories with relevance scoring
      const memories = await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.importanceScore), desc(conversationMemory.lastAccessed))
        .limit(limit * 2);

      // Filter and score memories based on query relevance
      const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const scoredMemories = memories.map(memory => {
        let relevanceScore = memory.importanceScore;
        const memoryContent = memory.content.toLowerCase();
        
        // Boost score for keyword matches
        queryWords.forEach(word => {
          if (memoryContent.includes(word)) {
            relevanceScore += 2;
          }
        });
        
        // Boost score for context tag matches
        memory.contextTags?.forEach(tag => {
          if (queryWords.includes(tag.toLowerCase())) {
            relevanceScore += 3;
          }
        });
        
        return { ...memory, relevanceScore };
      });

      // Update last accessed for retrieved memories
      const topMemories = scoredMemories
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      // Update access timestamps
      for (const memory of topMemories) {
        await db.update(conversationMemory)
          .set({ lastAccessed: new Date() })
          .where(eq(conversationMemory.id, memory.id));
      }

      return topMemories;
    } catch (error) {
      console.error("Error retrieving contextual memories:", error);
      return [];
    }
  }

  // Extract and categorize insights from conversation
  async extractInsights(userMessage: string, assistantResponse: string): Promise<MemoryInsight[]> {
    const insights: MemoryInsight[] = [];
    
    // Extract career goals
    const goalPatterns = [
      /(?:want to|goal is to|aiming to|planning to|hoping to)\s+([^.!?]+)/gi,
      /(?:my goal|objective|target)\s+(?:is\s+)?(?:to\s+)?([^.!?]+)/gi
    ];
    
    goalPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'goal',
            content: match.trim(),
            importance: 9,
            context: ['career_planning', 'objectives']
          });
        });
      }
    });

    // Extract preferences
    const prefPatterns = [
      /(?:prefer|like|enjoy|interested in)\s+([^.!?]+)/gi,
      /(?:don't like|dislike|avoid|not interested in)\s+([^.!?]+)/gi
    ];
    
    prefPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'preference',
            content: match.trim(),
            importance: 7,
            context: ['preferences', 'personality']
          });
        });
      }
    });

    // Extract achievements
    const achievementPatterns = [
      /(?:achieved|accomplished|delivered|launched|built|led|managed|increased|grew)\s+([^.!?]+)/gi,
      /(?:successful|successfully)\s+([^.!?]+)/gi
    ];
    
    achievementPatterns.forEach(pattern => {
      const matches = userMessage.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 20) { // Only meaningful achievements
            insights.push({
              type: 'achievement',
              content: match.trim(),
              importance: 8,
              context: ['accomplishments', 'experience']
            });
          }
        });
      }
    });

    // Extract skills and expertise
    const skillKeywords = [
      'AI', 'machine learning', 'product management', 'leadership', 'strategy',
      'python', 'javascript', 'react', 'node.js', 'sql', 'mongodb',
      'project management', 'team management', 'data analysis', 'UX design'
    ];
    
    const content = `${userMessage} ${assistantResponse}`.toLowerCase();
    skillKeywords.forEach(skill => {
      if (content.includes(skill.toLowerCase())) {
        insights.push({
          type: 'skill',
          content: `Has experience with ${skill}`,
          importance: 6,
          context: ['skills', 'expertise', 'technical']
        });
      }
    });

    return insights;
  }

  // Get memory summary for session context
  async getSessionMemorySummary(sessionId: number): Promise<string> {
    try {
      const memories = await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.importanceScore))
        .limit(10);

      if (memories.length === 0) return "";

      const summaryParts = [];
      
      // Group by memory type
      const grouped = memories.reduce((acc, memory) => {
        if (!acc[memory.memoryType]) acc[memory.memoryType] = [];
        acc[memory.memoryType].push(memory.content);
        return acc;
      }, {} as Record<string, string[]>);

      // Create summary sections
      Object.entries(grouped).forEach(([type, contents]) => {
        if (contents.length > 0) {
          summaryParts.push(`${type}: ${contents.slice(0, 3).join('; ')}`);
        }
      });

      return summaryParts.join(' | ');
    } catch (error) {
      console.error("Error generating memory summary:", error);
      return "";
    }
  }

  // Clean up old memories
  async cleanupOldMemories(sessionId: number, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await db.delete(conversationMemory)
        .where(
          and(
            eq(conversationMemory.sessionId, sessionId),
            sql`${conversationMemory.createdAt} < ${cutoffDate}`
          )
        );
    } catch (error) {
      console.error("Error cleaning up memories:", error);
    }
  }

  // Get memory statistics
  async getMemoryStats(sessionId: number) {
    try {
      const totalMemories = await db.select({ count: sql`count(*)` })
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId));

      const memoryTypes = await db.select({
        type: conversationMemory.memoryType,
        count: sql`count(*)`
      })
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .groupBy(conversationMemory.memoryType);

      return {
        total: totalMemories[0]?.count || 0,
        byType: memoryTypes.reduce((acc, item) => {
          acc[item.type] = item.count;
          return acc;
        }, {} as Record<string, any>)
      };
    } catch (error) {
      console.error("Error getting memory stats:", error);
      return { total: 0, byType: {} };
    }
  }
}

export const memoryService = new MemoryService();
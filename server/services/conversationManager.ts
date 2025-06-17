import { db } from "../db";
import { 
  conversationSessions, 
  conversationMemory, 
  userProfile 
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { aiService } from "./aiService";

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: number;
  contextUsed?: string[];
  modelUsed?: string;
}

export interface SessionContext {
  sessionId: number;
  userId: string;
  sessionType: string;
  recentMemories: any[];
  relevantDocuments: any[];
  userProfile: any;
}

export class ConversationManager {
  
  // Start or resume a conversation session
  async startSession(
    userId: string = "admin", 
    sessionType: string = "career_assistant"
  ): Promise<number> {
    try {
      // Check for active session
      const activeSession = await db.select()
        .from(conversationSessions)
        .where(
          and(
            eq(conversationSessions.userId, userId),
            eq(conversationSessions.isActive, true),
            eq(conversationSessions.sessionType, sessionType)
          )
        )
        .orderBy(desc(conversationSessions.lastActivity))
        .limit(1);

      if (activeSession.length > 0) {
        // Update last activity
        await db.update(conversationSessions)
          .set({ lastActivity: new Date() })
          .where(eq(conversationSessions.id, activeSession[0].id));
        
        return activeSession[0].id;
      }

      // Create new session
      const newSession = await db.insert(conversationSessions).values({
        userId,
        sessionType,
        isActive: true
      }).returning();

      return newSession[0].id;
    } catch (error) {
      console.error("Error starting session:", error);
      throw error;
    }
  }

  // Process conversation message with full context
  async processMessage(
    sessionId: number,
    message: string,
    attachedDocuments: number[] = []
  ): Promise<ConversationMessage> {
    try {
      // Update session activity
      await this.updateSessionActivity(sessionId);

      // Build conversation context
      const context = await this.buildSessionContext(sessionId);
      
      // Add attached documents to context
      if (attachedDocuments.length > 0) {
        const documents = await aiService.getRelevantDocuments(message, 5);
        context.relevantDocuments.push(...documents);
      }

      // Get AI response
      const aiResponse = await aiService.generateResponse(message, context);

      // Store user message as memory
      await this.storeMessageMemory(sessionId, 'user', message);

      // Store AI response as memory
      await this.storeMessageMemory(sessionId, 'assistant', aiResponse.content);

      // Extract and store important facts/preferences
      await this.extractAndStoreMemories(sessionId, message, aiResponse.content);

      // Update session summary
      await this.updateSessionSummary(sessionId, message, aiResponse.content);

      // Create response message
      const responseMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        sessionId,
        contextUsed: aiResponse.contextUsed,
        modelUsed: aiResponse.modelUsed
      };

      return responseMessage;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  // Build complete session context
  private async buildSessionContext(sessionId: number): Promise<SessionContext> {
    try {
      const session = await db.select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, sessionId))
        .limit(1);

      if (!session[0]) {
        throw new Error("Session not found");
      }

      const sessionData = session[0];

      // Get recent memories
      const recentMemories = await aiService.getRecentMemories(sessionId, 10);

      // Get user profile
      const profile = await db.select()
        .from(userProfile)
        .where(eq(userProfile.userId, sessionData.userId))
        .limit(1);

      // Get relevant documents from knowledge base using vector search
      let relevantDocuments = [];
      try {
        const { vectorEmbeddingService } = await import("./vectorEmbeddingService");
        
        // Get last few messages to understand current context
        const recentMessages = await db.select()
          .from(conversationMemory)
          .where(eq(conversationMemory.sessionId, sessionId))
          .orderBy(desc(conversationMemory.createdAt))
          .limit(3);
          
        const contextQuery = recentMessages
          .map(m => m.content)
          .join(" ")
          .slice(0, 500); // Limit query length
          
        if (contextQuery.trim()) {
          relevantDocuments = await vectorEmbeddingService.findSimilarDocuments(contextQuery, 3);
        }
      } catch (error) {
        console.warn("Vector search failed:", error);
      }

      return {
        sessionId,
        userId: sessionData.userId,
        sessionType: sessionData.sessionType,
        recentMemories,
        relevantDocuments,
        userProfile: profile[0] || null
      };
    } catch (error) {
      console.error("Error building session context:", error);
      return {
        sessionId,
        userId: "admin",
        sessionType: "career_assistant",
        recentMemories: [],
        relevantDocuments: [],
        userProfile: null
      };
    }
  }

  // Store message as conversation memory
  private async storeMessageMemory(
    sessionId: number,
    role: string,
    content: string
  ) {
    try {
      const memoryType = role === 'user' ? 'user_input' : 'assistant_response';
      const importance = role === 'user' ? 6 : 4; // User inputs slightly more important

      await aiService.storeMemory(sessionId, memoryType, content, importance);
    } catch (error) {
      console.error("Error storing message memory:", error);
    }
  }

  // Extract important memories from conversation
  private async extractAndStoreMemories(
    sessionId: number,
    userMessage: string,
    assistantResponse: string
  ) {
    try {
      // Extract preferences
      const preferences = this.extractPreferences(userMessage, assistantResponse);
      for (const pref of preferences) {
        await aiService.storeMemory(sessionId, 'preference', pref, 8);
      }

      // Extract goals
      const goals = this.extractGoals(userMessage, assistantResponse);
      for (const goal of goals) {
        await aiService.storeMemory(sessionId, 'goal', goal, 9);
      }

      // Extract facts
      const facts = this.extractFacts(userMessage, assistantResponse);
      for (const fact of facts) {
        await aiService.storeMemory(sessionId, 'fact', fact, 7);
      }

      // Extract achievements
      const achievements = this.extractAchievements(userMessage, assistantResponse);
      for (const achievement of achievements) {
        await aiService.storeMemory(sessionId, 'achievement', achievement, 9);
      }
    } catch (error) {
      console.error("Error extracting memories:", error);
    }
  }

  // Extract preferences from conversation
  private extractPreferences(userMessage: string, assistantResponse: string): string[] {
    const preferences = [];
    const content = `${userMessage} ${assistantResponse}`.toLowerCase();

    // Communication style preferences
    if (content.includes('prefer direct') || content.includes('be direct')) {
      preferences.push("User prefers direct communication style");
    }
    if (content.includes('prefer detailed') || content.includes('more detail')) {
      preferences.push("User prefers detailed explanations");
    }

    // Career preferences
    if (content.includes('remote work') || content.includes('work from home')) {
      preferences.push("User prefers remote work opportunities");
    }
    if (content.includes('startup') && content.includes('prefer')) {
      preferences.push("User prefers startup environment");
    }

    return preferences;
  }

  // Extract goals from conversation
  private extractGoals(userMessage: string, assistantResponse: string): string[] {
    const goals = [];
    const content = `${userMessage} ${assistantResponse}`.toLowerCase();

    // Career goals
    if (content.includes('want to become') || content.includes('goal is to')) {
      const goalMatch = content.match(/(?:want to become|goal is to|aiming to|planning to)\s+([^.!?]+)/i);
      if (goalMatch) {
        goals.push(`Career goal: ${goalMatch[1].trim()}`);
      }
    }

    // Interview goals
    if (content.includes('interview') && (content.includes('prepare') || content.includes('practice'))) {
      goals.push("Goal: Improve interview performance");
    }

    // Resume goals
    if (content.includes('resume') && (content.includes('improve') || content.includes('optimize'))) {
      goals.push("Goal: Optimize resume for better results");
    }

    return goals;
  }

  // Extract facts from conversation
  private extractFacts(userMessage: string, assistantResponse: string): string[] {
    const facts = [];
    const content = userMessage.toLowerCase();

    // Current role facts
    if (content.includes('currently work') || content.includes('my current role')) {
      const roleMatch = content.match(/(?:currently work|current role|working as)\s+(?:as\s+)?([^.!?]+)/i);
      if (roleMatch) {
        facts.push(`Current role: ${roleMatch[1].trim()}`);
      }
    }

    // Company facts
    if (content.includes('work at') || content.includes('company is')) {
      const companyMatch = content.match(/(?:work at|company is|employed by)\s+([^.!?]+)/i);
      if (companyMatch) {
        facts.push(`Current company: ${companyMatch[1].trim()}`);
      }
    }

    // Experience facts
    if (content.includes('years of experience') || content.includes('been working for')) {
      const expMatch = content.match(/(\d+)\s+years?\s+of\s+experience/i);
      if (expMatch) {
        facts.push(`Experience: ${expMatch[1]} years in the field`);
      }
    }

    return facts;
  }

  // Extract achievements from conversation
  private extractAchievements(userMessage: string, assistantResponse: string): string[] {
    const achievements = [];
    const content = userMessage.toLowerCase();

    // Achievement indicators
    const achievementKeywords = [
      'achieved', 'accomplished', 'successfully', 'led', 'managed', 'increased',
      'decreased', 'improved', 'launched', 'delivered', 'won', 'earned'
    ];

    achievementKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const sentences = userMessage.split(/[.!?]+/);
        sentences.forEach(sentence => {
          if (sentence.toLowerCase().includes(keyword) && sentence.trim().length > 20) {
            achievements.push(`Achievement: ${sentence.trim()}`);
          }
        });
      }
    });

    return achievements.filter((achievement, index) => 
      achievements.indexOf(achievement) === index // Remove duplicates
    ).slice(0, 3); // Limit to 3 achievements per conversation
  }

  // Update session summary
  private async updateSessionSummary(
    sessionId: number,
    userMessage: string,
    assistantResponse: string
  ) {
    try {
      const session = await db.select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, sessionId))
        .limit(1);

      if (!session[0]) return;

      const currentSummary = session[0].contextSummary || '';
      const newTopics = this.extractTopics(userMessage, assistantResponse);
      
      let updatedSummary = currentSummary;
      if (newTopics.length > 0) {
        const topicsText = newTopics.join(', ');
        updatedSummary = currentSummary 
          ? `${currentSummary}; Discussed: ${topicsText}`
          : `Discussed: ${topicsText}`;
      }

      // Keep summary concise (max 500 characters)
      if (updatedSummary.length > 500) {
        updatedSummary = updatedSummary.substring(updatedSummary.length - 500);
      }

      await db.update(conversationSessions)
        .set({ 
          contextSummary: updatedSummary,
          totalMessages: sql`${conversationSessions.totalMessages} + 2` // user + assistant
        })
        .where(eq(conversationSessions.id, sessionId));
    } catch (error) {
      console.error("Error updating session summary:", error);
    }
  }

  // Extract conversation topics
  private extractTopics(userMessage: string, assistantResponse: string): string[] {
    const topics = [];
    const content = `${userMessage} ${assistantResponse}`.toLowerCase();

    const topicKeywords = {
      'resume': ['resume', 'cv', 'curriculum vitae'],
      'interview': ['interview', 'interview preparation', 'interview question'],
      'career strategy': ['career strategy', 'career planning', 'career goal'],
      'job search': ['job search', 'job hunting', 'job application'],
      'networking': ['networking', 'professional network', 'linkedin'],
      'skills': ['skills', 'skill development', 'competency'],
      'leadership': ['leadership', 'team management', 'leading'],
      'personal brand': ['personal brand', 'professional image', 'online presence']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // Update session activity timestamp
  private async updateSessionActivity(sessionId: number) {
    try {
      await db.update(conversationSessions)
        .set({ lastActivity: new Date() })
        .where(eq(conversationSessions.id, sessionId));
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  }

  // Get conversation history
  async getConversationHistory(sessionId: number, limit = 20) {
    try {
      const memories = await db.select()
        .from(conversationMemory)
        .where(
          and(
            eq(conversationMemory.sessionId, sessionId),
            sql`${conversationMemory.memoryType} IN ('user_input', 'assistant_response')`
          )
        )
        .orderBy(desc(conversationMemory.createdAt))
        .limit(limit * 2); // Get double to account for user/assistant pairs

      return memories.reverse(); // Show chronological order
    } catch (error) {
      console.error("Error getting conversation history:", error);
      return [];
    }
  }

  // End session
  async endSession(sessionId: number) {
    try {
      await db.update(conversationSessions)
        .set({ isActive: false })
        .where(eq(conversationSessions.id, sessionId));
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }

  // Get session statistics
  async getSessionStats(sessionId: number) {
    try {
      const session = await db.select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, sessionId))
        .limit(1);

      if (!session[0]) return null;

      const memoryCount = await db.select({ count: sql`count(*)` })
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId));

      const topMemories = await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.importanceScore))
        .limit(5);

      return {
        session: session[0],
        totalMemories: memoryCount[0].count,
        topMemories: topMemories
      };
    } catch (error) {
      console.error("Error getting session stats:", error);
      return null;
    }
  }

  // Clean up old sessions
  async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await db.delete(conversationSessions)
        .where(
          and(
            eq(conversationSessions.isActive, false),
            sql`${conversationSessions.lastActivity} < ${cutoffDate}`
          )
        );
    } catch (error) {
      console.error("Error cleaning up old sessions:", error);
    }
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager();
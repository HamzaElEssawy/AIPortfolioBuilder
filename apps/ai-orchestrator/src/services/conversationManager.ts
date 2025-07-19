import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../../../shared/schema";
import { env, logger, withModule } from "shared-utils";
import { 
  conversationSessions, 
  conversationMemory, 
  userProfile 
} from "../../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import type { ConversationContext } from "../types";

const moduleLogger = withModule('conversationManager');

// Database connection for AI orchestrator
const sql_db = neon(env.DATABASE_URL);
const db = drizzle(sql_db, { schema });

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
      moduleLogger.error("Error starting session:", error);
      throw error;
    }
  }

  // Build conversation context
  async buildContext(sessionId: number, userId?: string): Promise<ConversationContext> {
    try {
      const context: ConversationContext = {
        sessionId,
        userId,
        recentMemories: [],
        relevantDocuments: [],
        userProfile: null
      };

      // Get user profile if userId provided
      if (userId) {
        const profile = await db.select()
          .from(userProfile)
          .where(eq(userProfile.userId, userId))
          .limit(1);
        
        context.userProfile = profile[0] || null;
      }

      // Get recent memories for the session
      const memories = await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.importanceScore), desc(conversationMemory.lastAccessed))
        .limit(5);

      context.recentMemories = memories;

      return context;
    } catch (error) {
      moduleLogger.error("Error building context:", error);
      return {
        sessionId,
        userId,
        recentMemories: [],
        relevantDocuments: [],
        userProfile: null
      };
    }
  }

  // Store conversation message
  async storeMessage(
    sessionId: number,
    role: 'user' | 'assistant',
    content: string,
    metadata?: {
      modelUsed?: string;
      contextUsed?: string[];
      responseTime?: number;
    }
  ): Promise<void> {
    try {
      // Update session activity
      await db.update(conversationSessions)
        .set({ 
          lastActivity: new Date(),
          messageCount: sql`${conversationSessions.messageCount} + 1`
        })
        .where(eq(conversationSessions.id, sessionId));

      moduleLogger.debug(`Stored ${role} message for session ${sessionId}`);
    } catch (error) {
      moduleLogger.error("Error storing message:", error);
    }
  }

  // End conversation session
  async endSession(sessionId: number, summary?: string): Promise<void> {
    try {
      await db.update(conversationSessions)
        .set({ 
          isActive: false,
          endedAt: new Date(),
          contextSummary: summary
        })
        .where(eq(conversationSessions.id, sessionId));

      moduleLogger.info(`Session ${sessionId} ended`);
    } catch (error) {
      moduleLogger.error("Error ending session:", error);
    }
  }

  // Get session history
  async getSessionHistory(sessionId: number, limit: number = 10) {
    try {
      return await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.createdAt))
        .limit(limit);
    } catch (error) {
      moduleLogger.error("Error fetching session history:", error);
      return [];
    }
  }
}
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db";
import { 
  conversationSessions, 
  conversationMemory, 
  userProfile, 
  knowledgeBaseDocuments,
  aiAnalysisResults 
} from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Initialize AI clients with proper error handling
let anthropic: Anthropic | null = null;
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log("Claude/Anthropic API initialized successfully");
  } else {
    console.warn("ANTHROPIC_API_KEY not found - Claude unavailable");
  }
} catch (error) {
  console.error("Failed to initialize Anthropic:", error);
}

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Gemini API initialized successfully");
  } else {
    console.warn("GEMINI_API_KEY not found - Gemini unavailable");
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

export interface ConversationContext {
  sessionId?: number;
  userId?: string;
  sessionType?: string;
  recentMemories?: any[];
  relevantDocuments?: any[];
  userProfile?: any;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  contextUsed: string[];
  suggestedActions?: string[];
  confidenceScore?: number;
}

export class AIService {
  
  // Primary AI response using Claude with Gemini fallback
  async generateResponse(
    message: string, 
    context: ConversationContext = {}
  ): Promise<AIResponse> {
    try {
      // Try Claude first (primary)
      return await this.generateClaudeResponse(message, context);
    } catch (claudeError) {
      console.warn("Claude API failed, falling back to Gemini:", claudeError);
      
      try {
        // Fallback to Gemini
        return await this.generateGeminiResponse(message, context);
      } catch (geminiError) {
        console.error("Both AI services failed:", { claudeError, geminiError });
        throw new Error("AI services temporarily unavailable. Please try again later.");
      }
    }
  }

  // Claude AI Response
  private async generateClaudeResponse(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    if (!anthropic) {
      throw new Error("Claude API not initialized - missing ANTHROPIC_API_KEY");
    }

    const systemPrompt = await this.buildSystemPrompt(context);
    const contextualMessage = await this.buildContextualMessage(message, context);

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: contextualMessage }]
    });

    const content = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : "I apologize, but I couldn't generate a response. Please try again.";

    return {
      content,
      modelUsed: "claude-3-5-sonnet",
      contextUsed: this.extractContextUsed(context),
      confidenceScore: 9 // Claude typically has high confidence
    };
  }

  // Gemini AI Response (Fallback)
  private async generateGeminiResponse(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    if (!genAI) {
      throw new Error("Gemini API not initialized - missing GEMINI_API_KEY");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemPrompt = await this.buildSystemPrompt(context);
    const contextualMessage = await this.buildContextualMessage(message, context);

    const prompt = `${systemPrompt}\n\nUser: ${contextualMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      modelUsed: "gemini-1.5-flash",
      contextUsed: this.extractContextUsed(context),
      confidenceScore: 7 // Generally good but slightly lower confidence than Claude
    };
  }

  // Build dynamic system prompt based on context
  private async buildSystemPrompt(context: ConversationContext): Promise<string> {
    let systemPrompt = `You are an expert AI Career Assistant specifically helping Hamza El Essawy, an accomplished AI Product Leader and entrepreneur based in Kuala Lumpur, Malaysia.

CORE RESPONSIBILITIES:
1. Career advancement strategy and planning
2. Resume optimization and interview preparation
3. Personal brand analysis and improvement
4. Professional development guidance
5. AI industry insights and networking advice

COMMUNICATION STYLE:
- Professional yet approachable
- Specific and actionable recommendations
- Reference concrete examples from Hamza's experience when relevant
- Ask clarifying questions when needed for better personalization`;

    // Add user profile context if available
    if (context.userId) {
      const profile = await this.getUserProfile(context.userId);
      if (profile) {
        systemPrompt += `\n\nUSER PROFILE:
- Career Stage: ${profile.careerStage || 'Senior Professional'}
- Current Goals: ${profile.currentGoals?.join(', ') || 'Career advancement'}
- Communication Style: ${profile.communicationStyle || 'Professional'}
- Target Roles: ${profile.targetRoles?.join(', ') || 'AI Leadership positions'}
- Skills to Improve: ${profile.skillsToImprove?.join(', ') || 'Leadership, Strategy'}`;
      }
    }

    // Add recent memories for context continuity
    if (context.recentMemories?.length) {
      systemPrompt += `\n\nRECENT CONVERSATION CONTEXT:`;
      context.recentMemories.forEach(memory => {
        systemPrompt += `\n- ${memory.memoryType}: ${memory.content}`;
      });
    }

    // Add relevant document insights
    if (context.relevantDocuments?.length) {
      systemPrompt += `\n\nRELEVANT DOCUMENTS:`;
      context.relevantDocuments.forEach(doc => {
        systemPrompt += `\n- ${doc.category}: ${doc.summary || doc.originalName}`;
        if (doc.keyInsights) {
          systemPrompt += ` | Key insights: ${JSON.stringify(doc.keyInsights)}`;
        }
      });
    }

    return systemPrompt;
  }

  // Build contextual message with relevant information
  private async buildContextualMessage(
    message: string, 
    context: ConversationContext
  ): Promise<string> {
    let contextualMessage = message;

    // Add session context if this is part of an ongoing conversation
    if (context.sessionId) {
      const sessionSummary = await this.getSessionSummary(context.sessionId);
      if (sessionSummary) {
        contextualMessage = `[Previous conversation context: ${sessionSummary}]\n\n${message}`;
      }
    }

    return contextualMessage;
  }

  // Get user profile
  private async getUserProfile(userId: string) {
    try {
      const profile = await db.select()
        .from(userProfile)
        .where(eq(userProfile.userId, userId))
        .limit(1);
      
      return profile[0] || null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  // Get session summary for context
  private async getSessionSummary(sessionId: number): Promise<string | null> {
    try {
      const session = await db.select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, sessionId))
        .limit(1);
      
      return session[0]?.contextSummary || null;
    } catch (error) {
      console.error("Error fetching session summary:", error);
      return null;
    }
  }

  // Get recent memories for context
  async getRecentMemories(sessionId: number, limit = 5) {
    try {
      return await db.select()
        .from(conversationMemory)
        .where(eq(conversationMemory.sessionId, sessionId))
        .orderBy(desc(conversationMemory.importanceScore), desc(conversationMemory.lastAccessed))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching recent memories:", error);
      return [];
    }
  }

  // Get relevant documents based on conversation context
  async getRelevantDocuments(query: string, limit = 3) {
    try {
      // Simple keyword-based search for now
      // TODO: Implement vector similarity search
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const documents = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.status, "embedded"))
        .limit(limit * 2); // Get more to filter
      
      // Simple relevance scoring based on keyword matches
      const scored = documents.map(doc => {
        let score = 0;
        const content = (doc.contentText || '').toLowerCase();
        const summary = (doc.summary || '').toLowerCase();
        
        keywords.forEach(keyword => {
          if (content.includes(keyword)) score += 2;
          if (summary.includes(keyword)) score += 3;
          if (doc.category.toLowerCase().includes(keyword)) score += 4;
        });
        
        return { ...doc, relevanceScore: score };
      });
      
      return scored
        .filter(doc => doc.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching relevant documents:", error);
      return [];
    }
  }

  // Store conversation memory
  async storeMemory(
    sessionId: number, 
    memoryType: string, 
    content: string, 
    importanceScore = 5
  ) {
    try {
      await db.insert(conversationMemory).values({
        sessionId,
        memoryType,
        content,
        importanceScore,
        contextTags: this.extractTags(content)
      });
    } catch (error) {
      console.error("Error storing memory:", error);
    }
  }

  // Extract context used for response
  private extractContextUsed(context: ConversationContext): string[] {
    const used = [];
    
    if (context.userProfile) used.push("user_profile");
    if (context.recentMemories?.length) used.push("conversation_history");
    if (context.relevantDocuments?.length) used.push("knowledge_base");
    if (context.sessionType) used.push("session_context");
    
    return used;
  }

  // Extract tags from content for categorization
  private extractTags(content: string): string[] {
    const careerTags = [
      'resume', 'interview', 'career', 'job', 'skill', 'experience', 'leadership',
      'strategy', 'ai', 'product', 'management', 'startup', 'funding', 'mentor'
    ];
    
    const contentLower = content.toLowerCase();
    return careerTags.filter(tag => contentLower.includes(tag));
  }

  // Analyze document and store results
  async analyzeDocument(documentId: number, analysisType: string): Promise<any> {
    try {
      const document = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, documentId))
        .limit(1);
      
      if (!document[0]) {
        throw new Error("Document not found");
      }

      const doc = document[0];
      let analysisPrompt = "";

      switch (analysisType) {
        case "resume_analysis":
          analysisPrompt = `Analyze this resume and provide structured feedback:
${doc.contentText}

Provide analysis in this format:
- Overall Score (1-10)
- Strengths (list)
- Areas for Improvement (list)
- ATS Compatibility Score (1-10)
- Keyword Optimization Suggestions
- Industry-specific Recommendations`;
          break;

        case "interview_analysis":
          analysisPrompt = `Analyze this interview transcript and provide feedback:
${doc.contentText}

Provide analysis in this format:
- Performance Score (1-10)
- Strong Responses (list)
- Areas for Improvement (list)
- Communication Effectiveness
- Technical Knowledge Assessment
- Follow-up Action Items`;
          break;

        default:
          analysisPrompt = `Analyze this document and provide relevant insights:
${doc.contentText}

Focus on career development, skill assessment, and actionable recommendations.`;
      }

      const response = await this.generateResponse(analysisPrompt, {
        sessionType: "document_analysis"
      });

      // Store analysis results
      const analysisResult = await db.insert(aiAnalysisResults).values({
        documentId: documentId,
        analysisType: analysisType,
        results: { analysis: response.content },
        modelUsed: response.modelUsed
      }).returning();

      return analysisResult[0];
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
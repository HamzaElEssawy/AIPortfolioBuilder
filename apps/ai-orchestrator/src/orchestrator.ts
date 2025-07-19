import { env, logger, withModule } from "shared-utils";
import type { IAIProvider, ChatRequest, ChatResponse, ConversationContext } from "./types";
import { ConversationManager } from "./services/conversationManager";
import { memoryService } from "./services/memoryService";

const moduleLogger = withModule('orchestrator');

export class Orchestrator {
  private conversationManager: ConversationManager;

  constructor(
    private primaryProvider: IAIProvider,
    private fallbackProvider: IAIProvider
  ) {
    this.conversationManager = new ConversationManager();
    moduleLogger.info("Orchestrator initialized", {
      primary: this.primaryProvider.getName(),
      fallback: this.fallbackProvider.getName()
    });
  }

  async runChat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // Start or get session
      const sessionId = request.sessionId || await this.conversationManager.startSession(
        request.userId,
        request.sessionType || "career_assistant"
      );

      // Build conversation context
      const context = await this.buildEnhancedContext(sessionId, request.userId, request.prompt);

      // Store user message
      await this.conversationManager.storeMessage(sessionId, 'user', request.prompt);

      // Generate AI response with fallback
      const aiResponse = await this.generateResponseWithFallback(request.prompt, context);

      // Store assistant message
      await this.conversationManager.storeMessage(
        sessionId, 
        'assistant', 
        aiResponse.content,
        {
          modelUsed: aiResponse.modelUsed,
          responseTime: Date.now() - startTime
        }
      );

      // Store important memories
      await this.storeImportantMemories(request.userId, request.prompt, aiResponse.content, sessionId);

      // Build final response
      const response: ChatResponse = {
        content: aiResponse.content,
        modelUsed: aiResponse.modelUsed,
        contextUsed: this.extractContextUsed(context),
        sessionId,
        memoryStored: true,
        confidenceScore: this.calculateConfidenceScore(aiResponse)
      };

      moduleLogger.info("Chat completed", {
        sessionId,
        userId: request.userId,
        modelUsed: aiResponse.modelUsed,
        responseTime: Date.now() - startTime
      });

      return response;

    } catch (error) {
      moduleLogger.error("Chat processing failed:", error);
      throw new Error("Failed to process chat request. Please try again.");
    }
  }

  private async buildEnhancedContext(
    sessionId: number, 
    userId: string, 
    currentPrompt: string
  ): Promise<ConversationContext> {
    try {
      // Get base conversation context
      const baseContext = await this.conversationManager.buildContext(sessionId, userId);

      // Get relevant memories and knowledge
      const [relevantMemories, conversationContext] = await Promise.all([
        memoryService.searchMemories(userId, currentPrompt, 3),
        memoryService.buildConversationContext(userId, currentPrompt, sessionId)
      ]);

      // Combine contexts
      return {
        ...baseContext,
        recentMemories: [...baseContext.recentMemories, ...relevantMemories],
        relevantDocuments: conversationContext.relevantKnowledge
      };

    } catch (error) {
      moduleLogger.error("Error building enhanced context:", error);
      // Return basic context as fallback
      return await this.conversationManager.buildContext(sessionId, userId);
    }
  }

  private async generateResponseWithFallback(
    message: string, 
    context: ConversationContext
  ) {
    try {
      // Try primary provider first
      if (this.primaryProvider.isAvailable()) {
        moduleLogger.debug("Using primary provider:", this.primaryProvider.getName());
        return await this.primaryProvider.chat(message, context);
      }
    } catch (error) {
      moduleLogger.warn("Primary provider failed, falling back:", error);
    }

    try {
      // Fallback to secondary provider
      if (this.fallbackProvider.isAvailable()) {
        moduleLogger.debug("Using fallback provider:", this.fallbackProvider.getName());
        return await this.fallbackProvider.chat(message, context);
      }
    } catch (error) {
      moduleLogger.error("Fallback provider also failed:", error);
    }

    throw new Error("All AI providers are currently unavailable");
  }

  private async storeImportantMemories(
    userId: string,
    userMessage: string,
    aiResponse: string,
    sessionId: number
  ): Promise<void> {
    try {
      // Store user message if it contains important information
      if (this.isImportantMessage(userMessage)) {
        await memoryService.storeMemory(
          userId,
          userMessage,
          undefined, // Let it auto-categorize
          { type: 'user_input', sessionId }
        );
      }

      // Store AI insights if they contain valuable information
      if (this.containsActionableInsights(aiResponse)) {
        await memoryService.storeMemory(
          userId,
          this.extractInsights(aiResponse),
          'professional',
          { type: 'ai_insight', sessionId }
        );
      }
    } catch (error) {
      moduleLogger.error("Error storing memories:", error);
      // Don't throw - memory storage failure shouldn't break the chat
    }
  }

  private isImportantMessage(message: string): boolean {
    const importantKeywords = [
      'goal', 'objective', 'career', 'job', 'skill', 'experience',
      'learning', 'achievement', 'challenge', 'project', 'leadership',
      'startup', 'funding', 'product', 'strategy', 'vision'
    ];

    const lowerMessage = message.toLowerCase();
    return importantKeywords.some(keyword => lowerMessage.includes(keyword)) && message.length > 50;
  }

  private containsActionableInsights(response: string): boolean {
    const insightIndicators = [
      'suggest', 'recommend', 'consider', 'strategy', 'approach',
      'next step', 'action item', 'best practice', 'tip', 'advice'
    ];

    const lowerResponse = response.toLowerCase();
    return insightIndicators.some(indicator => lowerResponse.includes(indicator));
  }

  private extractInsights(response: string): string {
    // Simple extraction - get first 200 chars that contain actionable content
    const sentences = response.split('. ');
    const actionableSentences = sentences.filter(sentence => 
      sentence.toLowerCase().includes('suggest') ||
      sentence.toLowerCase().includes('recommend') ||
      sentence.toLowerCase().includes('consider')
    );

    return actionableSentences.slice(0, 2).join('. ').substring(0, 200);
  }

  private extractContextUsed(context: ConversationContext): string[] {
    const used = [];
    
    if (context.userProfile) used.push("user_profile");
    if (context.recentMemories?.length) used.push("conversation_history");
    if (context.relevantDocuments?.length) used.push("knowledge_base");
    if (context.sessionId) used.push("session_context");
    
    return used;
  }

  private calculateConfidenceScore(response: any): number {
    // Simple confidence calculation based on response length and usage
    let confidence = 0.7; // Base confidence

    if (response.usage?.totalTokens > 500) confidence += 0.1;
    if (response.content.length > 200) confidence += 0.1;
    if (response.content.includes('specific') || response.content.includes('detailed')) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}
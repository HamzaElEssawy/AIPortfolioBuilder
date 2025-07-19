export interface ChatResponse {
  content: string;
  modelUsed: string;
  contextUsed: string[];
  suggestedActions?: string[];
  confidenceScore?: number;
  sessionId?: number;
  memoryStored?: boolean;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ConversationContext {
  sessionId?: number;
  userId?: string;
  sessionType?: string;
  recentMemories?: any[];
  relevantDocuments?: any[];
  userProfile?: any;
}

export interface IAIProvider {
  chat(message: string, context?: ConversationContext): Promise<AIResponse>;
  embed(text: string): Promise<number[]>;
  isAvailable(): boolean;
  getName(): string;
}

export interface ChatRequest {
  userId: string;
  prompt: string;
  sessionId?: number;
  sessionType?: string;
}
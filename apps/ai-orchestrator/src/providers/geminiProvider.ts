import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { env, logger, withModule } from "shared-utils";
import type { IAIProvider, AIResponse, ConversationContext } from "../types";

const moduleLogger = withModule('geminiProvider');

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      if (env.GEMINI_API_KEY) {
        this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        moduleLogger.info("Gemini provider initialized successfully");
      } else {
        moduleLogger.warn("GEMINI_API_KEY not found - Gemini unavailable");
      }
    } catch (error) {
      moduleLogger.error("Failed to initialize Gemini provider:", error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getName(): string {
    return "gemini-1.5-pro";
  }

  async chat(message: string, context?: ConversationContext): Promise<AIResponse> {
    if (!this.client) {
      throw new Error("Gemini provider not initialized - missing GEMINI_API_KEY");
    }

    const model = this.client.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: this.buildSystemPrompt(context),
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    try {
      const contextualMessage = this.buildContextualMessage(message, context);
      const result = await model.generateContent(contextualMessage);
      const response = await result.response;
      const content = response.text();

      return {
        content,
        modelUsed: "gemini-1.5-pro",
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount,
          completionTokens: response.usageMetadata?.candidatesTokenCount,
          totalTokens: response.usageMetadata?.totalTokenCount
        }
      };
    } catch (error) {
      moduleLogger.error("Gemini chat error:", error);
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error("Gemini provider not initialized - missing GEMINI_API_KEY");
    }

    try {
      const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values || [];
    } catch (error) {
      moduleLogger.error("Gemini embedding error:", error);
      throw error;
    }
  }

  private buildSystemPrompt(context?: ConversationContext): string {
    let systemPrompt = `You are an AI assistant specialized in career guidance, professional development, and portfolio optimization. You have access to a comprehensive knowledge base about AI product leadership, startup ecosystems, and career advancement strategies.

Key capabilities:
- Resume and portfolio optimization  
- Interview preparation and strategy
- Career path guidance and mentorship
- AI/ML industry insights and trends
- Product leadership and management advice
- Startup and entrepreneurship guidance

Communication style:
- Professional yet approachable
- Provide actionable, specific advice
- Use examples and case studies when relevant
- Be encouraging while being realistic
- Tailor advice to the user's experience level`;

    if (context?.userProfile) {
      systemPrompt += `\n\nUser profile context: ${JSON.stringify(context.userProfile)}`;
    }

    if (context?.recentMemories?.length) {
      systemPrompt += `\n\nRecent conversation context: ${context.recentMemories.map(m => m.content).join('; ')}`;
    }

    if (context?.relevantDocuments?.length) {
      const docSummaries = context.relevantDocuments.map(doc => 
        `${doc.title}: ${doc.summary || doc.content.substring(0, 200)}`
      ).join('\n');
      systemPrompt += `\n\nRelevant knowledge base documents:\n${docSummaries}`;
    }

    return systemPrompt;
  }

  private buildContextualMessage(message: string, context?: ConversationContext): string {
    let contextualMessage = message;

    if (context?.sessionId) {
      contextualMessage = `[Session context available]\n\n${message}`;
    }

    return contextualMessage;
  }
}
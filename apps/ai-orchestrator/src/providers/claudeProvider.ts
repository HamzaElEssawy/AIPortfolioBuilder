import Anthropic from "@anthropic-ai/sdk";
import { env, logger, withModule } from "shared-utils";
import type { IAIProvider, AIResponse, ConversationContext } from "../types";

const moduleLogger = withModule('claudeProvider');

export class ClaudeProvider implements IAIProvider {
  private client: Anthropic | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      if (env.ANTHROPIC_API_KEY) {
        this.client = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });
        moduleLogger.info("Claude provider initialized successfully");
      } else {
        moduleLogger.warn("ANTHROPIC_API_KEY not found - Claude unavailable");
      }
    } catch (error) {
      moduleLogger.error("Failed to initialize Claude provider:", error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getName(): string {
    return "claude-3-5-sonnet";
  }

  async chat(message: string, context?: ConversationContext): Promise<AIResponse> {
    if (!this.client) {
      throw new Error("Claude provider not initialized - missing ANTHROPIC_API_KEY");
    }

    const systemPrompt = this.buildSystemPrompt(context);
    const contextualMessage = this.buildContextualMessage(message, context);

    try {
      const completion = await this.client.messages.create({
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
        usage: {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens
        }
      };
    } catch (error) {
      moduleLogger.error("Claude chat error:", error);
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    // Claude doesn't provide embeddings directly
    throw new Error("Claude provider does not support embeddings");
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
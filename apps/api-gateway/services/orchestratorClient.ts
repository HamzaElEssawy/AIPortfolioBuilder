import { env, logger, withModule } from "../../../packages/shared-utils";

const moduleLogger = withModule('orchestratorClient');

interface ChatRequest {
  userId: string;
  prompt: string;
  sessionId?: number;
  sessionType?: string;
}

interface ChatResponse {
  content: string;
  modelUsed: string;
  contextUsed: string[];
  suggestedActions?: string[];
  confidenceScore?: number;
  sessionId?: number;
  memoryStored?: boolean;
}

export class OrchestratorClient {
  private baseUrl: string;

  constructor() {
    // For now, use localhost - in production this would be a service discovery endpoint
    this.baseUrl = env.AI_ORCHESTRATOR_URL || 'http://localhost:3001';
  }

  async runChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Orchestrator request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      moduleLogger.error('Orchestrator client error:', error);
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      moduleLogger.warn('Orchestrator health check failed:', error);
      return false;
    }
  }
}

export const orchestratorClient = new OrchestratorClient();
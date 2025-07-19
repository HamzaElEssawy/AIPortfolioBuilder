import express from "express";
import cors from "cors";
import { env, logger, withModule } from "shared-utils";
import { Orchestrator } from "./orchestrator";
import { ClaudeProvider } from "./providers/claudeProvider";
import { GeminiProvider } from "./providers/geminiProvider";

const moduleLogger = withModule('ai-orchestrator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize providers
const claudeProvider = new ClaudeProvider();
const geminiProvider = new GeminiProvider();

// Initialize orchestrator with primary and fallback providers
const orchestrator = new Orchestrator(claudeProvider, geminiProvider);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    providers: {
      claude: claudeProvider.isAvailable(),
      gemini: geminiProvider.isAvailable()
    },
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { userId, prompt, sessionId, sessionType } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, prompt' 
      });
    }

    const response = await orchestrator.runChat({
      userId,
      prompt,
      sessionId,
      sessionType
    });

    res.json(response);

  } catch (error) {
    moduleLogger.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
const port = env.PORT || 3001;
app.listen(port, () => {
  moduleLogger.info(`AI Orchestrator server running on port ${port}`);
});
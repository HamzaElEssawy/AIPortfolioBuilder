import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { performanceMiddleware } from "./performance";
import { env, logger } from "../../packages/shared-utils/index.js";
import { cacheMiddleware } from "./cache";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler";

const app = express();

// Trust proxy for accurate IP identification
app.set("trust proxy", true);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// Performance monitoring middleware
app.use(performanceMiddleware);

// Cache middleware for public routes
app.use("/api/portfolio", cacheMiddleware(300)); // 5 minutes
app.use("/api/seo", cacheMiddleware(600)); // 10 minutes

// Rate limiting - More generous for portfolio browsing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Much more generous for portfolio browsing
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "development",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // More reasonable for admin dashboard usage
  message: {
    error: "Too many API requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  skip: () => env.NODE_ENV === "development",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  skip: () => env.NODE_ENV === "development",
});

app.use(limiter);
app.use("/api/", apiLimiter);
app.use("/api/admin/login", authLimiter);

// Body parsing middleware - bypass for file uploads
app.use((req, res, next) => {
  // Skip body parsing entirely for upload endpoints
  if (
    req.path === "/api/admin/knowledge-base/upload" ||
    req.path === "/api/admin/temp-image" ||
    req.path.includes("/upload")
  ) {
    return next();
  }

  // Apply JSON parsing for non-upload routes
  express.json({ limit: "50mb" })(req, res, next);
});

app.use((req, res, next) => {
  // Skip URL encoding for upload endpoints
  if (
    req.path === "/api/admin/knowledge-base/upload" ||
    req.path === "/api/admin/temp-image" ||
    req.path.includes("/upload")
  ) {
    return next();
  }

  express.urlencoded({ extended: false })(req, res, next);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(logLine);
    }
  });

  next();
});

(async () => {
  // Register routes BEFORE any other middleware to handle uploads first
  const server = await registerRoutes(app);

  // SIMPLIFIED APPROACH: No wildcard routes to avoid path-to-regexp issues
  console.log("API Gateway running without client serving - client available on port 5173");
  
  // Simple redirect to React dev server for now
  app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Redirecting...</title>
    <style>
        body { font-family: system-ui; text-align: center; padding: 50px; }
        .redirect-box { max-width: 500px; margin: 0 auto; }
        .btn { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
    </style>
</head>
<body>
    <div class="redirect-box">
        <h1>🚀 AI Portfolio System</h1>
        <p>Your portfolio is ready on the React development server!</p>
        <a href="http://localhost:5173" class="btn">View Portfolio →</a>
        <a href="/api/test" class="btn">Test API</a>
        <br><br>
        <p><small>Services Status:</small></p>
        <div>✅ API Gateway (Port 5000)</div>
        <div>✅ React Client (Port 5173)</div>
        <div>✅ AI Orchestrator (Port 3001)</div>
    </div>
    <script>
        // Auto-redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'http://localhost:5173';
        }, 3000);
    </script>
</body>
</html>`;
    res.send(html);
  });

  // Error handling middleware - must be after all routes including Vite
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Use port 5000 as the main application port
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = env.PORT;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      logger.info(`serving on port ${port}`);
    }
  );
})();

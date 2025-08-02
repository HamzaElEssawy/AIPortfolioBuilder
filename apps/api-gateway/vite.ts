import { Express } from "express";
import express from "express";
import path from "path";
import fs from "fs";
import { Server } from "http";
import { withModule } from "../../packages/shared-utils/index.js";

const viteModuleLogger = withModule("vite");

export async function setupVite(app: Express, server: Server) {
  // BYPASS VITE SERVER ENTIRELY TO AVOID PATH-TO-REGEXP ERRORS
  // Serve static client files directly
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  
  // Serve static files from client directory
  const clientDir = path.resolve(currentDir, "..", "..", "apps", "client");
  app.use(express.static(clientDir));
  
  // Fallback to serving index.html for SPA routing
  app.use("/*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes
    if (url.startsWith('/api/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(clientDir, "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
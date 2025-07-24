import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
// import viteConfig from "../../vite.config.js"; // Commented out due to top-level await issue
import { nanoid } from "nanoid";
import { logger, withModule } from "../../packages/shared-utils/index.js";

const viteLogger = createLogger();
const moduleLogger = withModule('vite');

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Create a basic vite config without importing the problematic config file
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(currentDir, "..", "..", "client"),
    resolve: {
      alias: {
        "@": path.resolve(currentDir, "..", "..", "client", "src"),
        "@shared": path.resolve(currentDir, "..", "shared"),
        "@assets": path.resolve(currentDir, "..", "..", "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(currentDir, "..", "..", "dist/public"),
      emptyOutDir: true,
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        currentDir,
        "..",
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
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
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

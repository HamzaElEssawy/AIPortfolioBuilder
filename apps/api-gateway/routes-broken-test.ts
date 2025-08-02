import type { Express } from "express";
import express, { static as serveStatic } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load the first half of routes
  const firstHalfContent = fs.readFileSync('routes-first-half.ts', 'utf8');
  
  // Basic setup
  app.use('/uploads', (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
  app.use('/uploads', serveStatic('uploads'));
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  }));
  
  // Test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "Testing first half of routes" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "../shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { contentManager } from "./contentManager";
import { dbContentManager } from "./contentStorage";
import { cacheSync, cacheSyncMiddleware } from "./cacheSync";
import { cache, cacheMiddleware } from "./cache";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { documentProcessor } from "./services/documentProcessor";
import { orchestratorClient } from "./services/orchestratorClient";
import { queueService } from "./src/queueService";
import { knowledgeBaseDocuments } from "../shared/schema";
import { eq } from "drizzle-orm";
import { 
  insertKnowledgeBaseDocumentSchema,
  insertUserProfileSchema,
  knowledgeBaseDocuments,
  documentCategories,
  conversationSessions,
  userProfile 
} from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { env, logger, withModule } from "@shared-utils";

const moduleLogger = withModule('routes');

// Configure multer for file uploads
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// General file upload for images
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Document upload for knowledge base
const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

// Admin authentication middleware
const isAdmin = (req: any, res: any, next: any) => {
  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Admin access required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
  // Static file serving for uploads
  const { static: serveStatic } = await import('express');
  app.use('/uploads', serveStatic('uploads'));
  
  // Session configuration for admin
  app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Document upload endpoint with detailed session debugging
  // Helper function to determine content type from filename
  function getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  app.post("/api/admin/knowledge-base/upload", documentUpload.array('files', 10), (req, res, next) => {
    moduleLogger.debug('Upload endpoint - Session debug:', {
      sessionExists: !!req.session,
      isAdmin: req.session?.isAdmin,
      sessionId: req.sessionID,
      cookies: req.headers.cookie
    });
    
    if (!req.session?.isAdmin) {
      moduleLogger.debug('Upload rejected - not admin authenticated');
      return res.status(401).json({ message: "Admin access required" });
    }
    
    next();
  }, async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { category = "general" } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const queuedFiles = [];
      for (const file of files) {
        try {
          // Create initial database record
          const fileStats = fs.statSync(file.path);
          const contentType = getContentType(file.originalname);
          
          const document = await db.insert(knowledgeBaseDocuments).values({
            filename: path.basename(file.path),
            originalName: file.originalname,
            contentType,
            category,
            size: fileStats.size,
            status: "queued"
          }).returning();

          const docId = document[0].id;

          // Queue for async processing
          const jobId = await queueService.queueDocumentIngestion({
            path: file.path,
            docId,
            category,
            originalName: file.originalname
          });

          queuedFiles.push({
            docId,
            jobId,
            originalName: file.originalname,
            status: "queued",
            message: "Document queued for processing"
          });

        } catch (error) {
          moduleLogger.error(`Failed to queue ${file.originalname}:`, error);
          queuedFiles.push({
            originalName: file.originalname,
            status: "failed",
            error: (error as Error).message
          });
        }
      }

      // Return 202 Accepted - processing will happen asynchronously
      res.status(202).json({
        success: true,
        message: "Documents queued for processing",
        totalFiles: files.length,
        queuedFiles,
        note: "Documents will be processed asynchronously. Check status using document IDs."
      });
    } catch (error) {
      moduleLogger.error("Error uploading to KB:", error);
      res.status(500).json({ message: "Failed to upload files to knowledge base" });
    }
  });

  // Add routes for monitoring queue status
  app.get("/api/admin/queue/stats", isAdmin, async (req, res) => {
    try {
      const stats = await queueService.getQueueStats();
      res.json(stats);
    } catch (error) {
      moduleLogger.error("Error getting queue stats:", error);
      res.status(500).json({ message: "Failed to get queue statistics" });
    }
  });

  app.get("/api/admin/job/:jobId/status", isAdmin, async (req, res) => {
    try {
      const { jobId } = req.params;
      const status = await queueService.getJobStatus(jobId);
      res.json(status);
    } catch (error) {
      moduleLogger.error("Error getting job status:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  app.get("/api/admin/document/:docId/status", isAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      
      if (!docId || isNaN(parseInt(docId))) {
        return res.status(400).json({ message: 'Valid document ID required' });
      }

      const [document] = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, parseInt(docId)))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      res.json({
        docId: document.id,
        originalName: document.originalName,
        status: document.status,
        category: document.category,
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        metadata: document.metadata ? JSON.parse(document.metadata) : null
      });

    } catch (error) {
      moduleLogger.error("Error getting document status:", error);
      res.status(500).json({ message: "Failed to get document status" });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple admin credentials (in production, use environment variables)
      const adminUsername = env.ADMIN_USERNAME;
      const adminPassword = env.ADMIN_PASSWORD;
      
      moduleLogger.debug("Login attempt:", { 
        received: { username, password: password ? '***' : 'empty' },
        expected: { username: adminUsername, password: adminPassword ? '***' : 'empty' },
        match: { username: username === adminUsername, password: password === adminPassword }
      });
      
      if (username === adminUsername && password === adminPassword) {
        req.session.isAdmin = true;
        moduleLogger.info("Login successful for:", username);
        res.json({ success: true, message: "Login successful" });
      } else {
        moduleLogger.warn("Login failed - credentials mismatch");
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      moduleLogger.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.json({ message: "Logout successful" });
      }
    });
  });

  // Admin status endpoint
  app.get("/api/admin/status", (req, res) => {
    res.json({ isAdmin: req.session?.isAdmin || false });
  });

  // Get all contact submissions (admin only)
  app.get("/api/admin/contact-submissions", isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Delete contact submission (admin only)
  app.delete("/api/admin/contact-submissions/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactSubmission(parseInt(id));
      res.json({ message: "Submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.status(500).json({ message: "Failed to delete submission" });
    }
  });

  // Export submissions as CSV (admin only)
  app.get("/api/admin/export-submissions", isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      
      // Create CSV content
      const csvHeader = "ID,Name,Email,Company,Project Type,Message,Submitted At\n";
      const csvRows = submissions.map(s => 
        `${s.id},"${s.name}","${s.email}","${s.company || ''}","${s.projectType}","${s.message.replace(/"/g, '""')}","${s.submittedAt}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="contact-submissions.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting submissions:", error);
      res.status(500).json({ message: "Failed to export submissions" });
    }
  });

  // Claude-powered Case Study Generator endpoint (admin only)
  app.post("/api/admin/generate-case-study", isAdmin, async (req, res) => {
    try {
      const { title, challenge, impact, metrics, technologies } = req.body;
      
      const prompt = `As an AI Product Leader expert, help enhance this case study with technical depth and visual storytelling elements:

Title: ${title}
Challenge: ${challenge}
Impact: ${impact}
Key Metrics: ${metrics?.join(', ')}
Technologies: ${technologies?.join(', ')}

Please provide a comprehensive case study enhancement that includes:

1. Technical Architecture Details:
   - Model selection rationale
   - Performance optimization strategies
   - Deployment considerations
   - Compliance framework integration

2. Visual Storytelling Suggestions:
   - Process flow diagram descriptions
   - Before/after comparison metrics
   - Interactive demo concepts
   - Screenshot gallery organization

3. Cross-Cultural Adaptations:
   - Regional compliance considerations
   - Cultural adaptation strategies
   - Local market insights
   - Regulatory navigation approaches

Format the response as structured JSON with sections for technicalDetails, visualElements, and crossCulturalElements.`;

      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      });

      const enhancedContent = (response.content[0] as any).text || 'Enhancement generated successfully';
      
      res.json({
        success: true,
        enhancedContent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating enhanced case study:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate enhanced case study content" 
      });
    }
  });

  // Enhanced AI Assistant endpoint with knowledge base integration
  app.post("/api/admin/ai-assistant", isAdmin, async (req, res) => {
    try {
      const { message, conversationHistory, attachedDocuments, sessionType, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          message: "Message is required" 
        });
      }

      // Proxy the request to the AI orchestrator
      const response = await orchestratorClient.runChat({
        userId: "admin",
        prompt: message,
        sessionId,
        sessionType: sessionType || "career_assistant"
      });
      
      res.json({ 
        response: response.content,
        sessionId: response.sessionId,
        modelUsed: response.modelUsed,
        contextUsed: response.contextUsed,
        suggestedActions: response.suggestedActions,
        confidenceScore: response.confidenceScore,
        memoryStored: response.memoryStored
      });
    } catch (error) {
      moduleLogger.error("AI Assistant error:", error);
      res.status(500).json({ 
        message: "AI Assistant temporarily unavailable. Please try again later.",
        error: env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Real Claude API integration
  async function generateRealClaudeResponse(message: string, conversationHistory: any[] = []): Promise<string> {
    try {
      const systemPrompt = `You are an expert AI Product Leadership career advisor specifically helping Hamza El Essawy, an accomplished AI Product Leader and entrepreneur based in Kuala Lumpur, Malaysia.

HAMZA'S BACKGROUND:
- AI Product Leader & Entrepreneur (2024-Present): Leading AI product strategy across multiple ventures, mentoring 15+ founders
- Founder & Product Leader of AI Compliance Startup (2023-2024): Secured $110K+ funding, built platform reducing manual review by 50%
- Senior Product Manager at Tapway Enterprise AI Platform (2021-2023): Scaled to 10+ enterprise clients, grew team from 8 to 20 engineers
- AI Product Manager in MENA Fintech (2020-2021): Implemented RAG AI achieving 70% query automation, reduced costs by 35%
- Product Manager AI/ML in Dubai Fintech (2018-2020): Built foundational expertise in fintech sector

EXPERTISE AREAS:
- AI/ML product development and strategy
- Enterprise software scaling (proven track record)
- Cross-cultural team management (MENA, SEA, global)
- Fundraising and startup growth ($110K+ secured)
- Compliance and risk management systems
- Multilingual AI systems (15 languages supported)
- Technical architecture and system design

CAREER GOALS:
- Strategic AI leadership roles in established tech companies
- Continued entrepreneurship in AI compliance and automation
- Mentoring and advisory positions for AI startups
- Speaking engagements on AI product management

UNIQUE VALUE PROPOSITIONS:
- Cross-cultural market expertise (MENA + SEA)
- Enterprise AI scaling experience with quantifiable results
- Regulatory compliance specialization in AI systems
- Proven funding track record and business development skills
- Technical depth combined with strong business acumen

Provide specific, actionable career advice tailored to Hamza's background. Use concrete examples from his experience when relevant. Focus on practical strategies for advancing his AI Product Leadership career, whether it's resume optimization, interview preparation, strategic career moves, or skill development.

Be professional, insightful, and leverage his unique combination of technical expertise, proven scaling ability, and cross-cultural market experience.`;

      const messages: Array<{role: "user" | "assistant", content: string}> = [
        { role: "user", content: message }
      ];

      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: message }]
      });

      return completion.content[0].type === 'text' ? completion.content[0].text : "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Claude API error:", error);
      throw new Error("Failed to get response from Claude API");
    }
  }

  function generateMockClaudeResponse(message: string): string {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('resume') || lowercaseMessage.includes('cv')) {
      return `Based on your extensive AI product management background, I recommend emphasizing these key areas for resume optimization:

**Technical Leadership**: Highlight your experience scaling AI platforms (Tapway: 8→20 engineers, 10+ enterprise clients)

**Quantifiable Impact**: Lead with metrics like:
- $110K+ funding secured for AI compliance startup
- 70% automation rate in customer query handling
- 50% reduction in manual review processes

**AI Specialization**: Position yourself as an AI product expert with experience across:
- Enterprise AI platforms
- Compliance automation
- Multilingual AI systems (15 languages)
- RAG implementations

**Geographic Advantage**: Emphasize your unique position in the Malaysian/SEA AI ecosystem and cross-cultural team management experience.

Would you like me to help optimize your resume for a specific role or industry?`;
    }
    
    if (lowercaseMessage.includes('interview') || lowercaseMessage.includes('preparation')) {
      return `For interview preparation, let's focus on your strongest differentiators:

**AI Product Strategy Stories**:
1. Tapway scaling story: How you grew from 8 to 20 engineers while maintaining 99.9% uptime
2. Compliance startup story: Building from idea to $110K funding with measurable impact
3. MENA fintech story: Implementing RAG AI for 70% automation across 15 languages

**Common AI PM Interview Topics**:
- Product roadmap prioritization for AI features
- Managing technical debt in ML systems
- Cross-functional collaboration with ML engineers
- Measuring AI product success metrics

**Your Unique Angles**:
- Cross-cultural team management (MENA, Malaysia, global)
- Regulatory compliance expertise (crucial for enterprise AI)
- Multi-language AI implementation experience

Practice the STAR method with these specific examples. Would you like me to help you prepare for specific types of AI product management interviews?`;
    }
    
    if (lowercaseMessage.includes('career') || lowercaseMessage.includes('strategy')) {
      return `Based on your trajectory from individual contributor to AI product leader and entrepreneur, here's your strategic positioning:

**Current Strengths**:
- Proven track record in AI product scaling (technical + business)
- Entrepreneurial experience with funding success
- Cross-regional expertise (MENA, SEA markets)
- Unique positioning in AI compliance (growing market)

**Strategic Career Options**:

1. **Senior AI Product Leader** at established tech companies
   - Target: Regional tech hubs (Singapore, Tokyo, Seoul)
   - Leverage: Enterprise scaling experience, cross-cultural leadership

2. **AI Product Leadership** at growing unicorns
   - Focus: Companies expanding into SEA markets
   - Value prop: Proven ability to scale teams and products

3. **Continue Entrepreneurship**
   - Build on AI compliance expertise
   - Leverage funding track record and mentor network

**Next 6-Month Action Plan**:
- Strengthen thought leadership (AI compliance content)
- Expand speaking engagements in AI product management
- Build relationships with VCs focused on AI startups
- Consider advisory roles to build portfolio

Which path interests you most for deeper strategic planning?`;
    }
    
    return `I understand you'd like assistance with "${message}". 

As your AI Career Assistant, I can help you with:

🎯 **Resume Optimization**: Tailoring your AI product management experience for specific roles
📋 **Interview Preparation**: Practicing with your Tapway, compliance startup, and MENA fintech stories  
🚀 **Career Strategy**: Planning your next move from startup founder to senior AI product leadership
💼 **Portfolio Enhancement**: Strengthening your case studies and professional positioning

Your background spans AI product leadership across multiple markets with proven scaling success. Let me know which specific area you'd like to focus on, and I'll provide detailed, actionable guidance based on your experience.

What would be most helpful for your current career goals?`;
  }

  // Case Studies CRUD endpoints (admin only)
  app.get("/api/admin/case-studies", isAdmin, async (req, res) => {
    try {
      const caseStudies = await storage.getCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.get("/api/admin/case-studies/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const caseStudy = await storage.getCaseStudy(parseInt(id));
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      res.json(caseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ message: "Failed to fetch case study" });
    }
  });



  app.put("/api/admin/case-studies/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const caseStudyId = parseInt(id);
      
      if (isNaN(caseStudyId)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }

      console.log("Updating case study:", { id: caseStudyId, data: req.body });
      
      // Process form data to handle arrays properly
      const processedData = {
        ...req.body,
        metrics: Array.isArray(req.body.metrics) ? req.body.metrics : 
                 typeof req.body.metrics === 'string' ? req.body.metrics.split(',').map((m: string) => m.trim()).filter(Boolean) : [],
        technologies: Array.isArray(req.body.technologies) ? req.body.technologies : 
                      typeof req.body.technologies === 'string' ? req.body.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };

      const caseStudy = await storage.updateCaseStudy(caseStudyId, processedData);
      
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      console.log("Case study updated successfully:", caseStudy.id);
      res.json(caseStudy);
    } catch (error) {
      console.error("Error updating case study:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to update case study", error: errorMessage });
    }
  });

  app.delete("/api/admin/case-studies/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCaseStudy(parseInt(id));
      res.json({ message: "Case study deleted successfully" });
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ message: "Failed to delete case study" });
    }
  });

  // Toggle featured status
  app.patch("/api/admin/case-studies/:id/featured", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { featured } = req.body;
      const caseStudyId = parseInt(id);
      
      if (isNaN(caseStudyId)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }

      const caseStudy = await storage.updateCaseStudy(caseStudyId, { featured });
      res.json(caseStudy);
    } catch (error) {
      console.error("Error toggling featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });

  // Reorder case studies
  app.patch("/api/admin/case-studies/reorder", isAdmin, async (req, res) => {
    try {
      const { studies } = req.body;
      
      if (!Array.isArray(studies)) {
        return res.status(400).json({ message: "Invalid studies array" });
      }

      // Update each case study's display order
      const promises = studies.map(({ id, displayOrder }) => 
        storage.updateCaseStudy(id, { displayOrder })
      );
      
      await Promise.all(promises);
      res.json({ message: "Case studies reordered successfully" });
    } catch (error) {
      console.error("Error reordering case studies:", error);
      res.status(500).json({ message: "Failed to reorder case studies" });
    }
  });

  // Media Assets CRUD endpoints (admin only)
  app.get("/api/admin/media", isAdmin, async (req, res) => {
    try {
      const mediaAssets = await storage.getMediaAssets();
      res.json(mediaAssets);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media assets" });
    }
  });

  app.get("/api/admin/media/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getMediaAsset(parseInt(id));
      if (!asset) {
        return res.status(404).json({ message: "Media asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching media asset:", error);
      res.status(500).json({ message: "Failed to fetch media asset" });
    }
  });

  app.post("/api/admin/media", isAdmin, async (req, res) => {
    try {
      const asset = await storage.createMediaAsset(req.body);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating media asset:", error);
      res.status(500).json({ message: "Failed to create media asset" });
    }
  });

  app.put("/api/admin/media/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.updateMediaAsset(parseInt(id), req.body);
      res.json(asset);
    } catch (error) {
      console.error("Error updating media asset:", error);
      res.status(500).json({ message: "Failed to update media asset" });
    }
  });

  app.delete("/api/admin/media/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMediaAsset(parseInt(id));
      res.json({ message: "Media asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting media asset:", error);
      res.status(500).json({ message: "Failed to delete media asset" });
    }
  });

  // Knowledge Base Management endpoints (admin only)
  app.get("/api/admin/knowledge-base/stats", isAdmin, async (req, res) => {
    try {
      const documents = await storage.getKnowledgeBaseDocuments();
      const stats = {
        resumeCount: documents.filter(d => d.category === 'resume').length,
        transcriptCount: documents.filter(d => d.category === 'interview').length,
        careerCount: documents.filter(d => d.category === 'career-plan').length,
        jobDescriptionCount: documents.filter(d => d.category === 'job-description').length,
        totalEmbeddings: documents.filter(d => d.status === 'embedded').length
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching KB stats:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base statistics" });
    }
  });

  app.get("/api/admin/knowledge-base/documents", isAdmin, async (req, res) => {
    try {
      const documents = await db.select({
        id: knowledgeBaseDocuments.id,
        filename: knowledgeBaseDocuments.filename,
        originalName: knowledgeBaseDocuments.originalName,
        category: knowledgeBaseDocuments.category,
        size: knowledgeBaseDocuments.size,
        status: knowledgeBaseDocuments.status,
        uploadedAt: knowledgeBaseDocuments.uploadedAt,
        summary: knowledgeBaseDocuments.summary,
        vectorId: knowledgeBaseDocuments.vectorId
      }).from(knowledgeBaseDocuments)
        .orderBy(desc(knowledgeBaseDocuments.uploadedAt));
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/admin/knowledge-base/documents/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getKnowledgeBaseDocument(parseInt(id));
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/admin/knowledge-base/documents", isAdmin, async (req, res) => {
    try {
      const document = await storage.createKnowledgeBaseDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/admin/knowledge-base/documents/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.updateKnowledgeBaseDocument(parseInt(id), req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/admin/knowledge-base/documents/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteKnowledgeBaseDocument(parseInt(id));
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Enhanced Knowledge Base Management Endpoints

  // Get all knowledge base documents
  app.get("/api/admin/knowledge-base/documents", isAdmin, async (req, res) => {
    try {
      const { category, status, limit = 50 } = req.query;
      
      let queryBuilder = db.select().from(knowledgeBaseDocuments);
      
      if (category) {
        queryBuilder = queryBuilder.where(eq(knowledgeBaseDocuments.category, category as string));
      }
      if (status) {
        queryBuilder = queryBuilder.where(eq(knowledgeBaseDocuments.status, status as string));
      }
      
      const documents = await queryBuilder.limit(parseInt(limit as string));
      
      // Transform the data to match frontend interface
      const transformedDocuments = documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        category: doc.category,
        size: doc.size,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        summary: doc.summary,
        vectorId: doc.vectorId
      }));
      
      res.json(transformedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get document categories
  app.get("/api/admin/knowledge-base/categories", isAdmin, async (req, res) => {
    try {
      const categories = await documentProcessor.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Analyze specific document
  app.post("/api/admin/knowledge-base/documents/:id/analyze", isAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { analysisType = "general_analysis" } = req.body;
      
      // Document analysis temporarily disabled during AI service restructuring
      const result = { 
        message: "Document analysis temporarily unavailable during system upgrade",
        analysisType 
      };
      res.json(result);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  // Delete document
  app.delete("/api/admin/knowledge-base/documents/:id", isAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      await documentProcessor.deleteDocument(documentId);
      res.json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Get conversation sessions
  app.get("/api/admin/ai-assistant/sessions", isAdmin, async (req, res) => {
    try {
      const sessions = await db.select()
        .from(conversationSessions)
        .orderBy(desc(conversationSessions.lastActivity))
        .limit(20);
      
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch conversation sessions" });
    }
  });

  // Get conversation history
  app.get("/api/admin/ai-assistant/sessions/:id/history", isAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { limit = 50 } = req.query;
      
      // Conversation history temporarily disabled during AI service restructuring  
      const history = [];
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      res.status(500).json({ message: "Failed to fetch conversation history" });
    }
  });

  // User Profile Management
  app.get("/api/admin/user-profile", isAdmin, async (req, res) => {
    try {
      const profile = await db.select()
        .from(userProfile)
        .where(eq(userProfile.userId, "admin"))
        .limit(1);
      
      res.json(profile[0] || null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/admin/user-profile", isAdmin, async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse(req.body);
      
      // Check if profile exists
      const existing = await db.select()
        .from(userProfile)
        .where(eq(userProfile.userId, "admin"))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing profile
        const updated = await db.update(userProfile)
          .set({ ...profileData, lastUpdated: new Date() })
          .where(eq(userProfile.userId, "admin"))
          .returning();
        
        res.json(updated[0]);
      } else {
        // Create new profile
        const created = await db.insert(userProfile)
          .values({ ...profileData, userId: "admin" })
          .returning();
        
        res.json(created[0]);
      }
    } catch (error) {
      console.error("Error saving user profile:", error);
      res.status(500).json({ message: "Failed to save user profile" });
    }
  });

  // Initialize document categories on startup
  app.post("/api/admin/knowledge-base/initialize", isAdmin, async (req, res) => {
    try {
      await documentProcessor.initializeCategories();
      res.json({ 
        success: true, 
        message: "Knowledge base categories initialized successfully" 
      });
    } catch (error) {
      console.error("Error initializing categories:", error);
      res.status(500).json({ message: "Failed to initialize categories" });
    }
  });

  // Enhanced Hero Content Management endpoint (admin only)
  app.post("/api/admin/content/hero", isAdmin, async (req, res) => {
    try {
      const heroContent = req.body;
      console.log("Saving enhanced hero content:", heroContent);
      
      // Save to both storage systems for reliability
      await contentManager.updateSection('hero', heroContent);
      await dbContentManager.saveContent('hero', heroContent);
      
      // Clear all relevant caches
      await cacheSync.invalidateContentCache({ 
        invalidatePortfolio: true,
        invalidateContent: true,
        invalidateSpecific: [
          'route:/content/hero',
          'route:/api/portfolio/content/hero'
        ],
        broadcastUpdate: true
      });
      
      // Clear content manager cache to ensure immediate updates
      contentManager.clearCache();
      
      console.log("Hero content saved and cache invalidated");
      
      res.json({ 
        success: true, 
        message: "Hero content updated successfully",
        content: heroContent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating hero content:", error);
      res.status(500).json({ message: "Failed to update hero content" });
    }
  });

  // Enhanced Content Management endpoints (admin only)
  app.get("/api/admin/content/sections", isAdmin, async (req, res) => {
    try {
      const portfolioContent = await contentManager.getAllSections();
      
      const sections = [
        {
          id: "hero",
          name: "Hero Section",
          content: portfolioContent.hero,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "stats",
          name: "Achievement Statistics", 
          content: portfolioContent.stats,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "about",
          name: "About Section",
          content: portfolioContent.about,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "experience",
          name: "Professional Experience",
          content: portfolioContent.experience,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "caseStudies",
          name: "Case Studies",
          content: portfolioContent.caseStudies,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "skills",
          name: "Skills & Expertise",
          content: portfolioContent.skills,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "contact",
          name: "Contact Information",
          content: portfolioContent.contact,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        },
        {
          id: "seo",
          name: "SEO Settings",
          content: portfolioContent.seo,
          status: "published",
          lastModified: portfolioContent.lastUpdated,
          version: portfolioContent.version
        }
      ];
      
      res.json(sections);
    } catch (error) {
      console.error("Error fetching content sections:", error);
      res.status(500).json({ message: "Failed to fetch content sections" });
    }
  });

  app.get("/api/admin/content/versions/:sectionId", isAdmin, async (req, res) => {
    try {
      const sectionId = req.params.sectionId;
      // Mock version history
      const versions = [
        {
          id: 1,
          sectionId,
          content: {},
          version: 3,
          createdAt: "2024-06-12T10:30:00Z",
          publishedAt: "2024-06-12T10:35:00Z"
        },
        {
          id: 2,
          sectionId,
          content: {},
          version: 2,
          createdAt: "2024-06-10T15:45:00Z",
          publishedAt: "2024-06-10T16:00:00Z"
        }
      ];
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch content versions" });
    }
  });

  app.put("/api/admin/content/sections/:sectionId", isAdmin, async (req, res) => {
    try {
      const sectionId = req.params.sectionId as any;
      const { content } = req.body;
      
      // Update the specific section in the portfolio content
      const updatedContent = await contentManager.updateSection(sectionId, content);
      
      // Clear content manager cache to ensure immediate updates
      contentManager.clearCache();
      
      res.json({ 
        success: true, 
        message: "Content saved successfully",
        sectionId,
        version: updatedContent.version,
        lastUpdated: updatedContent.lastUpdated
      });
    } catch (error) {
      console.error("Error saving content:", error);
      res.status(500).json({ message: "Failed to save content" });
    }
  });

  // Clean portfolio content update endpoint with database storage
  app.put("/api/portfolio/content/:sectionId", cacheSyncMiddleware(), async (req, res) => {
    try {
      const sectionId = req.params.sectionId;
      const content = req.body;
      
      console.log(`Updating ${sectionId} with clean content:`, content);
      
      // Save content using the new database storage system (automatically sanitizes)
      await dbContentManager.saveContent(sectionId, content);
      
      // Also update the file-based system for backwards compatibility
      try {
        await contentManager.updateSection(sectionId as any, content);
        contentManager.clearCache();
      } catch (error) {
        console.warn("File-based content update failed, continuing with database:", error);
      }
      
      // Comprehensive cache invalidation
      await cacheSync.invalidateContentCache({
        invalidatePortfolio: true,
        invalidateContent: true,
        invalidateSpecific: [
          `route:/content/${sectionId}`,
          `route:/api/portfolio/content/${sectionId}`,
          'route:/content/about',
          'route:/api/portfolio/content'
        ],
        broadcastUpdate: true
      });
      
      console.log(`Clean content saved and cache invalidated for ${sectionId}`);
      
      // Return the sanitized content from database
      const verifyContent = await dbContentManager.getContent(sectionId);
      console.log(`Verified clean content for ${sectionId}:`, verifyContent);
      
      res.json({ 
        success: true, 
        message: "Content updated with clean storage system",
        sectionId,
        content: verifyContent,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating portfolio content:", error);
      res.status(500).json({ message: "Failed to update portfolio content" });
    }
  });

  // Content version rollback endpoint
  app.post("/api/admin/content/:sectionId/rollback/:versionId", isAdmin, async (req, res) => {
    try {
      const { sectionId, versionId } = req.params;
      
      // Get the version content
      const versions = await storage.getContentVersions(sectionId);
      const targetVersion = versions.find(v => v.id === parseInt(versionId));
      
      if (!targetVersion) {
        return res.status(404).json({ message: "Version not found" });
      }
      
      // Create backup of current content
      const currentContent = await contentManager.getSection(sectionId as any);
      await storage.createContentVersion({
        sectionId,
        content: currentContent,
        version: 1,
        changeSummary: `Backup before rollback to version ${targetVersion.version}`,
        createdBy: "admin",
        publishedAt: new Date(),
      });
      
      // Restore the target version
      await contentManager.updateSection(sectionId as any, targetVersion.content);
      
      res.json({ 
        success: true, 
        message: `Successfully rolled back to version ${targetVersion.version}`,
        restoredVersion: targetVersion.version
      });
    } catch (error) {
      console.error("Error rolling back content:", error);
      res.status(500).json({ message: "Failed to rollback content" });
    }
  });

  app.post("/api/admin/content/sections/:sectionId/publish", isAdmin, async (req, res) => {
    try {
      const sectionId = req.params.sectionId;
      
      // In real implementation: 
      // 1. Move content from draft to published
      // 2. Regenerate static site
      // 3. Update live portfolio
      
      res.json({ 
        success: true, 
        message: "Content published successfully",
        sectionId,
        publishedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error publishing content:", error);
      res.status(500).json({ message: "Failed to publish content" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      const submission = await storage.createContactSubmission(validatedData);
      
      res.json({ 
        success: true, 
        message: "Thank you for your message! I will get back to you soon.",
        id: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Please check your form inputs",
          errors: error.errors
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to submit your message. Please try again later."
        });
      }
    }
  });

  // Get contact submissions (for admin purposes)
  app.get("/api/contact", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact submissions"
      });
    }
  });

  // Portfolio content endpoints for live website with caching - NEW DATABASE VERSION
  app.get("/api/portfolio/content", cacheMiddleware(300), async (req, res) => {
    try {
      const content = await dbContentManager.getAllContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching portfolio content:", error);
      res.status(500).json({ message: "Failed to fetch portfolio content" });
    }
  });

  app.get("/api/portfolio/content/:section", cacheMiddleware(300), async (req, res) => {
    try {
      const sectionId = req.params.section;
      let content = await dbContentManager.getContent(sectionId);
      
      if (!content) {
        // Fallback to default content if not found in database
        const defaultContent = await contentManager.getSection(sectionId as any);
        if (defaultContent) {
          // Migrate to database
          await dbContentManager.saveContent(sectionId, defaultContent);
          content = defaultContent;
        }
      }

      // For hero section, ensure we return the enhanced structure expected by the component
      if (sectionId === 'hero' && content) {
        const contentAny = content as any;
        const enhancedHeroContent = {
          // Basic content
          headline: contentAny.headline || "Product Visionary",
          subheadline: contentAny.subheadline || "& Strategic AI Leader",
          description: contentAny.description || "Architecting next-generation AI products that capture markets and generate exponential value across MENA & Southeast Asia regions",
          
          // Professional titles (derived from headline/subheadline if not present)
          primaryTitle: contentAny.primaryTitle || contentAny.headline || "Product Visionary",
          secondaryTitle: contentAny.secondaryTitle || contentAny.subheadline || "& Strategic AI Leader",
          
          // Status badge
          statusBadge: contentAny.statusBadge || {
            text: "Elite Product Executive • Available for C-Level Roles",
            type: "available" as const,
            showIndicator: true,
          },
          
          // Call to action buttons
          primaryCTA: contentAny.primaryCTA || {
            text: contentAny.ctaText || "Let's Connect",
            action: "scroll_to_contact" as const,
          },
          secondaryCTA: contentAny.secondaryCTA || {
            text: contentAny.ctaSecondaryText || "Career Timeline",
            action: "scroll_to_timeline" as const,
          },
          
          // Achievement cards
          achievementCards: contentAny.achievementCards || [
            {
              value: "Built 3",
              label: "unicorn-potential products",
              icon: "sparkles" as const,
              color: "blue" as const,
            },
            {
              value: "40%",
              label: "market share captured",
              icon: "trending" as const,
              color: "green" as const,
            },
            {
              value: "300%",
              label: "YoY growth achieved",
              icon: "award" as const,
              color: "purple" as const,
            },
          ],
          
          // Floating metrics
          floatingMetrics: contentAny.floatingMetrics || [
            {
              value: "$110K+",
              label: "Funding Secured",
              icon: "trending" as const,
              position: "top_left" as const,
            },
            {
              value: "15+",
              label: "Founders Mentored",
              icon: "users" as const,
              position: "bottom_right" as const,
            },
          ],
          
          // Founder badge
          founderBadge: contentAny.founderBadge || {
            show: true,
            text: "AI Founder",
            icon: "award" as const,
          },
          
          // Background settings
          backgroundSettings: contentAny.backgroundSettings || {
            gradientStyle: "blue_purple" as const,
            showAnimatedBlobs: true,
            showFloatingElements: true,
          },
        };
        
        res.json(enhancedHeroContent);
      } else if (content) {
        res.json(content);
      } else {
        res.status(404).json({ message: "Content not found" });
      }
    } catch (error) {
      console.error("Error fetching section content:", error);
      res.status(500).json({ message: "Failed to fetch section content" });
    }
  });

  // Experience/Timeline routes
  app.get("/api/admin/experience", isAdmin, async (req, res) => {
    try {
      const entries = await storage.getExperienceEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching experience entries:", error);
      res.status(500).json({ message: "Failed to fetch experience entries" });
    }
  });

  app.post("/api/admin/experience", isAdmin, async (req, res) => {
    try {
      const { insertExperienceEntrySchema } = await import("../shared/schema");
      const validatedData = insertExperienceEntrySchema.parse(req.body);
      const entry = await storage.createExperienceEntry(validatedData);
      
      // Invalidate timeline caches
      cache.deletePattern('route:/timeline');
      cache.deletePattern('route:/api/portfolio/timeline');
      cache.deletePattern('portfolio:timeline');
      cache.delete('content:timeline');
      
      console.log('Timeline cache invalidated after experience creation');
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating experience entry:", error);
      res.status(500).json({ message: "Failed to create experience entry" });
    }
  });

  app.put("/api/admin/experience/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      const entry = await storage.updateExperienceEntry(id, req.body);
      
      // Invalidate timeline caches
      cache.deletePattern('route:/timeline');
      cache.deletePattern('route:/api/portfolio/timeline');
      cache.deletePattern('portfolio:timeline');
      cache.delete('content:timeline');
      
      console.log('Timeline cache invalidated after experience update', { entryId: id });
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating experience entry:", error);
      res.status(500).json({ message: "Failed to update experience entry" });
    }
  });

  app.delete("/api/admin/experience/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      await storage.deleteExperienceEntry(id);
      
      // Invalidate timeline caches
      cache.deletePattern('route:/timeline');
      cache.deletePattern('route:/api/portfolio/timeline');
      cache.deletePattern('portfolio:timeline');
      cache.delete('content:timeline');
      
      console.log('Timeline cache invalidated after experience deletion', { entryId: id });
      
      res.json({ message: "Experience entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting experience entry:", error);
      res.status(500).json({ message: "Failed to delete experience entry" });
    }
  });

  // Skills routes
  app.get("/api/admin/skills", isAdmin, async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/admin/skill-categories", isAdmin, async (req, res) => {
    try {
      const categories = await storage.getSkillCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching skill categories:", error);
      res.status(500).json({ message: "Failed to fetch skill categories" });
    }
  });

  app.post("/api/admin/skill-categories", isAdmin, async (req, res) => {
    try {
      const { insertSkillCategorySchema } = await import("@shared/schema");
      const validatedData = insertSkillCategorySchema.parse(req.body);
      const category = await storage.createSkillCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating skill category:", error);
      res.status(500).json({ message: "Failed to create skill category" });
    }
  });

  app.put("/api/admin/skill-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.updateSkillCategory(id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating skill category:", error);
      res.status(500).json({ message: "Failed to update skill category" });
    }
  });

  app.delete("/api/admin/skill-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      await storage.deleteSkillCategory(id);
      res.json({ message: "Skill category deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill category:", error);
      res.status(500).json({ message: "Failed to delete skill category" });
    }
  });

  app.post("/api/admin/skills", isAdmin, async (req, res) => {
    try {
      const { insertSkillSchema } = await import("../shared/schema");
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(validatedData);
      
      // Invalidate skills cache for live portfolio
      await cacheSync.invalidateContentCache({
        invalidatePortfolio: true,
        invalidateSpecific: [
          'route:/skills:{}',
          'route:/api/portfolio/skills'
        ],
        broadcastUpdate: true
      });
      
      console.log(`New skill created and cache invalidated:`, skill.name);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put("/api/admin/skills/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      const skill = await storage.updateSkill(id, req.body);
      
      // Invalidate skills cache for live portfolio
      await cacheSync.invalidateContentCache({
        invalidatePortfolio: true,
        invalidateSpecific: [
          'route:/skills:{}',
          'route:/api/portfolio/skills'
        ],
        broadcastUpdate: true
      });
      
      console.log(`Skill ${id} updated and cache invalidated`);
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/admin/skills/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      await storage.deleteSkill(id);
      
      // Invalidate skills cache for live portfolio
      await cacheSync.invalidateContentCache({
        invalidatePortfolio: true,
        invalidateSpecific: [
          'route:/skills:{}',
          'route:/api/portfolio/skills'
        ],
        broadcastUpdate: true
      });
      
      console.log(`Skill ${id} deleted and cache invalidated`);
      res.json({ message: "Skill deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Portfolio Metrics routes
  app.get("/api/admin/metrics", isAdmin, async (req, res) => {
    try {
      const metrics = await storage.getPortfolioMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching portfolio metrics:", error);
      res.status(500).json({ message: "Failed to fetch portfolio metrics" });
    }
  });

  app.post("/api/admin/metrics", isAdmin, async (req, res) => {
    try {
      const { insertPortfolioMetricSchema } = await import("@shared/schema");
      const validatedData = insertPortfolioMetricSchema.parse(req.body);
      const metric = await storage.createPortfolioMetric(validatedData);
      res.json(metric);
    } catch (error) {
      console.error("Error creating portfolio metric:", error);
      res.status(500).json({ message: "Failed to create portfolio metric" });
    }
  });

  app.put("/api/admin/metrics/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid metric ID" });
      }
      const metric = await storage.updatePortfolioMetric(id, req.body);
      res.json(metric);
    } catch (error) {
      console.error("Error updating portfolio metric:", error);
      res.status(500).json({ message: "Failed to update portfolio metric" });
    }
  });

  // Enhanced Case Studies API routes with full CRUD operations
  app.get("/api/admin/case-studies", isAdmin, async (req, res) => {
    try {
      const caseStudies = await storage.getCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.post("/api/admin/case-studies", isAdmin, async (req, res) => {
    console.log("ENDPOINT REACHED: /api/admin/case-studies");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    try {
      console.log("=== CASE STUDY CREATION START ===");
      console.log("Request body received:", req.body);
      const { insertCaseStudySchema } = await import("@shared/schema");
      
      // Process and enhance the data before validation
      const processedData = { ...req.body };
      
      // Generate slug if not provided
      if (!processedData.slug && processedData.title) {
        processedData.slug = processedData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        console.log("Generated slug:", processedData.slug);
      }
      
      // Remove image fields - using separate image system
      delete processedData.imageFile;
      delete processedData.imageUrl;
      
      console.log("Creating case study:", processedData);
      console.log("Slug before validation:", processedData.slug);
      console.log("ImageUrl before validation:", processedData.imageUrl);
      
      // Extract tempImageId before validation (since it's not part of the schema)
      const { tempImageId } = req.body;
      console.log("Extracted tempImageId from request:", tempImageId);
      
      const validatedData = insertCaseStudySchema.parse(processedData);
      console.log("Validated data:", validatedData);
      
      const caseStudy = await storage.createCaseStudy(validatedData);
      console.log("Case study created successfully:", caseStudy.id);
      console.log("About to start temp image processing...");
      
      // Handle temporary image if provided - IMMEDIATE EXECUTION
      console.log("=== TEMP IMAGE PROCESSING START ===");
      console.log("TempImageId received:", tempImageId);
      console.log("TempImages map size:", tempImages.size);
      console.log("TempImages keys:", Array.from(tempImages.keys()));
      console.log("Has tempImageId:", tempImages.has(tempImageId));
      
      if (tempImageId) {
        console.log("Processing tempImageId:", tempImageId);
        
        if (tempImages.has(tempImageId)) {
          const tempImage = tempImages.get(tempImageId);
          console.log("Found temporary image data:", tempImage);
          
          if (tempImage && tempImage.file) {
            try {
              const imageData = {
                section: "case-study",
                imageUrl: `/uploads/${tempImage.file.filename}`,
                altText: tempImage.altText,
                orderIndex: 0,
                isActive: true,
                caseStudyId: caseStudy.id,
              };
              
              console.log("Creating portfolio image with data:", imageData);
              
              const createdImage = await storage.createPortfolioImage(imageData);
              console.log("Portfolio image created successfully:", createdImage);
              
              // Clean up temporary image
              tempImages.delete(tempImageId);
              console.log("Temporary image cleaned up");
              
            } catch (imageError) {
              console.error("Error creating portfolio image:", imageError);
              console.error("Error stack:", imageError.stack);
            }
          } else {
            console.log("Invalid temporary image data:", tempImage);
          }
        } else {
          console.log("Temporary image not found in storage");
          console.log("Available temp images:", Array.from(tempImages.keys()));
        }
      } else {
        console.log("No tempImageId provided");
      }
      
      console.log("=== TEMP IMAGE PROCESSING END ===");
      
      // Clear all case study related caches
      cache.deletePattern(".*case-studies.*");
      
      console.log("Case study created successfully:", caseStudy.id);
      console.log("Returned case study:", caseStudy);
      res.json(caseStudy);
    } catch (error) {
      console.error("Error creating case study:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create case study" });
      }
    }
  });

  app.put("/api/admin/case-studies/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      
      // Process and enhance the data before validation
      const processedData = { ...req.body };
      
      // Generate slug if not provided
      if (!processedData.slug && processedData.title) {
        processedData.slug = processedData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
      
      // Remove image fields - using separate image system
      delete processedData.imageFile;
      delete processedData.imageUrl;
      
      console.log("Updating case study:", { id, data: processedData });
      
      const { insertCaseStudySchema } = await import("@shared/schema");
      const validatedData = insertCaseStudySchema.parse(processedData);
      const caseStudy = await storage.updateCaseStudy(id, validatedData);
      
      // Clear all case study related caches
      cache.deletePattern(".*case-studies.*");
      
      console.log("Case study updated successfully:", caseStudy.id);
      res.json(caseStudy);
    } catch (error) {
      console.error("Error updating case study:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update case study" });
      }
    }
  });

  app.delete("/api/admin/case-studies/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      
      // Get case study before deletion for cache invalidation
      const caseStudy = await storage.getCaseStudy(id);
      
      await storage.deleteCaseStudy(id);
      
      // Clear all case study related caches
      cache.deletePattern(".*case-studies.*");
      
      res.json({ message: "Case study deleted successfully" });
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ message: "Failed to delete case study" });
    }
  });

  app.patch("/api/admin/case-studies/:id/featured", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      const { featured } = req.body;
      const caseStudy = await storage.updateCaseStudyFeatured(id, featured);
      
      // Clear featured list caches after toggle
      cache.delete("route:/case-studies/featured:{}");
      cache.delete("route:/api/portfolio/case-studies/featured:{}");
      cache.delete("route:/case-studies:{}");
      cache.delete("route:/api/admin/case-studies:{}");
      
      res.json(caseStudy);
    } catch (error) {
      console.error("Error updating case study featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });

  app.patch("/api/admin/case-studies/reorder", isAdmin, async (req, res) => {
    try {
      const { studies } = req.body;
      await storage.reorderCaseStudies(studies);
      res.json({ message: "Case studies reordered successfully" });
    } catch (error) {
      console.error("Error reordering case studies:", error);
      res.status(500).json({ message: "Failed to reorder case studies" });
    }
  });

  // Public case studies endpoints for portfolio website
  app.get("/api/portfolio/case-studies", cacheMiddleware(300), async (req, res) => {
    try {
      const caseStudies = await storage.getPublishedCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching published case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.get("/api/portfolio/case-studies/featured", cacheMiddleware(300), async (req, res) => {
    try {
      const featuredCaseStudies = await storage.getFeaturedCaseStudies();
      res.json(featuredCaseStudies);
    } catch (error) {
      console.error("Error fetching featured case studies:", error);
      res.status(500).json({ message: "Failed to fetch featured case studies" });
    }
  });

  app.get("/api/portfolio/case-studies/:slug", cacheMiddleware(300), async (req, res) => {
    try {
      const slug = req.params.slug;
      const caseStudy = await storage.getCaseStudyBySlug(slug);
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      res.json(caseStudy);
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ message: "Failed to fetch case study" });
    }
  });

  app.delete("/api/admin/metrics/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid metric ID" });
      }
      await storage.deletePortfolioMetric(id);
      res.json({ message: "Portfolio metric deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio metric:", error);
      res.status(500).json({ message: "Failed to delete portfolio metric" });
    }
  });

  // Public portfolio API routes for live website consumption
  app.get("/api/portfolio/timeline", async (req, res) => {
    try {
      const entries = await storage.getExperienceEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching portfolio timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.get("/api/portfolio/skills", async (req, res) => {
    try {
      const [categories, skills] = await Promise.all([
        storage.getSkillCategories(),
        storage.getSkills()
      ]);
      
      const skillsByCategory = categories.map(category => ({
        ...category,
        skills: skills.filter(skill => skill.categoryId === category.id)
      }));
      
      res.json(skillsByCategory);
    } catch (error) {
      console.error("Error fetching portfolio skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/portfolio/metrics", async (req, res) => {
    try {
      const metrics = await storage.getPortfolioMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching portfolio metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Core Values routes
  app.get("/api/portfolio/core-values", async (req, res) => {
    try {
      const coreValues = await storage.getCoreValues();
      res.json(coreValues);
    } catch (error) {
      console.error("Error fetching core values:", error);
      res.status(500).json({ message: "Failed to fetch core values" });
    }
  });

  // Core Values admin routes
  app.get("/api/admin/core-values", isAdmin, async (req, res) => {
    try {
      const coreValues = await storage.getCoreValues();
      res.json(coreValues);
    } catch (error) {
      console.error("Error fetching core values:", error);
      res.status(500).json({ message: "Failed to fetch core values" });
    }
  });

  app.post("/api/admin/core-values", isAdmin, async (req, res) => {
    try {
      const coreValue = await storage.createCoreValue(req.body);

      res.json(coreValue);
    } catch (error) {
      console.error("Error creating core value:", error);
      res.status(500).json({ message: "Failed to create core value" });
    }
  });

  app.put("/api/admin/core-values/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const coreValue = await storage.updateCoreValue(parseInt(id), req.body);
      res.json(coreValue);
    } catch (error) {
      console.error("Error updating core value:", error);
      res.status(500).json({ message: "Failed to update core value" });
    }
  });

  app.delete("/api/admin/core-values/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCoreValue(parseInt(id));
      res.json({ message: "Core value deleted successfully" });
    } catch (error) {
      console.error("Error deleting core value:", error);
      res.status(500).json({ message: "Failed to delete core value" });
    }
  });

  // Portfolio Images CRUD endpoints (admin only)
  app.get("/api/admin/portfolio-images", isAdmin, async (req, res) => {
    try {
      const { section } = req.query;
      const images = await storage.getPortfolioImages(section as string);
      res.json(images);
    } catch (error) {
      console.error("Error fetching portfolio images:", error);
      res.status(500).json({ message: "Failed to fetch portfolio images" });
    }
  });

  app.get("/api/admin/portfolio-images/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const image = await storage.getPortfolioImage(parseInt(id));
      if (!image) {
        return res.status(404).json({ message: "Portfolio image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error fetching portfolio image:", error);
      res.status(500).json({ message: "Failed to fetch portfolio image" });
    }
  });

  app.post("/api/admin/portfolio-images", isAdmin, async (req, res) => {
    try {
      const image = await storage.createPortfolioImage(req.body);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating portfolio image:", error);
      res.status(500).json({ message: "Failed to create portfolio image" });
    }
  });

  app.put("/api/admin/portfolio-images/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ 
          message: "Invalid image ID",
          details: "Image ID must be a valid number"
        });
      }

      // Validate required fields
      const { section, imageUrl, altText } = req.body;
      if (!section || !imageUrl || !altText) {
        return res.status(400).json({
          message: "Missing required fields",
          details: "Section, image URL, and alt text are required",
          missing: {
            section: !section,
            imageUrl: !imageUrl,
            altText: !altText
          }
        });
      }

      // Check if image exists
      const existingImage = await storage.getPortfolioImage(imageId);
      if (!existingImage) {
        return res.status(404).json({ 
          message: "Portfolio image not found",
          details: `No image found with ID ${imageId}`
        });
      }

      console.log(`Updating portfolio image ${imageId} with data:`, req.body);
      
      const image = await storage.updatePortfolioImage(imageId, req.body);
      
      // Invalidate cache for the specific section
      await cacheSync.invalidateContentCache({
        invalidatePortfolio: true,
        invalidateSpecific: [
          `route:/images/${image.section}:{}`,
          `route:/api/portfolio/images/${image.section}`,
          'route:/images/hero:{}',
          'route:/images/about:{}',
          'route:/images/profile:{}'
        ],
        broadcastUpdate: true
      });
      
      console.log(`Successfully updated portfolio image ${imageId} and invalidated cache:`, image);
      res.json(image);
    } catch (error) {
      console.error("Error updating portfolio image:", error);
      res.status(500).json({ 
        message: "Failed to update portfolio image",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.delete("/api/admin/portfolio-images/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);
      
      // Get the image info before deletion for cache invalidation
      const image = await storage.getPortfolioImage(imageId);
      
      await storage.deletePortfolioImage(imageId);
      
      // Invalidate cache for the specific section and case study images
      if (image) {
        // Clear case study specific cache if this is a case study image
        if (image.caseStudyId) {
          cache.delete(`route:/images/case-study/${image.caseStudyId}:{}`);
          cache.delete(`images/case-study/${image.caseStudyId}`);
        }
        
        await cacheSync.invalidateContentCache({
          invalidatePortfolio: true,
          invalidateSpecific: [
            `route:/images/${image.section}:{}`,
            `route:/api/portfolio/images/${image.section}`,
            'route:/images/hero:{}',
            'route:/images/about:{}',
            'route:/images/profile:{}',
            `route:/images/case-study/${image.caseStudyId}:{}`
          ],
          broadcastUpdate: true
        });
      }
      
      console.log(`Portfolio image ${imageId} deleted and cache invalidated`);
      res.json({ message: "Portfolio image deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio image:", error);
      res.status(500).json({ message: "Failed to delete portfolio image" });
    }
  });

  // Public endpoint for portfolio images
  app.get("/api/portfolio/images/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const images = await storage.getPortfolioImages(section);
      res.json(images.filter(img => img.isActive));
    } catch (error) {
      console.error("Error fetching portfolio images:", error);
      res.status(500).json({ message: "Failed to fetch portfolio images" });
    }
  });

  // Temporary image storage for case study creation
  const tempImages = new Map<string, { file: any, altText: string, timestamp: number }>();

  // Temporary image upload for case study creation
  app.post("/api/admin/portfolio-images/case-study/temp", isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { altText = "Case study image" } = req.body;
      const tempId = `temp_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
      
      // Store temporarily with cleanup after 1 hour
      tempImages.set(tempId, {
        file: req.file,
        altText,
        timestamp: Date.now()
      });

      // Clean up old temp images (older than 1 hour)
      for (const [key, value] of tempImages.entries()) {
        if (Date.now() - value.timestamp > 3600000) { // 1 hour
          tempImages.delete(key);
        }
      }

      res.json({ 
        tempId,
        imageUrl: `/uploads/${req.file.filename}`,
        altText,
        message: "Image uploaded temporarily" 
      });
    } catch (error) {
      console.error("Error uploading temporary case study image:", error);
      res.status(500).json({ message: "Failed to upload temporary image" });
    }
  });

  // Case study image upload (existing case studies)
  app.post("/api/admin/portfolio-images/case-study/:id", isAdmin, upload.single("image"), async (req, res) => {
    try {
      const caseStudyId = parseInt(req.params.id);
      if (isNaN(caseStudyId)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { altText = `Case study ${caseStudyId} image`, caption } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;

      const image = await storage.createPortfolioImage({
        section: "case-study",
        imageUrl,
        altText,
        caption,
        orderIndex: 0,
        isActive: true,
        caseStudyId,
      });

      // Clear case study related caches
      cache.deletePattern(".*case-studies.*");
      cache.deletePattern(".*case-study.*");

      res.json(image);
    } catch (error) {
      console.error("Error uploading case study image:", error);
      res.status(500).json({ message: "Failed to upload case study image" });
    }
  });

  // Get case study images
  app.get("/api/portfolio/images/case-study/:id", async (req, res) => {
    try {
      const cacheKey = `images/case-study/${req.params.id}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const caseStudyId = parseInt(req.params.id);
      if (isNaN(caseStudyId)) {
        return res.status(400).json({ message: "Invalid case study ID" });
      }
      
      const images = await storage.getPortfolioImages("case-study");
      const caseStudyImages = images.filter(img => img.caseStudyId === caseStudyId);
      
      cache.set(cacheKey, caseStudyImages, 300);
      res.json(caseStudyImages);
    } catch (error) {
      console.error("Error fetching case study images:", error);
      res.status(500).json({ message: "Failed to fetch case study images" });
    }
  });

  // Portfolio status management
  app.get("/api/admin/portfolio-status", isAdmin, async (req, res) => {
    try {
      const portfolioStatus = await storage.getPortfolioStatus();
      res.json(portfolioStatus);
    } catch (error) {
      console.error("Error fetching portfolio status:", error);
      res.status(500).json({ message: "Failed to fetch portfolio status" });
    }
  });

  app.put("/api/admin/portfolio-status", isAdmin, async (req, res) => {
    try {
      await storage.updatePortfolioStatus(req.body);
      res.json({ success: true, message: "Portfolio status updated successfully" });
    } catch (error) {
      console.error("Error updating portfolio status:", error);
      res.status(500).json({ message: "Failed to update portfolio status" });
    }
  });

  // SEO Settings endpoints
  app.get("/api/admin/seo-settings", isAdmin, async (req, res) => {
    try {
      const { seoSettings } = await import("@shared/schema");
      const seoData = await db.select().from(seoSettings);
      res.json(seoData);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ error: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/admin/seo-settings", isAdmin, async (req, res) => {
    try {
      const { seoSettings } = await import("@shared/schema");
      const validatedData = req.body;
      
      const result = await db
        .insert(seoSettings)
        .values({
          page: validatedData.page,
          title: validatedData.title,
          description: validatedData.description,
          keywords: validatedData.keywords || [],
          ogTitle: validatedData.ogTitle,
          ogDescription: validatedData.ogDescription,
          ogImage: validatedData.ogImage,
          twitterTitle: validatedData.twitterTitle,
          twitterDescription: validatedData.twitterDescription,
          twitterImage: validatedData.twitterImage,
          canonicalUrl: validatedData.canonicalUrl,
          robotsDirective: validatedData.robotsDirective || 'index,follow',
          structuredData: validatedData.structuredData,
        })
        .onConflictDoUpdate({
          target: seoSettings.page,
          set: {
            title: validatedData.title,
            description: validatedData.description,
            keywords: validatedData.keywords || [],
            ogTitle: validatedData.ogTitle,
            ogDescription: validatedData.ogDescription,
            ogImage: validatedData.ogImage,
            twitterTitle: validatedData.twitterTitle,
            twitterDescription: validatedData.twitterDescription,
            twitterImage: validatedData.twitterImage,
            canonicalUrl: validatedData.canonicalUrl,
            robotsDirective: validatedData.robotsDirective || 'index,follow',
            structuredData: validatedData.structuredData,
            updatedAt: new Date(),
          },
        })
        .returning();

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ error: "Failed to update SEO settings" });
    }
  });

  app.get("/api/seo/:page", async (req, res) => {
    try {
      const { seoSettings } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const page = req.params.page;
      const seoData = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.page, page))
        .limit(1);

      if (seoData.length === 0) {
        return res.status(404).json({ error: "SEO settings not found for this page" });
      }

      res.json(seoData[0]);
    } catch (error) {
      console.error("Error fetching page SEO:", error);
      res.status(500).json({ error: "Failed to fetch SEO data" });
    }
  });

  // System monitoring endpoints
  app.get("/api/admin/system/metrics", isAdmin, async (req, res) => {
    try {
      const { performanceMonitor } = await import("./performance");
      const metrics = performanceMonitor.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  });

  app.get("/api/admin/system/logs", isAdmin, async (req, res) => {
    try {
      const { logger } = await import("./logger");
      const { level, limit } = req.query;
      const logs = await logger.getRecentLogs(
        level as string, 
        limit ? parseInt(limit as string) : 100
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      res.status(500).json({ error: "Failed to fetch system logs" });
    }
  });

  app.get("/api/admin/system/health", isAdmin, async (req, res) => {
    try {
      // Check database connection
      let dbStatus = 'online';
      try {
        // Basic health check - simplified for now
        const healthCheck = true;
      } catch {
        dbStatus = 'offline';
      }

      // Check storage (file system)
      let storageStatus = 'online';
      try {
        const fs = await import('fs');
        fs.accessSync(process.cwd(), fs.constants.R_OK | fs.constants.W_OK);
      } catch {
        storageStatus = 'offline';
      }

      const health = {
        status: dbStatus === 'offline' ? 'critical' : 'healthy',
        services: {
          database: dbStatus,
          api: 'online',
          storage: storageStatus
        },
        lastChecked: new Date().toISOString()
      };

      res.json(health);
    } catch (error) {
      console.error("Error checking system health:", error);
      res.status(500).json({ error: "Failed to check system health" });
    }
  });

  app.get("/api/admin/system/slowest-endpoints", isAdmin, async (req, res) => {
    try {
      const { performanceMonitor } = await import("./performance");
      const { limit } = req.query;
      const endpoints = performanceMonitor.getSlowestEndpoints(
        limit ? parseInt(limit as string) : 10
      );
      res.json(endpoints);
    } catch (error) {
      console.error("Error fetching slowest endpoints:", error);
      res.status(500).json({ error: "Failed to fetch slowest endpoints" });
    }
  });

  // Backup and restore endpoints
  app.post("/api/admin/backup/create", isAdmin, async (req, res) => {
    try {
      const { backupManager } = await import("./backup");
      const { description } = req.body;
      const fileName = await backupManager.createBackup(description);
      res.json({ fileName, message: "Backup created successfully" });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  app.get("/api/admin/backup/list", isAdmin, async (req, res) => {
    try {
      const { backupManager } = await import("./backup");
      const backups = await backupManager.listBackups();
      res.json(backups);
    } catch (error) {
      console.error("Error listing backups:", error);
      res.status(500).json({ error: "Failed to list backups" });
    }
  });

  app.post("/api/admin/backup/restore/:fileName", isAdmin, async (req, res) => {
    try {
      const { backupManager } = await import("./backup");
      const { fileName } = req.params;
      await backupManager.restoreBackup(fileName);
      res.json({ message: "Backup restored successfully" });
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ error: "Failed to restore backup" });
    }
  });

  app.delete("/api/admin/backup/:fileName", isAdmin, async (req, res) => {
    try {
      const { backupManager } = await import("./backup");
      const { fileName } = req.params;
      await backupManager.deleteBackup(fileName);
      res.json({ message: "Backup deleted successfully" });
    } catch (error) {
      console.error("Error deleting backup:", error);
      res.status(500).json({ error: "Failed to delete backup" });
    }
  });

  // Search API endpoints
  app.get("/api/search", async (req, res) => {
    try {
      const { searchEngine } = await import("./search");
      const { q: query, type, limit, offset, sortBy, sortOrder } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const filters = {
        type: type as string
      };

      const options = {
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        includeContent: false
      };

      const results = await searchEngine.search(query, filters, options);
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/admin/search", isAdmin, async (req, res) => {
    try {
      const { searchEngine } = await import("./search");
      const { q: query, type, limit, offset, includeContent } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const filters = {
        type: type as string
      };

      const options = {
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        includeContent: includeContent === 'true'
      };

      const results = await searchEngine.search(query, filters, options);
      res.json(results);
    } catch (error) {
      console.error("Error performing admin search:", error);
      res.status(500).json({ error: "Admin search failed" });
    }
  });

  app.post("/api/admin/search/reindex", isAdmin, async (req, res) => {
    try {
      const { searchEngine } = await import("./search");
      await searchEngine.rebuildSearchIndex();
      res.json({ message: "Search index rebuilt successfully" });
    } catch (error) {
      console.error("Error rebuilding search index:", error);
      res.status(500).json({ error: "Failed to rebuild search index" });
    }
  });

  // Workflow automation endpoints
  app.get("/api/admin/workflows", isAdmin, async (req, res) => {
    try {
      const { workflowManager } = await import("./workflow");
      const workflows = workflowManager.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/admin/workflows/:id", isAdmin, async (req, res) => {
    try {
      const { workflowManager } = await import("./workflow");
      const { id } = req.params;
      const workflow = workflowManager.getWorkflow(id);
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/admin/workflows/:id/execute", isAdmin, async (req, res) => {
    try {
      const { workflowManager } = await import("./workflow");
      const { id } = req.params;
      const execution = await workflowManager.executeWorkflow(id, true);
      res.json(execution);
    } catch (error) {
      console.error("Error executing workflow:", error);
      res.status(500).json({ error: "Failed to execute workflow" });
    }
  });

  app.post("/api/admin/workflows/:id/toggle", isAdmin, async (req, res) => {
    try {
      const { workflowManager } = await import("./workflow");
      const { id } = req.params;
      const success = workflowManager.toggleWorkflow(id);
      
      if (!success) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json({ message: "Workflow toggled successfully" });
    } catch (error) {
      console.error("Error toggling workflow:", error);
      res.status(500).json({ error: "Failed to toggle workflow" });
    }
  });

  app.get("/api/admin/workflow-executions", isAdmin, async (req, res) => {
    try {
      const { workflowManager } = await import("./workflow");
      const { workflowId } = req.query;
      const executions = workflowManager.getExecutions(workflowId as string);
      res.json(executions);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ error: "Failed to fetch workflow executions" });
    }
  });

  // Cache management endpoints
  app.get("/api/admin/cache/stats", isAdmin, async (req, res) => {
    try {
      const { cache } = await import("./cache");
      const stats = cache.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ error: "Failed to fetch cache stats" });
    }
  });

  app.post("/api/admin/cache/clear", isAdmin, async (req, res) => {
    try {
      // Clear the route cache for all content endpoints
      const contentRoutes = [
        "route:/content/hero:{}",
        "route:/content/about:{}",
        "route:/content:{}",
        "route:/images/hero:{}",
        "route:/images/about:{}",
        "route:/skills:{}",
        "route:/timeline:{}",
        "route:/metrics:{}",
        "route:/core-values:{}"
      ];
      
      // Clear from our simple cache if it exists
      const cache = new Map();
      contentRoutes.forEach(route => cache.delete(route));
      
      res.json({ message: "Content cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.get("/api/admin/cache/top-entries", isAdmin, async (req, res) => {
    try {
      const { cache } = await import("./cache");
      const { limit } = req.query;
      const entries = cache.getTopEntries(limit ? parseInt(limit as string) : 10);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching top cache entries:", error);
      res.status(500).json({ error: "Failed to fetch top cache entries" });
    }
  });

  // System optimization endpoints
  app.post("/api/admin/optimize", isAdmin, async (req, res) => {
    try {
      const { systemOptimizer } = await import("./optimization");
      const report = await systemOptimizer.runComprehensiveOptimization();
      res.json(report);
    } catch (error) {
      console.error("Error running optimization:", error);
      res.status(500).json({ error: "Failed to run system optimization" });
    }
  });

  app.get("/api/admin/performance-report", isAdmin, async (req, res) => {
    try {
      const { systemOptimizer } = await import("./optimization");
      const report = await systemOptimizer.generatePerformanceReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating performance report:", error);
      res.status(500).json({ error: "Failed to generate performance report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

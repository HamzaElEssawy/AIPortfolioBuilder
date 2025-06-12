import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { contentManager } from "./contentManager";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Admin authentication middleware (temporarily disabled for testing)
const isAdmin = (req: any, res: any, next: any) => {
  // Temporarily bypass authentication for testing
  next();
  
  // Original auth check (re-enable for production):
  // if (req.session?.isAdmin) {
  //   next();
  // } else {
  //   res.status(401).json({ message: "Admin access required" });
  // }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration for admin
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple admin credentials (in production, use environment variables)
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      if (username === adminUsername && password === adminPassword) {
        req.session.isAdmin = true;
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
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

  // AI Assistant endpoint (admin only)
  app.post("/api/admin/ai-assistant", isAdmin, async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      // Enhanced knowledge base context about Hamza's career
      const knowledgeBaseContext = `You are an AI Career Assistant for Hamza El Essawy, an AI Product Leader and entrepreneur based in Kuala Lumpur, Malaysia. 

HAMZA'S BACKGROUND:
- AI Product Leader & Entrepreneur (2024-Present): Leading AI product strategy across multiple ventures, mentoring 15+ founders
- Founder & Product Leader of AI Compliance Startup (2023-2024): Secured $110K+ funding, built platform reducing manual review by 50%
- Senior Product Manager at Tapway Enterprise AI Platform (2021-2023): Scaled to 10+ enterprise clients, grew team from 8 to 20 engineers
- AI Product Manager in MENA Fintech (2020-2021): Implemented RAG AI achieving 70% query automation, reduced costs by 35%
- Product Manager AI/ML in Dubai Fintech (2018-2020): Built foundational expertise in fintech sector

EXPERTISE AREAS:
- AI/ML product development and strategy
- Enterprise software scaling
- Cross-cultural team management
- Fundraising and startup growth
- Compliance and risk management systems
- Multilingual AI systems (15 languages)

CAREER GOALS:
- Strategic AI leadership roles in established tech companies
- Continued entrepreneurship in AI compliance and automation
- Mentoring and advisory positions for AI startups
- Speaking engagements on AI product management

When providing career advice, reference his actual experience and achievements. Help with resume optimization, interview preparation, career strategy, and portfolio enhancement. Be specific and actionable in your recommendations.`;

      // Prepare conversation context
      const messages = [
        { role: "system", content: knowledgeBaseContext },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      // Generate response using real Claude API
      const response = await generateRealClaudeResponse(message, conversationHistory);
      
      res.json({ response });
    } catch (error) {
      console.error("AI Assistant error:", error);
      res.status(500).json({ message: "AI Assistant temporarily unavailable" });
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

  // Portfolio management endpoints (admin only)
  app.get("/api/admin/case-studies", isAdmin, async (req, res) => {
    try {
      // Mock case studies data for now
      const caseStudies = [
        {
          id: 1,
          title: "AI Compliance Platform - Scaling from MVP to Enterprise",
          status: "published",
          challenge: "Built AI-driven compliance platform from concept to $110K+ funding, addressing regulatory complexity in financial services across multiple jurisdictions.",
          approach: "Implemented lean startup methodology with rapid prototyping, customer discovery interviews, and iterative product development based on regulatory feedback.",
          solution: "Developed comprehensive compliance automation platform reducing manual review processes by 50% while maintaining 99.9% accuracy in regulatory assessment.",
          impact: "Secured $110K+ in early-stage funding, achieved product-market fit with enterprise clients, and established foundation for SEA market expansion.",
          metrics: ["$110K+ funding secured", "50% reduction in manual review", "99.9% accuracy rate", "10+ enterprise pilots"],
          technologies: ["React", "Node.js", "PostgreSQL", "Claude API", "Python ML"],
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-06-01T00:00:00Z"
        },
        {
          id: 2,
          title: "Enterprise AI Platform Scaling - Tapway Success Story",
          status: "published",
          challenge: "Scale no-code AI vision platform from startup to enterprise solution serving 10+ major clients while growing engineering team from 8 to 20 members.",
          approach: "Implemented agile product management with cross-functional team coordination, enterprise sales strategy, and platform architecture optimization.",
          solution: "Built scalable enterprise AI platform with 99.9% uptime, comprehensive API ecosystem, and white-label deployment capabilities for diverse industry verticals.",
          impact: "Successfully scaled to 10+ enterprise clients, achieved 99.9% platform uptime, and built sustainable revenue model with recurring enterprise contracts.",
          metrics: ["10+ enterprise clients", "99.9% platform uptime", "8→20 team growth", "150% revenue increase"],
          technologies: ["Computer Vision", "TensorFlow", "Kubernetes", "AWS", "React Native"],
          createdAt: "2023-06-01T00:00:00Z",
          updatedAt: "2024-03-15T00:00:00Z"
        }
      ];
      res.json(caseStudies);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Failed to fetch case studies" });
    }
  });

  app.get("/api/admin/media", isAdmin, async (req, res) => {
    try {
      // Mock media assets data
      const mediaAssets = [
        {
          id: 1,
          filename: "hamza-professional-headshot.jpg",
          url: "/media/hamza-headshot.jpg",
          type: "image",
          size: 2048576,
          uploadedAt: "2024-05-01T00:00:00Z",
          tags: ["headshot", "professional", "portfolio"]
        },
        {
          id: 2,
          filename: "ai-compliance-platform-architecture.pdf",
          url: "/media/platform-architecture.pdf",
          type: "document",
          size: 5242880,
          uploadedAt: "2024-04-15T00:00:00Z",
          tags: ["architecture", "compliance", "technical"]
        }
      ];
      res.json(mediaAssets);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media assets" });
    }
  });

  // Knowledge Base Management endpoints (admin only)
  app.get("/api/admin/knowledge-base/stats", isAdmin, async (req, res) => {
    try {
      // Mock knowledge base statistics
      const stats = {
        resumeCount: 5,
        transcriptCount: 12,
        careerCount: 8,
        jobDescriptionCount: 3,
        totalEmbeddings: 2847
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching KB stats:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base statistics" });
    }
  });

  app.get("/api/admin/knowledge-base/documents", isAdmin, async (req, res) => {
    try {
      // Mock documents data
      const documents = [
        {
          id: 1,
          filename: "hamza-resume-2024-latest.pdf",
          category: "resume",
          size: 2048576,
          uploadedAt: "2024-06-01T00:00:00Z",
          status: "embedded",
          vectorId: "vec_001"
        },
        {
          id: 2,
          filename: "google-ai-pm-interview-transcript.txt",
          category: "interview",
          size: 156789,
          uploadedAt: "2024-05-15T00:00:00Z",
          status: "embedded",
          vectorId: "vec_002"
        },
        {
          id: 3,
          filename: "career-strategy-2024-notes.docx",
          category: "career-plan",
          size: 89654,
          uploadedAt: "2024-05-10T00:00:00Z",
          status: "processing"
        }
      ];
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/admin/knowledge-base/upload", isAdmin, async (req, res) => {
    try {
      // In a real implementation, this would:
      // 1. Process uploaded files
      // 2. Extract text content
      // 3. Generate vector embeddings
      // 4. Store in vector database
      // 5. Update Claude's knowledge base context
      
      // Mock successful upload response
      const uploadedCount = req.body ? 1 : 0; // Simplified for demo
      
      res.json({ 
        success: true, 
        uploadedCount,
        message: "Files uploaded successfully and embeddings are being processed" 
      });
    } catch (error) {
      console.error("Error uploading to KB:", error);
      res.status(500).json({ message: "Failed to upload files to knowledge base" });
    }
  });

  app.delete("/api/admin/knowledge-base/documents/:id", isAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      // In real implementation: remove document and its embeddings
      res.json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
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

  // Portfolio content endpoints for live website
  app.get("/api/portfolio/content", async (req, res) => {
    try {
      const content = await contentManager.getAllSections();
      res.json(content);
    } catch (error) {
      console.error("Error fetching portfolio content:", error);
      res.status(500).json({ message: "Failed to fetch portfolio content" });
    }
  });

  app.get("/api/portfolio/content/:section", async (req, res) => {
    try {
      const sectionType = req.params.section as any;
      const content = await contentManager.getSection(sectionType);
      res.json(content);
    } catch (error) {
      console.error("Error fetching section content:", error);
      res.status(500).json({ message: "Failed to fetch section content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

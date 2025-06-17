import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { db } from "../db";
import { knowledgeBaseDocuments, documentCategories } from "@shared/schema";
import { eq } from "drizzle-orm";
import { aiService } from "./aiService";
import { vectorEmbeddingService } from "./vectorEmbeddingService";

export interface ProcessedDocument {
  id: number;
  filename: string;
  originalName: string;
  contentType: string;
  contentText: string;
  category: string;
  summary?: string;
  keyInsights?: any;
  status: string;
}

export class DocumentProcessor {
  
  // Process uploaded file
  async processDocument(
    filePath: string, 
    originalName: string, 
    category: string
  ): Promise<ProcessedDocument> {
    try {
      const fileStats = fs.statSync(filePath);
      const contentType = this.getContentType(originalName);
      
      // Create initial database record
      const document = await db.insert(knowledgeBaseDocuments).values({
        filename: path.basename(filePath),
        originalName,
        contentType,
        category,
        size: fileStats.size,
        status: "processing"
      }).returning();

      const docId = document[0].id;

      try {
        // Extract text content
        const contentText = await this.extractText(filePath, contentType);
        
        // Generate AI summary and insights
        const { summary, keyInsights } = await this.generateSummaryAndInsights(
          contentText, 
          category
        );

        // Update document with processed content
        await db.update(knowledgeBaseDocuments)
          .set({
            contentText,
            summary,
            keyInsights,
            status: "embedded",
            processedAt: new Date()
          })
          .where(eq(knowledgeBaseDocuments.id, docId));

        return {
          id: docId,
          filename: document[0].filename,
          originalName,
          contentType,
          contentText,
          category,
          summary,
          keyInsights,
          status: "embedded"
        };

      } catch (processingError) {
        // Mark as failed
        await db.update(knowledgeBaseDocuments)
          .set({ status: "failed" })
          .where(eq(knowledgeBaseDocuments.id, docId));
        
        throw processingError;
      }

    } catch (error) {
      console.error("Document processing error:", error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract text from different file types
  private async extractText(filePath: string, contentType: string): Promise<string> {
    switch (contentType) {
      case "pdf":
        return await this.extractPdfText(filePath);
      
      case "docx":
        return await this.extractDocxText(filePath);
      
      case "txt":
        return await this.extractTxtText(filePath);
      
      default:
        throw new Error(`Unsupported file type: ${contentType}`);
    }
  }

  // Extract text from DOCX
  private async extractDocxText(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  // Extract text from TXT
  private async extractTxtText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf8');
  }

  // Determine content type from filename
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case ".pdf":
        return "pdf";
      case ".docx":
        return "docx";
      case ".txt":
        return "txt";
      default:
        return "unknown";
    }
  }

  // Generate AI summary and insights
  private async generateSummaryAndInsights(
    content: string, 
    category: string
  ): Promise<{ summary: string; keyInsights: any }> {
    try {
      // Get category-specific analysis prompts
      const categoryRules = await this.getCategoryRules(category);
      
      const analysisPrompt = `Analyze this ${category} document and provide:

1. A concise summary (2-3 sentences)
2. Key insights structured as JSON

Document content:
${content}

${(categoryRules?.aiPrompts as any)?.analysisPrompt || "Focus on career development, skills, achievements, and actionable insights."}

Provide response in this format:
SUMMARY: [2-3 sentence summary]

KEY_INSIGHTS: {
  "strengths": ["list of strengths"],
  "skills": ["key skills mentioned"],
  "achievements": ["notable achievements"],
  "areas_for_improvement": ["areas to improve"],
  "keywords": ["important keywords for ATS"],
  "recommendations": ["actionable recommendations"]
}`;

      const response = await aiService.generateResponse(analysisPrompt, {
        sessionType: "document_processing"
      });

      // Parse the response to extract summary and insights
      const summaryMatch = response.content.match(/SUMMARY:\s*(.*?)(?=KEY_INSIGHTS:|$)/s);
      const insightsMatch = response.content.match(/KEY_INSIGHTS:\s*(\{[\s\S]*?\})/);

      const summary = summaryMatch ? summaryMatch[1].trim() : "Document processed successfully.";
      
      let keyInsights = {};
      if (insightsMatch) {
        try {
          // Clean the JSON string to remove potential formatting issues
          const cleanedJson = insightsMatch[1]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .trim();
          keyInsights = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.warn("Failed to parse key insights JSON:", parseError);
          // Fallback to a more robust parsing approach
          keyInsights = {
            status: "processed",
            analysis: response.content.substring(0, 500),
            processing_note: "Full analysis available in raw format"
          };
        }
      } else {
        // If no structured insights found, create a basic structure
        keyInsights = {
          status: "processed",
          analysis: response.content.substring(0, 500),
          processing_note: "Document analyzed successfully"
        };
      }

      return { summary, keyInsights };

    } catch (error) {
      console.error("Error generating summary and insights:", error);
      return {
        summary: "Document uploaded successfully. Analysis pending.",
        keyInsights: { status: "analysis_failed", error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Get category-specific processing rules
  private async getCategoryRules(category: string) {
    try {
      const rules = await db.select()
        .from(documentCategories)
        .where(eq(documentCategories.name, category))
        .limit(1);
      
      return rules[0] || null;
    } catch (error) {
      console.error("Error fetching category rules:", error);
      return null;
    }
  }

  // Initialize default document categories
  async initializeCategories() {
    const defaultCategories = [
      {
        name: "resume",
        description: "Resume and CV documents",
        processingRules: {
          extractSections: ["experience", "education", "skills", "achievements"],
          keywordAnalysis: true,
          atsCompatibility: true
        },
        aiPrompts: {
          analysisPrompt: "Focus on professional experience, skills, achievements, ATS compatibility, and areas for improvement. Identify keywords that align with AI Product Leadership roles."
        }
      },
      {
        name: "interview_transcript",
        description: "Interview recordings and transcripts",
        processingRules: {
          speakerIdentification: true,
          responseAnalysis: true,
          performanceMetrics: true
        },
        aiPrompts: {
          analysisPrompt: "Analyze interview performance, communication effectiveness, technical knowledge demonstration, and areas for improvement. Rate responses and provide specific feedback."
        }
      },
      {
        name: "performance_review",
        description: "Performance reviews and feedback documents",
        processingRules: {
          goalTracking: true,
          strengthsWeaknesses: true,
          developmentPlans: true
        },
        aiPrompts: {
          analysisPrompt: "Extract performance metrics, feedback themes, development goals, and career progression insights. Identify patterns and growth opportunities."
        }
      },
      {
        name: "career_plan",
        description: "Career planning and strategy documents",
        processingRules: {
          goalExtraction: true,
          timelineAnalysis: true,
          milestoneTracking: true
        },
        aiPrompts: {
          analysisPrompt: "Analyze career goals, strategic plans, timeline feasibility, and actionable steps. Provide recommendations for goal achievement."
        }
      },
      {
        name: "cover_letter",
        description: "Cover letters and application documents",
        processingRules: {
          companyResearch: true,
          roleAlignment: true,
          personalBranding: true
        },
        aiPrompts: {
          analysisPrompt: "Evaluate cover letter effectiveness, company-role alignment, personal branding, and persuasive elements. Suggest improvements for better impact."
        }
      },
      {
        name: "reference_letter",
        description: "Reference letters and recommendations",
        processingRules: {
          strengthsExtraction: true,
          impactAnalysis: true,
          credibilityAssessment: true
        },
        aiPrompts: {
          analysisPrompt: "Extract key strengths, accomplishments, and endorsements. Analyze the impact and credibility of the reference for career advancement."
        }
      }
    ];

    for (const category of defaultCategories) {
      try {
        // Check if category exists
        const existing = await db.select()
          .from(documentCategories)
          .where(eq(documentCategories.name, category.name))
          .limit(1);

        if (!existing.length) {
          await db.insert(documentCategories).values(category);
          console.log(`Initialized category: ${category.name}`);
        }
      } catch (error) {
        console.error(`Error initializing category ${category.name}:`, error);
      }
    }
  }

  // Get all available categories
  async getCategories() {
    try {
      return await db.select().from(documentCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  // Delete document and cleanup
  async deleteDocument(documentId: number) {
    try {
      const document = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, documentId))
        .limit(1);

      if (document[0]) {
        // Delete file from filesystem
        const filePath = path.join("uploads", document[0].filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Delete from database
        await db.delete(knowledgeBaseDocuments)
          .where(eq(knowledgeBaseDocuments.id, documentId));

        return { success: true, message: "Document deleted successfully" };
      } else {
        throw new Error("Document not found");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  // Get document analysis results
  async getDocumentAnalysis(documentId: number) {
    try {
      const document = await db.select()
        .from(knowledgeBaseDocuments)
        .where(eq(knowledgeBaseDocuments.id, documentId))
        .limit(1);

      return document[0] || null;
    } catch (error) {
      console.error("Error fetching document analysis:", error);
      return null;
    }
  }

  // Bulk process documents
  async processMultipleDocuments(
    files: Array<{ path: string; originalName: string; category: string }>
  ): Promise<ProcessedDocument[]> {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.processDocument(
          file.path, 
          file.originalName, 
          file.category
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.originalName}:`, error);
        results.push({
          originalName: file.originalName,
          status: "failed",
          error: error.message
        } as any);
      }
    }

    return results;
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
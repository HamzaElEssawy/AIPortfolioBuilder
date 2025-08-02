import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  challenge: text("challenge").notNull(),
  approach: text("approach").notNull(),
  solution: text("solution").notNull(),
  impact: text("impact").notNull(),
  metrics: text("metrics").array().notNull().default([]),
  technologies: text("technologies").array().notNull().default([]),
  status: text("status").notNull().default("draft"), // draft, published, archived
  featured: boolean("featured").default(false), // for homepage display
  displayOrder: integer("display_order").default(0),
  imageUrl: text("image_url"),
  imageFile: text("image_file"), // For local uploaded images
  externalUrl: text("external_url"), // Link to product/company
  clientName: text("client_name"),
  projectDuration: text("project_duration"),
  teamSize: text("team_size"),
  technicalDetails: jsonb("technical_details"),
  visualElements: jsonb("visual_elements"),
  crossCulturalElements: jsonb("cross_cultural_elements"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  tags: text("tags").array().notNull().default([]),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const contentSections = pgTable("content_sections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  content: jsonb("content").notNull(),
  status: text("status").notNull().default("published"),
  lastModified: timestamp("last_modified").defaultNow(),
  version: integer("version").notNull().default(1),
});

export const contentVersions = pgTable("content_versions", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  content: jsonb("content").notNull(),
  version: integer("version").notNull(),
  changeSummary: text("change_summary"),
  createdBy: text("created_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

// Enhanced Knowledge Base System
export const knowledgeBaseDocuments = pgTable("knowledge_base_documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(), // pdf, docx, txt, etc.
  contentText: text("content_text"), // extracted text content
  category: text("category").notNull(), // resume, interview_transcript, performance_review, etc.
  size: integer("size").notNull(),
  status: text("status").notNull().default("processing"), // processing, embedded, failed
  vectorId: text("vector_id"), // for vector embeddings
  tags: text("tags").array().default([]),
  summary: text("summary"), // AI-generated summary
  keyInsights: jsonb("key_insights"), // structured insights from the document
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Document Categories Configuration
export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  processingRules: jsonb("processing_rules"), // rules for processing this category
  aiPrompts: jsonb("ai_prompts"), // specific prompts for analyzing this category
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Conversation System
export const conversationSessions = pgTable("conversation_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("admin"), // for multi-user support later
  sessionStart: timestamp("session_start").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  contextSummary: text("context_summary"), // summary of conversation for context
  sessionType: text("session_type").default("career_assistant"), // career_assistant, brand_analysis
  totalMessages: integer("total_messages").default(0),
  isActive: boolean("is_active").default(true),
});

// Conversation Memory (Mem0 integration)
export const conversationMemory = pgTable("conversation_memory", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => conversationSessions.id, { onDelete: "cascade" }),
  memoryType: text("memory_type").notNull(), // preference, fact, goal, achievement
  content: text("content").notNull(),
  importanceScore: integer("importance_score").default(5), // 1-10 scale
  contextTags: text("context_tags").array().default([]),
  relatedDocuments: text("related_documents").array().default([]), // document IDs
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  expiresAt: timestamp("expires_at"), // for temporary memories
});

// User Profile and Preferences
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique().default("admin"),
  careerStage: text("career_stage"), // junior, mid, senior, executive
  currentGoals: text("current_goals").array().default([]),
  preferences: jsonb("preferences"), // communication style, focus areas, etc.
  skillsToImprove: text("skills_to_improve").array().default([]),
  targetRoles: text("target_roles").array().default([]),
  targetCompanies: text("target_companies").array().default([]),
  personalityType: text("personality_type"), // for personalized advice
  communicationStyle: text("communication_style").default("professional"), // casual, professional, direct
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// AI Analysis Results
export const aiAnalysisResults = pgTable("ai_analysis_results", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => knowledgeBaseDocuments.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type").notNull(), // resume_analysis, interview_analysis, brand_audit
  results: jsonb("results").notNull(), // structured analysis results
  recommendations: text("recommendations").array().default([]),
  score: integer("score"), // overall score if applicable
  strengths: text("strengths").array().default([]),
  improvements: text("improvements").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  modelUsed: text("model_used").default("claude-3-5-sonnet"), // track which AI model was used
});

// Personal Brand Analytics
export const brandAnalytics = pgTable("brand_analytics", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // portfolio, linkedin, github
  analysisDate: timestamp("analysis_date").defaultNow(),
  metrics: jsonb("metrics").notNull(), // engagement, reach, consistency scores
  suggestions: text("suggestions").array().default([]),
  brandScore: integer("brand_score"), // overall brand strength score
  consistency: integer("consistency"), // messaging consistency across platforms
  visibility: integer("visibility"), // online presence visibility
  engagement: integer("engagement"), // audience engagement level
  trends: jsonb("trends"), // trending topics and performance
});

// Career Progress Tracking
export const careerProgress = pgTable("career_progress", {
  id: serial("id").primaryKey(),
  goalType: text("goal_type").notNull(), // interview_success, resume_optimization, skill_development
  goalDescription: text("goal_description").notNull(),
  currentStatus: text("current_status").default("in_progress"), // not_started, in_progress, completed
  targetDate: timestamp("target_date"),
  completedDate: timestamp("completed_date"),
  progress: integer("progress").default(0), // 0-100 percentage
  milestones: jsonb("milestones"), // key milestones and achievements
  metrics: jsonb("metrics"), // relevant metrics for this goal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vector Embeddings for AI Search
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => knowledgeBaseDocuments.id, { onDelete: "cascade" }).notNull(),
  embedding: text("embedding").notNull(), // JSON stringified array of numbers
  textContent: text("text_content").notNull(),
  category: text("category").notNull(),
  metadata: text("metadata"), // JSON stringified metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const experienceEntries = pgTable("experience_entries", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(), // Changed from organization to match frontend
  location: text("location"),
  description: text("description"),
  highlight: boolean("highlight").default(false),
  orderIndex: integer("order_index").default(0),
  color: text("color").default("bg-gray-400"),
  
  // New fields for timeline enhancement
  level: text("level").default("Expert"),
  experiencePoints: text("experience_points").default("1000 XP"),
  
  // Impact metrics as JSON
  impactMetrics: jsonb("impact_metrics").$type<{
    users?: string;
    funding?: string;
    teamSize?: string;
    growth?: string;
    marketShare?: string;
    revenue?: string;
  }>(),
  
  // Achievements as array
  achievements: text("achievements").array().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => skillCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  proficiencyLevel: integer("proficiency_level").default(5),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioMetrics = pgTable("portfolio_metrics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: text("metric_value").notNull(),
  metricLabel: text("metric_label").notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coreValues = pgTable("core_values", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").default("target"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioStatus = pgTable("portfolio_status", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioImages = pgTable("portfolio_images", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // 'hero', 'about', 'profile', 'case-study'
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull(),
  caption: text("caption"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  caseStudyId: integer("case_study_id").references(() => caseStudies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  canonicalUrl: text("canonical_url"),
  robotsDirective: text("robots_directive").default("index,follow"),
  structuredData: jsonb("structured_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  company: true,
  projectType: true,
  message: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  company: z.string().optional(),
  projectType: z.string().default("General Inquiry"),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  metrics: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  slug: z.string().min(1),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  uploadedAt: true,
});

export const insertContentSectionSchema = createInsertSchema(contentSections).omit({
  lastModified: true,
});

export const insertContentVersionSchema = createInsertSchema(contentVersions).omit({
  id: true,
  createdAt: true,
});

// Enhanced insert schemas for new tables
export const insertKnowledgeBaseDocumentSchema = createInsertSchema(knowledgeBaseDocuments).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertDocumentCategorySchema = createInsertSchema(documentCategories).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSessionSchema = createInsertSchema(conversationSessions).omit({
  id: true,
  sessionStart: true,
  lastActivity: true,
});

export const insertConversationMemorySchema = createInsertSchema(conversationMemory).omit({
  id: true,
  createdAt: true,
  lastAccessed: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfile).omit({
  id: true,
  lastUpdated: true,
});

export const insertAiAnalysisResultSchema = createInsertSchema(aiAnalysisResults).omit({
  id: true,
  createdAt: true,
});

export const insertBrandAnalyticsSchema = createInsertSchema(brandAnalytics).omit({
  id: true,
  analysisDate: true,
});

export const insertCareerProgressSchema = createInsertSchema(careerProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExperienceEntrySchema = createInsertSchema(experienceEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillCategorySchema = createInsertSchema(skillCategories).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioMetricSchema = createInsertSchema(portfolioMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoreValueSchema = createInsertSchema(coreValues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioStatusSchema = createInsertSchema(portfolioStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertPortfolioImageSchema = createInsertSchema(portfolioImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;

export type ContentSection = typeof contentSections.$inferSelect;
export type InsertContentSection = z.infer<typeof insertContentSectionSchema>;

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = z.infer<typeof insertContentVersionSchema>;

export type KnowledgeBaseDocument = typeof knowledgeBaseDocuments.$inferSelect;
export type InsertKnowledgeBaseDocument = z.infer<typeof insertKnowledgeBaseDocumentSchema>;

export type ExperienceEntry = typeof experienceEntries.$inferSelect;
export type InsertExperienceEntry = z.infer<typeof insertExperienceEntrySchema>;

export type SkillCategory = typeof skillCategories.$inferSelect;
export type InsertSkillCategory = z.infer<typeof insertSkillCategorySchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type PortfolioMetric = typeof portfolioMetrics.$inferSelect;
export type InsertPortfolioMetric = z.infer<typeof insertPortfolioMetricSchema>;

export type CoreValue = typeof coreValues.$inferSelect;
export type InsertCoreValue = z.infer<typeof insertCoreValueSchema>;

export type PortfolioStatus = typeof portfolioStatus.$inferSelect;
export type InsertPortfolioStatus = z.infer<typeof insertPortfolioStatusSchema>;

export type PortfolioImage = typeof portfolioImages.$inferSelect;
export type InsertPortfolioImage = z.infer<typeof insertPortfolioImageSchema>;

export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;

// Enhanced types for new tables
export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type InsertConversationSession = z.infer<typeof insertConversationSessionSchema>;

export type ConversationMemory = typeof conversationMemory.$inferSelect;
export type InsertConversationMemory = z.infer<typeof insertConversationMemorySchema>;

export type UserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type AiAnalysisResult = typeof aiAnalysisResults.$inferSelect;
export type InsertAiAnalysisResult = z.infer<typeof insertAiAnalysisResultSchema>;

export type BrandAnalytics = typeof brandAnalytics.$inferSelect;
export type InsertBrandAnalytics = z.infer<typeof insertBrandAnalyticsSchema>;

export type CareerProgress = typeof careerProgress.$inferSelect;
export type InsertCareerProgress = z.infer<typeof insertCareerProgressSchema>;

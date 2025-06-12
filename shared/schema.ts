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
  challenge: text("challenge").notNull(),
  approach: text("approach").notNull(),
  solution: text("solution").notNull(),
  impact: text("impact").notNull(),
  metrics: text("metrics").array().notNull().default([]),
  technologies: text("technologies").array().notNull().default([]),
  status: text("status").notNull().default("draft"),
  technicalDetails: jsonb("technical_details"),
  visualElements: jsonb("visual_elements"),
  crossCulturalElements: jsonb("cross_cultural_elements"),
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
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const knowledgeBaseDocuments = pgTable("knowledge_base_documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  category: text("category").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("processing"),
  vectorId: text("vector_id"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
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
  publishedAt: true,
});

export const insertKnowledgeBaseDocumentSchema = createInsertSchema(knowledgeBaseDocuments).omit({
  id: true,
  uploadedAt: true,
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

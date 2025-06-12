import {
  users,
  contactSubmissions,
  caseStudies,
  mediaAssets,
  contentSections,
  contentVersions,
  knowledgeBaseDocuments,
  type User,
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type CaseStudy,
  type InsertCaseStudy,
  type MediaAsset,
  type InsertMediaAsset,
  type ContentSection,
  type InsertContentSection,
  type ContentVersion,
  type InsertContentVersion,
  type KnowledgeBaseDocument,
  type InsertKnowledgeBaseDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  deleteContactSubmission(id: number): Promise<void>;
  
  // Case studies
  getCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, caseStudy: Partial<InsertCaseStudy>): Promise<CaseStudy>;
  deleteCaseStudy(id: number): Promise<void>;
  
  // Media assets
  getMediaAssets(): Promise<MediaAsset[]>;
  getMediaAsset(id: number): Promise<MediaAsset | undefined>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  updateMediaAsset(id: number, asset: Partial<InsertMediaAsset>): Promise<MediaAsset>;
  deleteMediaAsset(id: number): Promise<void>;
  
  // Content sections
  getContentSections(): Promise<ContentSection[]>;
  getContentSection(id: string): Promise<ContentSection | undefined>;
  createContentSection(section: InsertContentSection): Promise<ContentSection>;
  updateContentSection(id: string, section: Partial<InsertContentSection>): Promise<ContentSection>;
  deleteContentSection(id: string): Promise<void>;
  
  // Content versions
  getContentVersions(sectionId?: string): Promise<ContentVersion[]>;
  createContentVersion(version: InsertContentVersion): Promise<ContentVersion>;
  
  // Knowledge base documents
  getKnowledgeBaseDocuments(): Promise<KnowledgeBaseDocument[]>;
  getKnowledgeBaseDocument(id: number): Promise<KnowledgeBaseDocument | undefined>;
  createKnowledgeBaseDocument(doc: InsertKnowledgeBaseDocument): Promise<KnowledgeBaseDocument>;
  updateKnowledgeBaseDocument(id: number, doc: Partial<InsertKnowledgeBaseDocument>): Promise<KnowledgeBaseDocument>;
  deleteKnowledgeBaseDocument(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Contact submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        ...insertSubmission,
        submittedAt: new Date().toISOString()
      })
      .returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    const submissions = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.submittedAt));
    return submissions;
  }

  async deleteContactSubmission(id: number): Promise<void> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }

  // Case studies
  async getCaseStudies(): Promise<CaseStudy[]> {
    const studies = await db
      .select()
      .from(caseStudies)
      .orderBy(desc(caseStudies.updatedAt));
    return studies;
  }

  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.id, id));
    return study || undefined;
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const [study] = await db
      .insert(caseStudies)
      .values(insertCaseStudy)
      .returning();
    return study;
  }

  async updateCaseStudy(id: number, updateData: Partial<InsertCaseStudy>): Promise<CaseStudy> {
    const [study] = await db
      .update(caseStudies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(caseStudies.id, id))
      .returning();
    return study;
  }

  async deleteCaseStudy(id: number): Promise<void> {
    await db.delete(caseStudies).where(eq(caseStudies.id, id));
  }

  // Media assets
  async getMediaAssets(): Promise<MediaAsset[]> {
    const assets = await db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.uploadedAt));
    return assets;
  }

  async getMediaAsset(id: number): Promise<MediaAsset | undefined> {
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return asset || undefined;
  }

  async createMediaAsset(insertAsset: InsertMediaAsset): Promise<MediaAsset> {
    const [asset] = await db
      .insert(mediaAssets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updateMediaAsset(id: number, updateData: Partial<InsertMediaAsset>): Promise<MediaAsset> {
    const [asset] = await db
      .update(mediaAssets)
      .set(updateData)
      .where(eq(mediaAssets.id, id))
      .returning();
    return asset;
  }

  async deleteMediaAsset(id: number): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  // Content sections
  async getContentSections(): Promise<ContentSection[]> {
    const sections = await db
      .select()
      .from(contentSections)
      .orderBy(contentSections.lastModified);
    return sections;
  }

  async getContentSection(id: string): Promise<ContentSection | undefined> {
    const [section] = await db.select().from(contentSections).where(eq(contentSections.id, id));
    return section || undefined;
  }

  async createContentSection(insertSection: InsertContentSection): Promise<ContentSection> {
    const [section] = await db
      .insert(contentSections)
      .values(insertSection)
      .returning();
    return section;
  }

  async updateContentSection(id: string, updateData: Partial<InsertContentSection>): Promise<ContentSection> {
    const [section] = await db
      .update(contentSections)
      .set({ ...updateData, lastModified: new Date() })
      .where(eq(contentSections.id, id))
      .returning();
    return section;
  }

  async deleteContentSection(id: string): Promise<void> {
    await db.delete(contentSections).where(eq(contentSections.id, id));
  }

  // Content versions
  async getContentVersions(sectionId?: string): Promise<ContentVersion[]> {
    let query = db.select().from(contentVersions);
    
    if (sectionId) {
      query = query.where(eq(contentVersions.sectionId, sectionId));
    }
    
    const versions = await query.orderBy(desc(contentVersions.createdAt));
    return versions;
  }

  async createContentVersion(insertVersion: InsertContentVersion): Promise<ContentVersion> {
    const [version] = await db
      .insert(contentVersions)
      .values(insertVersion)
      .returning();
    return version;
  }

  // Knowledge base documents
  async getKnowledgeBaseDocuments(): Promise<KnowledgeBaseDocument[]> {
    const documents = await db
      .select()
      .from(knowledgeBaseDocuments)
      .orderBy(desc(knowledgeBaseDocuments.uploadedAt));
    return documents;
  }

  async getKnowledgeBaseDocument(id: number): Promise<KnowledgeBaseDocument | undefined> {
    const [document] = await db.select().from(knowledgeBaseDocuments).where(eq(knowledgeBaseDocuments.id, id));
    return document || undefined;
  }

  async createKnowledgeBaseDocument(insertDoc: InsertKnowledgeBaseDocument): Promise<KnowledgeBaseDocument> {
    const [document] = await db
      .insert(knowledgeBaseDocuments)
      .values(insertDoc)
      .returning();
    return document;
  }

  async updateKnowledgeBaseDocument(id: number, updateData: Partial<InsertKnowledgeBaseDocument>): Promise<KnowledgeBaseDocument> {
    const [document] = await db
      .update(knowledgeBaseDocuments)
      .set(updateData)
      .where(eq(knowledgeBaseDocuments.id, id))
      .returning();
    return document;
  }

  async deleteKnowledgeBaseDocument(id: number): Promise<void> {
    await db.delete(knowledgeBaseDocuments).where(eq(knowledgeBaseDocuments.id, id));
  }
}

export const storage = new DatabaseStorage();

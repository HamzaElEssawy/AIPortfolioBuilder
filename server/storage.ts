import {
  users,
  contactSubmissions,
  caseStudies,
  mediaAssets,
  contentSections,
  contentVersions,
  knowledgeBaseDocuments,
  experienceEntries,
  skillCategories,
  skills,
  portfolioMetrics,
  coreValues,
  portfolioStatus,
  portfolioImages,
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
  type ExperienceEntry,
  type InsertExperienceEntry,
  type SkillCategory,
  type InsertSkillCategory,
  type Skill,
  type InsertSkill,
  type PortfolioMetric,
  type InsertPortfolioMetric,
  type CoreValue,
  type InsertCoreValue,
  type PortfolioStatus,
  type InsertPortfolioStatus,
  type PortfolioImage,
  type InsertPortfolioImage,
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
  updateCaseStudyFeatured(id: number, featured: boolean): Promise<CaseStudy>;
  reorderCaseStudies(studies: { id: number; displayOrder: number }[]): Promise<void>;
  getPublishedCaseStudies(): Promise<CaseStudy[]>;
  getFeaturedCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined>;
  
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
  
  // Experience entries
  getExperienceEntries(): Promise<ExperienceEntry[]>;
  getExperienceEntry(id: number): Promise<ExperienceEntry | undefined>;
  createExperienceEntry(entry: InsertExperienceEntry): Promise<ExperienceEntry>;
  updateExperienceEntry(id: number, entry: Partial<InsertExperienceEntry>): Promise<ExperienceEntry>;
  deleteExperienceEntry(id: number): Promise<void>;
  
  // Skills and categories
  getSkillCategories(): Promise<SkillCategory[]>;
  getSkills(): Promise<Skill[]>;
  getSkillsByCategory(categoryId: number): Promise<Skill[]>;
  createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkillCategory(id: number, category: Partial<InsertSkillCategory>): Promise<SkillCategory>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkillCategory(id: number): Promise<void>;
  deleteSkill(id: number): Promise<void>;
  
  // Portfolio metrics
  getPortfolioMetrics(): Promise<PortfolioMetric[]>;
  getPortfolioMetric(id: number): Promise<PortfolioMetric | undefined>;
  createPortfolioMetric(metric: InsertPortfolioMetric): Promise<PortfolioMetric>;
  updatePortfolioMetric(id: number, metric: Partial<InsertPortfolioMetric>): Promise<PortfolioMetric>;
  deletePortfolioMetric(id: number): Promise<void>;
  
  // Portfolio status
  getPortfolioStatus(): Promise<Record<string, boolean>>;
  updatePortfolioStatus(statusData: Record<string, boolean>): Promise<void>;
  
  // Portfolio images
  getPortfolioImages(section?: string): Promise<PortfolioImage[]>;
  getPortfolioImage(id: number): Promise<PortfolioImage | undefined>;
  createPortfolioImage(image: InsertPortfolioImage): Promise<PortfolioImage>;
  updatePortfolioImage(id: number, image: Partial<InsertPortfolioImage>): Promise<PortfolioImage>;
  deletePortfolioImage(id: number): Promise<void>;
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
    // Generate slug if not provided
    let processedData = { ...insertCaseStudy };
    
    if (!processedData.slug && processedData.title) {
      processedData.slug = processedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      console.log("Storage: Generated slug:", processedData.slug);
    }
    
    // Generate image URL if imageFile is provided
    if (processedData.imageFile && !processedData.imageUrl) {
      processedData.imageUrl = `/uploads/${processedData.imageFile}`;
      console.log("Storage: Generated imageUrl:", processedData.imageUrl);
    }
    
    console.log("Storage: Creating case study with processed data:", processedData);
    
    const [study] = await db
      .insert(caseStudies)
      .values(processedData as any)
      .returning();
    
    console.log("Storage: Case study created:", study);
    return study;
  }

  async updateCaseStudy(id: number, updateData: Partial<InsertCaseStudy>): Promise<CaseStudy> {
    // Remove undefined values and ensure proper data types
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    const [study] = await db
      .update(caseStudies)
      .set({ ...cleanData, updatedAt: new Date() })
      .where(eq(caseStudies.id, id))
      .returning();
    
    if (!study) {
      throw new Error(`Case study with ID ${id} not found`);
    }
    
    return study;
  }

  async deleteCaseStudy(id: number): Promise<void> {
    await db.delete(caseStudies).where(eq(caseStudies.id, id));
  }

  async updateCaseStudyFeatured(id: number, featured: boolean): Promise<CaseStudy> {
    const [study] = await db
      .update(caseStudies)
      .set({ featured, updatedAt: new Date() })
      .where(eq(caseStudies.id, id))
      .returning();
    return study;
  }

  async reorderCaseStudies(studies: { id: number; displayOrder: number }[]): Promise<void> {
    for (const study of studies) {
      await db
        .update(caseStudies)
        .set({ displayOrder: study.displayOrder, updatedAt: new Date() })
        .where(eq(caseStudies.id, study.id));
    }
  }

  async getPublishedCaseStudies(): Promise<CaseStudy[]> {
    const studies = await db
      .select()
      .from(caseStudies)
      .where(eq(caseStudies.status, 'published'))
      .orderBy(caseStudies.displayOrder);
    return studies;
  }

  async getFeaturedCaseStudies(): Promise<CaseStudy[]> {
    const studies = await db
      .select()
      .from(caseStudies)
      .where(eq(caseStudies.featured, true))
      .orderBy(caseStudies.displayOrder)
      .limit(3);
    return studies;
  }

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug));
    return study || undefined;
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

  // Experience entries
  async getExperienceEntries(): Promise<ExperienceEntry[]> {
    const entries = await db
      .select()
      .from(experienceEntries)
      .orderBy(experienceEntries.orderIndex);
    return entries;
  }

  async getExperienceEntry(id: number): Promise<ExperienceEntry | undefined> {
    const [entry] = await db.select().from(experienceEntries).where(eq(experienceEntries.id, id));
    return entry || undefined;
  }

  async createExperienceEntry(insertEntry: InsertExperienceEntry): Promise<ExperienceEntry> {
    const [entry] = await db
      .insert(experienceEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateExperienceEntry(id: number, updateData: Partial<InsertExperienceEntry>): Promise<ExperienceEntry> {
    // Remove timestamp fields from update data to avoid conversion errors
    const { createdAt, updatedAt, ...cleanUpdateData } = updateData as any;
    
    const [entry] = await db
      .update(experienceEntries)
      .set({ ...cleanUpdateData, updatedAt: new Date() })
      .where(eq(experienceEntries.id, id))
      .returning();
    return entry;
  }

  async deleteExperienceEntry(id: number): Promise<void> {
    await db.delete(experienceEntries).where(eq(experienceEntries.id, id));
  }

  // Skills and categories
  async getSkillCategories(): Promise<SkillCategory[]> {
    const categories = await db
      .select()
      .from(skillCategories)
      .orderBy(skillCategories.orderIndex);
    return categories;
  }

  async getSkills(): Promise<Skill[]> {
    const skillList = await db
      .select()
      .from(skills)
      .orderBy(skills.orderIndex);
    return skillList;
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    const skillList = await db
      .select()
      .from(skills)
      .where(eq(skills.categoryId, categoryId))
      .orderBy(skills.orderIndex);
    return skillList;
  }

  async createSkillCategory(insertCategory: InsertSkillCategory): Promise<SkillCategory> {
    const [category] = await db
      .insert(skillCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }

  async updateSkillCategory(id: number, updateData: Partial<InsertSkillCategory>): Promise<SkillCategory> {
    const [category] = await db
      .update(skillCategories)
      .set(updateData)
      .where(eq(skillCategories.id, id))
      .returning();
    return category;
  }

  async updateSkill(id: number, updateData: Partial<InsertSkill>): Promise<Skill> {
    // Remove timestamp fields from update data to avoid conversion errors
    const { createdAt, updatedAt, ...cleanUpdateData } = updateData as any;
    
    const [skill] = await db
      .update(skills)
      .set({ ...cleanUpdateData, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return skill;
  }

  async deleteSkillCategory(id: number): Promise<void> {
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Portfolio metrics
  async getPortfolioMetrics(): Promise<PortfolioMetric[]> {
    const metrics = await db
      .select()
      .from(portfolioMetrics)
      .orderBy(portfolioMetrics.displayOrder);
    return metrics;
  }

  async getPortfolioMetric(id: number): Promise<PortfolioMetric | undefined> {
    const [metric] = await db.select().from(portfolioMetrics).where(eq(portfolioMetrics.id, id));
    return metric || undefined;
  }

  async createPortfolioMetric(insertMetric: InsertPortfolioMetric): Promise<PortfolioMetric> {
    const [metric] = await db
      .insert(portfolioMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async updatePortfolioMetric(id: number, updateData: Partial<InsertPortfolioMetric>): Promise<PortfolioMetric> {
    const [metric] = await db
      .update(portfolioMetrics)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(portfolioMetrics.id, id))
      .returning();
    return metric;
  }

  async deletePortfolioMetric(id: number): Promise<void> {
    await db.delete(portfolioMetrics).where(eq(portfolioMetrics.id, id));
  }

  // Core Values operations
  async getCoreValues(): Promise<CoreValue[]> {
    return await db.select().from(coreValues).orderBy(coreValues.orderIndex);
  }

  async createCoreValue(value: InsertCoreValue): Promise<CoreValue> {
    const [newValue] = await db.insert(coreValues).values(value).returning();
    return newValue;
  }

  async updateCoreValue(id: number, updates: Partial<InsertCoreValue>): Promise<CoreValue> {
    const [updatedValue] = await db
      .update(coreValues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coreValues.id, id))
      .returning();
    return updatedValue;
  }

  async deleteCoreValue(id: number): Promise<void> {
    await db.delete(coreValues).where(eq(coreValues.id, id));
  }

  // Portfolio status operations
  async getPortfolioStatus(): Promise<Record<string, boolean>> {
    const statuses = await db.select().from(portfolioStatus);
    
    // Default status for all sections
    const defaultStatus = {
      hero: true,
      about: true,
      skills: true,
      timeline: true,
      coreValues: true,
      caseStudies: true,
      contact: true,
    };

    // Override with database values
    statuses.forEach(status => {
      if (status.sectionKey in defaultStatus) {
        defaultStatus[status.sectionKey as keyof typeof defaultStatus] = status.enabled;
      }
    });

    return defaultStatus;
  }

  async updatePortfolioStatus(statusData: Record<string, boolean>): Promise<void> {
    for (const [sectionKey, enabled] of Object.entries(statusData)) {
      await db
        .insert(portfolioStatus)
        .values({
          sectionKey,
          enabled,
        })
        .onConflictDoUpdate({
          target: portfolioStatus.sectionKey,
          set: {
            enabled,
            updatedAt: new Date(),
          },
        });
    }
  }

  // Portfolio images operations
  async getPortfolioImages(section?: string): Promise<PortfolioImage[]> {
    const query = db.select().from(portfolioImages);
    if (section) {
      return await query.where(eq(portfolioImages.section, section)).orderBy(portfolioImages.orderIndex);
    }
    return await query.orderBy(portfolioImages.section, portfolioImages.orderIndex);
  }

  async getPortfolioImage(id: number): Promise<PortfolioImage | undefined> {
    const result = await db.select().from(portfolioImages).where(eq(portfolioImages.id, id));
    return result[0];
  }

  async createPortfolioImage(insertImage: InsertPortfolioImage): Promise<PortfolioImage> {
    const result = await db.insert(portfolioImages).values(insertImage).returning();
    return result[0];
  }

  async updatePortfolioImage(id: number, updateData: Partial<InsertPortfolioImage>): Promise<PortfolioImage> {
    // Remove timestamp fields from update data to avoid conversion errors
    const { createdAt, updatedAt, ...cleanUpdateData } = updateData as any;
    
    const result = await db.update(portfolioImages)
      .set({ ...cleanUpdateData, updatedAt: new Date() })
      .where(eq(portfolioImages.id, id))
      .returning();
    return result[0];
  }

  async deletePortfolioImage(id: number): Promise<void> {
    await db.delete(portfolioImages).where(eq(portfolioImages.id, id));
  }

  // Case study images - using portfolioImages table with case study reference
  async getCaseStudyImages(caseStudyId: number): Promise<PortfolioImage[]> {
    const images = await db
      .select()
      .from(portfolioImages)
      .where(eq(portfolioImages.caseStudyId, caseStudyId))
      .orderBy(portfolioImages.orderIndex);
    return images;
  }

  async createCaseStudyImage(insertImage: Omit<InsertPortfolioImage, 'section'> & { caseStudyId: number }): Promise<PortfolioImage> {
    // Enforce single image per case study - delete existing images first
    await db
      .delete(portfolioImages)
      .where(eq(portfolioImages.caseStudyId, insertImage.caseStudyId));
    
    const [image] = await db
      .insert(portfolioImages)
      .values({
        ...insertImage,
        section: 'case-study',
      })
      .returning();
    return image;
  }

  async deleteCaseStudyImage(id: number): Promise<void> {
    await db.delete(portfolioImages).where(eq(portfolioImages.id, id));
  }
}

export const storage = new DatabaseStorage();

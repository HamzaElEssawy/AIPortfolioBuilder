import { db } from "./db";
import { contentSections, contentVersions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { cache } from "./cache";

interface ContentData {
  title?: string;
  summary?: string;
  competencies?: string;
  philosophyQuote?: string;
  philosophyTitle?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
}

class DatabaseContentManager {
  private static instance: DatabaseContentManager;

  private constructor() {}

  static getInstance(): DatabaseContentManager {
    if (!DatabaseContentManager.instance) {
      DatabaseContentManager.instance = new DatabaseContentManager();
    }
    return DatabaseContentManager.instance;
  }

  async getContent(sectionId: string): Promise<ContentData | null> {
    try {
      const cacheKey = `content:${sectionId}`;
      const cached = cache.get<ContentData>(cacheKey);
      if (cached) return cached;

      const result = await db
        .select()
        .from(contentSections)
        .where(eq(contentSections.id, sectionId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const content = result[0].content as ContentData;
      cache.set(cacheKey, content, 300); // Cache for 5 minutes
      return content;
    } catch (error) {
      console.error(`Error fetching content for ${sectionId}:`, error);
      return null;
    }
  }

  async saveContent(sectionId: string, content: ContentData): Promise<void> {
    try {
      // Sanitize content to remove any React component metadata
      const sanitizedContent = this.sanitizeContent(content);

      const existing = await db
        .select()
        .from(contentSections)
        .where(eq(contentSections.id, sectionId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing content
        await db
          .update(contentSections)
          .set({
            content: sanitizedContent,
            lastModified: new Date(),
            version: existing[0].version + 1,
          })
          .where(eq(contentSections.id, sectionId));
      } else {
        // Create new content section
        await db.insert(contentSections).values({
          id: sectionId,
          name: this.getSectionName(sectionId),
          content: sanitizedContent,
          status: "published",
          lastModified: new Date(),
          version: 1,
        });
      }

      // Clear cache
      cache.delete(`content:${sectionId}`);
      
      // Create version history
      await this.createVersion(sectionId, sanitizedContent);
    } catch (error) {
      console.error(`Error saving content for ${sectionId}:`, error);
      throw error;
    }
  }

  private sanitizeContent(content: ContentData): ContentData {
    const sanitized: ContentData = {};

    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Remove React component metadata and clean HTML
        let cleanValue = value
          .replace(/<div[^>]*data-replit-metadata[^>]*>.*?<\/div>/g, '')
          .replace(/data-replit-metadata="[^"]*"/g, '')
          .replace(/data-component-name="[^"]*"/g, '')
          .replace(/style="[^"]*--tw-[^"]*"/g, '')
          .replace(/class="[^"]*text-center mb-20[^"]*"/g, '')
          .trim();

        // For rich text fields, keep basic HTML tags
        if (key === 'competencies' || key === 'philosophyQuote') {
          // Allow basic formatting tags
          cleanValue = cleanValue
            .replace(/<(?!\/?(b|i|strong|em|p|br|ul|ol|li)\b)[^>]*>/g, '')
            .trim();
        } else {
          // For plain text fields, strip all HTML
          cleanValue = cleanValue.replace(/<[^>]*>/g, '').trim();
        }

        sanitized[key as keyof ContentData] = cleanValue;
      }
    });

    return sanitized;
  }

  private async createVersion(sectionId: string, content: ContentData): Promise<void> {
    try {
      await db.insert(contentVersions).values({
        sectionId,
        content,
        version: 1,
        changeSummary: "Content updated",
        createdBy: "admin",
        publishedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error creating version for ${sectionId}:`, error);
    }
  }

  private getSectionName(sectionId: string): string {
    const names: Record<string, string> = {
      hero: "Hero Section",
      about: "About Section",
      skills: "Skills Section",
      experience: "Experience Section",
      contact: "Contact Section",
    };
    return names[sectionId] || sectionId;
  }

  async getAllContent(): Promise<Record<string, ContentData>> {
    try {
      const results = await db.select().from(contentSections);
      const content: Record<string, ContentData> = {};
      
      results.forEach((section) => {
        content[section.id] = section.content as ContentData;
      });

      return content;
    } catch (error) {
      console.error("Error fetching all content:", error);
      return {};
    }
  }
}

export const dbContentManager = DatabaseContentManager.getInstance();
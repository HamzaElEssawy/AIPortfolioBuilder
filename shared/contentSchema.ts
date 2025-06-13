import { z } from "zod";

// Hero Section Schema
export const heroContentSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  subheadline: z.string().min(1, "Subheadline is required"),
  ctaText: z.string().min(1, "Call to action text is required"),
  ctaSecondaryText: z.string().optional(),
});

// Stats Section Schema
export const statsContentSchema = z.object({
  stat1Value: z.string().min(1, "Stat 1 value is required"),
  stat1Label: z.string().min(1, "Stat 1 label is required"),
  stat2Value: z.string().min(1, "Stat 2 value is required"),
  stat2Label: z.string().min(1, "Stat 2 label is required"),
  stat3Value: z.string().min(1, "Stat 3 value is required"),
  stat3Label: z.string().min(1, "Stat 3 label is required"),
  stat4Value: z.string().min(1, "Stat 4 value is required"),
  stat4Label: z.string().min(1, "Stat 4 label is required"),
});

// About Section Schema
export const aboutContentSchema = z.object({
  title: z.string().min(1, "About title is required"),
  summary: z.string().min(1, "Professional summary is required"),
  competencies: z.string().min(1, "Core competencies are required"),
  philosophyQuote: z.string().min(1, "Philosophy quote is required"),
  philosophyTitle: z.string().min(1, "Philosophy title is required"),
  profileImage: z.string().optional(),
});

// Experience Item Schema
export const experienceItemSchema = z.object({
  id: z.number(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  period: z.string().min(1, "Time period is required"),
  description: z.string().min(1, "Description is required"),
  achievements: z.array(z.string()).min(1, "At least one achievement is required"),
  technologies: z.array(z.string()).optional(),
  location: z.string().optional(),
  current: z.boolean().default(false),
});

// Experience Section Schema
export const experienceContentSchema = z.object({
  title: z.string().min(1, "Experience title is required"),
  subtitle: z.string().optional(),
  experiences: z.array(experienceItemSchema),
});

// Enhanced Case Study Schema with Technical Depth & Visual Storytelling
export const caseStudySchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Case study title is required"),
  slug: z.string().optional(),
  status: z.enum(["draft", "published"]),
  challenge: z.string().min(1, "Challenge description is required"),
  approach: z.string().min(1, "Approach description is required"),
  solution: z.string().min(1, "Solution description is required"),
  impact: z.string().min(1, "Impact description is required"),
  metrics: z.array(z.string()).min(1, "At least one metric is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  featured: z.boolean().default(false),
  imageUrl: z.string().optional(),
  heroUrl: z.string().optional(),
  
  // Technical Depth Enhancement
  technicalDetails: z.object({
    modelArchitecture: z.string().optional(),
    performanceMetrics: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      improvement: z.string().optional()
    })).optional(),
    deploymentStrategy: z.string().optional(),
    complianceFramework: z.string().optional(),
    systemArchitectureUrl: z.string().optional()
  }).optional(),
  
  // Visual Storytelling Elements
  visualElements: z.object({
    processFlowDiagramUrl: z.string().optional(),
    beforeAfterComparison: z.object({
      beforeImage: z.string(),
      afterImage: z.string(),
      improvementMetric: z.string()
    }).optional(),
    interactiveDemo: z.string().optional(),
    screenshotGallery: z.array(z.string()).optional()
  }).optional(),
  
  // Cross-Cultural & Regional Adaptation
  crossCulturalElements: z.object({
    targetRegions: z.array(z.string()).optional(),
    regulatoryCompliance: z.array(z.string()).optional(),
    culturalAdaptations: z.string().optional(),
    localMarketInsights: z.string().optional()
  }).optional(),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Case Studies Section Schema
export const caseStudiesContentSchema = z.object({
  title: z.string().min(1, "Case studies title is required"),
  subtitle: z.string().optional(),
  caseStudies: z.array(caseStudySchema),
});

// Skills Category Schema
export const skillsCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  icon: z.string().optional(),
});

// Skills Section Schema
export const skillsContentSchema = z.object({
  title: z.string().min(1, "Skills title is required"),
  subtitle: z.string().optional(),
  categories: z.array(skillsCategorySchema),
});

// Contact Section Schema
export const contactContentSchema = z.object({
  title: z.string().min(1, "Contact title is required"),
  subtitle: z.string().optional(),
  email: z.string().email("Valid email is required"),
  linkedin: z.string().url("Valid LinkedIn URL is required"),
  location: z.string().min(1, "Location is required"),
  availability: z.string().min(1, "Availability status is required"),
});

// SEO Settings Schema
export const seoSettingsSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  description: z.string().min(1, "Meta description is required"),
  keywords: z.string().min(1, "Keywords are required"),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});

// Complete Portfolio Content Schema
export const portfolioContentSchema = z.object({
  hero: heroContentSchema,
  stats: statsContentSchema,
  about: aboutContentSchema,
  experience: experienceContentSchema,
  caseStudies: caseStudiesContentSchema,
  skills: skillsContentSchema,
  contact: contactContentSchema,
  seo: seoSettingsSchema,
  lastUpdated: z.string(),
  version: z.number(),
});

// Type exports
export type HeroContent = z.infer<typeof heroContentSchema>;
export type StatsContent = z.infer<typeof statsContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ExperienceContent = z.infer<typeof experienceContentSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type CaseStudiesContent = z.infer<typeof caseStudiesContentSchema>;
export type SkillsCategory = z.infer<typeof skillsCategorySchema>;
export type SkillsContent = z.infer<typeof skillsContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type SEOSettings = z.infer<typeof seoSettingsSchema>;
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;

// Content section types
export type ContentSectionType = 'hero' | 'stats' | 'about' | 'experience' | 'caseStudies' | 'skills' | 'contact' | 'seo';

// Content change tracking
export const contentChangeSchema = z.object({
  id: z.number(),
  sectionType: z.enum(['hero', 'stats', 'about', 'experience', 'caseStudies', 'skills', 'contact', 'seo']),
  changeType: z.enum(['create', 'update', 'delete', 'publish']),
  oldContent: z.record(z.any()).optional(),
  newContent: z.record(z.any()),
  changedBy: z.string(),
  changedAt: z.string(),
  published: z.boolean().default(false),
});

export type ContentChange = z.infer<typeof contentChangeSchema>;
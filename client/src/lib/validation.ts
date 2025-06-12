import { z } from "zod";

// File validation schemas
export const imageFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    ),
});

// Text validation schemas
export const richTextSchema = z.string()
  .min(1, "Content is required")
  .max(50000, "Content is too long (max 50,000 characters)")
  .refine(
    (text) => {
      // Basic XSS protection - check for dangerous patterns
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>.*?<\/embed>/gi,
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(text));
    },
    "Content contains potentially unsafe elements"
  );

export const urlSchema = z.string()
  .url("Must be a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "Only HTTP and HTTPS URLs are allowed"
  );

export const emailSchema = z.string()
  .email("Must be a valid email address")
  .max(254, "Email is too long");

// Sanitization functions
export function sanitizeHtml(input: string): string {
  // Remove potentially dangerous elements and attributes
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeFilename(filename: string): string {
  // Remove potentially dangerous characters from filenames
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  return file.size <= maxSizeInMB * 1024 * 1024;
}

// Form validation schemas for portfolio components
export const portfolioMetricSchema = z.object({
  metricName: z.string()
    .min(1, "Metric name is required")
    .max(100, "Metric name is too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Metric name contains invalid characters"),
  metricValue: z.string()
    .min(1, "Metric value is required")
    .max(50, "Metric value is too long"),
  metricLabel: z.string()
    .min(1, "Metric label is required")
    .max(200, "Metric label is too long"),
  displayOrder: z.number()
    .min(0, "Display order must be non-negative")
    .max(1000, "Display order is too large"),
});

export const portfolioImageSchema = z.object({
  section: z.string()
    .min(1, "Section is required")
    .max(50, "Section name is too long")
    .regex(/^[a-zA-Z0-9\-_]+$/, "Section name contains invalid characters"),
  imageUrl: urlSchema,
  altText: z.string()
    .min(1, "Alt text is required")
    .max(200, "Alt text is too long"),
  caption: z.string()
    .max(500, "Caption is too long")
    .optional(),
  orderIndex: z.number()
    .min(0, "Order index must be non-negative")
    .max(1000, "Order index is too large")
    .nullable(),
  isActive: z.boolean(),
});

export const caseStudySchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  description: richTextSchema.optional(),
  content: richTextSchema.optional(),
  technologies: z.array(z.string().max(100))
    .max(20, "Too many technologies"),
  projectUrl: urlSchema.optional().or(z.literal("")),
  imageUrl: urlSchema.optional().or(z.literal("")),
  category: z.string()
    .max(100, "Category is too long")
    .optional(),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  completedAt: z.string().datetime().optional().or(z.literal("")),
});

export const experienceEntrySchema = z.object({
  year: z.string()
    .min(1, "Year is required")
    .max(50, "Year is too long"),
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  company: z.string()
    .max(200, "Company name is too long")
    .optional(),
  description: richTextSchema.optional(),
  technologies: z.array(z.string().max(100))
    .max(20, "Too many technologies"),
  orderIndex: z.number()
    .min(0, "Order index must be non-negative")
    .max(1000, "Order index is too large")
    .nullable(),
  highlight: z.boolean().nullable(),
});

export const contactSubmissionSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s\-']+$/, "Name contains invalid characters"),
  email: emailSchema,
  subject: z.string()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
  projectType: z.string()
    .max(100, "Project type is too long")
    .optional(),
});

// Utility function to validate and sanitize input
export function validateAndSanitize<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ["Validation failed"]
    };
  }
}
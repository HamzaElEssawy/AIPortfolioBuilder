import { db } from './db';
import * as schema from '@shared/schema';
import { like, or, and, sql, eq } from 'drizzle-orm';
import { logger } from './logger';
import { cache } from './cache';

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  tags?: string[];
  status?: string[];
  type?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeContent?: boolean;
  fuzzy?: boolean;
}

export interface SearchResult<T = any> {
  id: number | string;
  type: string;
  title: string;
  content?: string;
  excerpt: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  data: T;
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  filters: SearchFilters;
  options: SearchOptions;
  executionTime: number;
  suggestions?: string[];
}

class SearchEngine {
  private static instance: SearchEngine;

  private constructor() {}

  static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine();
    }
    return SearchEngine.instance;
  }

  async search(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = cache.get<SearchResponse>(cacheKey);
    if (cached) {
      logger.debug('Search cache hit', { query, cacheKey });
      return cached;
    }

    try {
      logger.info('Executing search', { query, filters, options });

      const results: SearchResult[] = [];
      
      // Search case studies
      if (!filters.type || filters.type === 'case-studies') {
        const caseStudyResults = await this.searchCaseStudies(query, filters, options);
        results.push(...caseStudyResults);
      }

      // Search content sections
      if (!filters.type || filters.type === 'content') {
        const contentResults = await this.searchContent(query, filters, options);
        results.push(...contentResults);
      }

      // Search knowledge base
      if (!filters.type || filters.type === 'knowledge-base') {
        const knowledgeResults = await this.searchKnowledgeBase(query, filters, options);
        results.push(...knowledgeResults);
      }

      // Search experience entries
      if (!filters.type || filters.type === 'experience') {
        const experienceResults = await this.searchExperience(query, filters, options);
        results.push(...experienceResults);
      }

      // Search skills
      if (!filters.type || filters.type === 'skills') {
        const skillResults = await this.searchSkills(query, filters, options);
        results.push(...skillResults);
      }

      // Search portfolio metrics
      if (!filters.type || filters.type === 'metrics') {
        const metricResults = await this.searchMetrics(query, filters, options);
        results.push(...metricResults);
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Apply pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const paginatedResults = results.slice(offset, offset + limit);

      const response: SearchResponse = {
        results: paginatedResults,
        total: results.length,
        query,
        filters,
        options,
        executionTime: Date.now() - startTime,
        suggestions: await this.generateSuggestions(query, results.length === 0)
      };

      // Cache the response for 5 minutes
      cache.set(cacheKey, response, 300);

      logger.info('Search completed', {
        query,
        resultsCount: results.length,
        executionTime: response.executionTime
      });

      return response;
    } catch (error) {
      logger.error('Search failed', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async searchCaseStudies(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.caseStudies.title, `%${query}%`),
            like(schema.caseStudies.description, `%${query}%`),
            like(schema.caseStudies.technologies, `%${query}%`),
            like(schema.caseStudies.challenges, `%${query}%`)
          )
        );
      }

      if (filters.status?.length) {
        whereConditions.push(
          sql`${schema.caseStudies.featured} IN (${filters.status.includes('featured') ? 'true' : 'false'})`
        );
      }

      const caseStudies = await db
        .select()
        .from(schema.caseStudies)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return caseStudies.map(caseStudy => ({
        id: caseStudy.id,
        type: 'case-study',
        title: caseStudy.title,
        content: options.includeContent ? caseStudy.description : undefined,
        excerpt: this.createExcerpt(caseStudy.description, 150),
        relevanceScore: this.calculateRelevance(query, [
          caseStudy.title,
          caseStudy.description,
          caseStudy.technologies.join(' '),
          caseStudy.challenges
        ]),
        metadata: {
          featured: caseStudy.featured,
          technologies: caseStudy.technologies,
          duration: caseStudy.duration,
          outcomes: caseStudy.outcomes
        },
        data: caseStudy
      }));
    } catch (error) {
      logger.error('Case study search failed', { error });
      return [];
    }
  }

  private async searchContent(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.contentSections.sectionId, `%${query}%`),
            like(schema.contentSections.content, `%${query}%`)
          )
        );
      }

      const contentSections = await db
        .select()
        .from(schema.contentSections)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return contentSections.map(section => ({
        id: section.sectionId,
        type: 'content',
        title: section.sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        content: options.includeContent ? JSON.stringify(section.content) : undefined,
        excerpt: this.createExcerpt(JSON.stringify(section.content), 150),
        relevanceScore: this.calculateRelevance(query, [
          section.sectionId,
          JSON.stringify(section.content)
        ]),
        metadata: {
          version: section.version,
          lastUpdated: section.lastUpdated
        },
        data: section
      }));
    } catch (error) {
      logger.error('Content search failed', { error });
      return [];
    }
  }

  private async searchKnowledgeBase(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.knowledgeBaseDocuments.title, `%${query}%`),
            like(schema.knowledgeBaseDocuments.content, `%${query}%`),
            like(schema.knowledgeBaseDocuments.tags, `%${query}%`)
          )
        );
      }

      if (filters.categories?.length) {
        whereConditions.push(
          sql`${schema.knowledgeBaseDocuments.category} IN (${filters.categories.join(',')})`
        );
      }

      const documents = await db
        .select()
        .from(schema.knowledgeBaseDocuments)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return documents.map(doc => ({
        id: doc.id,
        type: 'knowledge-base',
        title: doc.title,
        content: options.includeContent ? doc.content : undefined,
        excerpt: this.createExcerpt(doc.content, 150),
        relevanceScore: this.calculateRelevance(query, [
          doc.title,
          doc.content,
          doc.tags.join(' ')
        ]),
        metadata: {
          category: doc.category,
          tags: doc.tags,
          isPublic: doc.isPublic
        },
        data: doc
      }));
    } catch (error) {
      logger.error('Knowledge base search failed', { error });
      return [];
    }
  }

  private async searchExperience(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.experienceEntries.title, `%${query}%`),
            like(schema.experienceEntries.company, `%${query}%`),
            like(schema.experienceEntries.description, `%${query}%`)
          )
        );
      }

      const experiences = await db
        .select()
        .from(schema.experienceEntries)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return experiences.map(exp => ({
        id: exp.id,
        type: 'experience',
        title: `${exp.title} at ${exp.company}`,
        content: options.includeContent ? exp.description : undefined,
        excerpt: this.createExcerpt(exp.description, 150),
        relevanceScore: this.calculateRelevance(query, [
          exp.title,
          exp.company,
          exp.description
        ]),
        metadata: {
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent
        },
        data: exp
      }));
    } catch (error) {
      logger.error('Experience search failed', { error });
      return [];
    }
  }

  private async searchSkills(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.skills.name, `%${query}%`),
            like(schema.skills.description, `%${query}%`)
          )
        );
      }

      const skills = await db
        .select({
          skill: schema.skills,
          category: schema.skillCategories
        })
        .from(schema.skills)
        .leftJoin(
          schema.skillCategories,
          eq(schema.skills.categoryId, schema.skillCategories.id)
        )
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return skills.map(({ skill, category }) => ({
        id: skill.id,
        type: 'skill',
        title: skill.name,
        content: options.includeContent ? skill.description : undefined,
        excerpt: this.createExcerpt(skill.description || '', 150),
        relevanceScore: this.calculateRelevance(query, [
          skill.name,
          skill.description || '',
          category?.name || ''
        ]),
        metadata: {
          proficiency: skill.proficiency,
          category: category?.name,
          isCore: skill.isCore
        },
        data: skill
      }));
    } catch (error) {
      logger.error('Skills search failed', { error });
      return [];
    }
  }

  private async searchMetrics(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      const whereConditions = [];
      
      if (query) {
        whereConditions.push(
          or(
            like(schema.portfolioMetrics.metricName, `%${query}%`),
            like(schema.portfolioMetrics.description, `%${query}%`)
          )
        );
      }

      const metrics = await db
        .select()
        .from(schema.portfolioMetrics)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return metrics.map(metric => ({
        id: metric.id,
        type: 'metric',
        title: metric.metricName,
        content: options.includeContent ? metric.description : undefined,
        excerpt: this.createExcerpt(metric.description || '', 150),
        relevanceScore: this.calculateRelevance(query, [
          metric.metricName,
          metric.description || ''
        ]),
        metadata: {
          value: metric.metricValue,
          unit: metric.unit,
          isHighlighted: metric.isHighlighted
        },
        data: metric
      }));
    } catch (error) {
      logger.error('Metrics search failed', { error });
      return [];
    }
  }

  private calculateRelevance(query: string, texts: string[]): number {
    if (!query) return 1;
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    let score = 0;
    
    for (const text of texts) {
      if (!text) continue;
      
      const textLower = text.toLowerCase();
      
      // Exact phrase match (highest score)
      if (textLower.includes(queryLower)) {
        score += 10;
      }
      
      // Individual word matches
      for (const word of queryWords) {
        if (textLower.includes(word)) {
          score += 1;
        }
      }
    }
    
    return score;
  }

  private createExcerpt(text: string, maxLength: number = 150): string {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  private async generateSuggestions(query: string, noResults: boolean): Promise<string[]> {
    if (!noResults) return [];
    
    // Simple suggestion logic - could be enhanced with ML
    const suggestions = [
      'Try different keywords',
      'Check spelling',
      'Use more general terms',
      'Browse categories instead'
    ];
    
    return suggestions;
  }

  // Index content for better search performance
  async rebuildSearchIndex(): Promise<void> {
    try {
      logger.info('Starting search index rebuild');
      
      // Clear search-related cache
      cache.deletePattern('^search:');
      
      // Pre-warm cache with common searches
      const commonQueries = [
        'AI',
        'machine learning',
        'product',
        'leadership',
        'strategy',
        'innovation'
      ];
      
      for (const query of commonQueries) {
        await this.search(query, {}, { limit: 10 });
      }
      
      logger.info('Search index rebuild completed');
    } catch (error) {
      logger.error('Search index rebuild failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const searchEngine = SearchEngine.getInstance();
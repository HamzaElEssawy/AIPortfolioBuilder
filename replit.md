# Personal AI Portfolio & Companion System

## Overview

This is a comprehensive full-stack web application that combines a professional portfolio website with an advanced AI-powered personal companion. The system features dynamic content management, AI-powered career guidance, document processing capabilities, and intelligent conversation management with persistent memory.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions for admin authentication
- **File Upload**: Multer middleware for document and image processing
- **Security**: Helmet, rate limiting, input validation, and sanitization

### AI Integration
- **Primary AI**: Anthropic Claude API for advanced reasoning and conversation
- **Fallback AI**: Google Gemini API for reliability and cost optimization
- **Document Processing**: PDF, DOCX, and TXT file text extraction
- **Memory System**: Persistent conversation memory with context management
- **Vector Embeddings**: Semantic search capabilities using Google's embedding models

## Key Components

### 1. Portfolio Website
- **Dynamic Hero Section**: Configurable headlines, CTAs, achievement cards, and floating metrics
- **About Section**: Rich text content with professional timeline and geographic expertise
- **Case Studies**: Comprehensive project showcases with technical details and impact metrics
- **Skills Management**: Categorized technical and soft skills with proficiency levels
- **Timeline**: Professional experience with rich descriptions and visual elements
- **Contact System**: Form submissions with spam protection and admin management

### 2. Admin Dashboard
- **Content Management**: Real-time editing of all portfolio sections with rich text editors
- **Case Study Editor**: Full CRUD operations with image uploads and AI enhancement
- **Image Management**: Upload, organize, and manage media assets by section
- **Metrics Dashboard**: Analytics and performance monitoring
- **Knowledge Base**: Document upload and categorization system
- **User Management**: Session-based authentication with role-based access

### 3. AI Personal Companion
- **Knowledge Base**: Document processing and intelligent categorization
- **Conversation Management**: Multi-session support with context preservation
- **Memory System**: Mem0-like persistent memory with importance scoring
- **Career Guidance**: Resume optimization, interview preparation, and strategic planning
- **Brand Analysis**: Portfolio analysis and content strategy recommendations
- **Document Intelligence**: Automated insights extraction and summarization

## Data Flow

### Content Management Flow
1. Admin creates/edits content through rich text editors
2. Content is validated using Zod schemas
3. Data is stored in PostgreSQL database
4. Cache is automatically invalidated for real-time updates
5. Frontend receives updated content through React Query

### AI Conversation Flow
1. User uploads documents to knowledge base
2. Documents are processed and text is extracted
3. AI generates summaries and key insights
4. Vector embeddings are created for semantic search
5. Conversation context is assembled from relevant documents and memories
6. AI response is generated using Claude (primary) or Gemini (fallback)
7. Conversation and memories are persisted to database

### Document Processing Flow
1. Files are uploaded through secure multer middleware
2. Text extraction based on file type (PDF/DOCX/TXT)
3. Content is cleaned and normalized
4. AI analysis generates summaries and insights
5. Vector embeddings are computed for semantic search
6. Document metadata and content are stored in database

## External Dependencies

### AI Services
- **Anthropic Claude API**: Advanced reasoning, conversation, and content generation
- **Google Gemini API**: Fallback AI service and embedding generation
- **Vector Embedding Service**: Semantic search and document similarity

### Database & Infrastructure
- **PostgreSQL**: Primary data storage with vector extension support
- **Neon Database**: Serverless PostgreSQL hosting
- **File Storage**: Local file system with organized upload directory

### Development & Security
- **Rate Limiting**: Express rate limiter for API protection
- **Session Management**: Secure admin authentication
- **Input Validation**: Comprehensive Zod schema validation
- **Security Headers**: Helmet middleware for security hardening

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with development hot reloading
- **Database**: PostgreSQL 16 with auto-migration
- **Build**: Vite development server with HMR
- **Port Configuration**: Application runs on port 5000

### Production Deployment
- **Build Process**: Vite production build with asset optimization
- **Database Migration**: Drizzle Kit for schema management
- **Process Manager**: Production-ready Express server
- **Static Assets**: Optimized bundle with code splitting

### Environment Configuration
- **Development**: `npm run dev` for development server
- **Production**: `npm run build && npm run start`
- **Database**: `npm run db:push` for schema updates

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 19, 2025**: Created comprehensive system documentation covering complete architecture flow from frontend to database to third-party integrations
  - Documented all API routes and endpoints with detailed specifications  
  - Mapped complete data flow architecture for content management, AI conversations, and document processing
  - Detailed third-party service integrations (Anthropic Claude, Google Gemini, PostgreSQL)
  - Added security implementation details and performance optimization strategies
  - Included troubleshooting guide and deployment procedures

## Changelog

- July 19, 2025: Comprehensive system documentation created
- June 24, 2025: Initial setup
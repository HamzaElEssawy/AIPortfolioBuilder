# Personal AI Portfolio & Companion System

## Overview

This is a comprehensive full-stack web application that combines a professional portfolio website with an advanced AI-powered personal companion. The system features dynamic content management, AI-powered career guidance, document processing capabilities, and intelligent conversation management with persistent memory.

## System Architecture

### Monorepo Structure
- **Package Manager**: pnpm with workspace configuration
- **Apps Directory**: `apps/` contains all applications and shared packages
  - `apps/client/` - React frontend application
  - `apps/api-gateway/` - Express backend server
  - `apps/ai-orchestrator/` - Dedicated AI service management
  - `apps/shared/` - Shared TypeScript schemas and types
- **Packages Directory**: `packages/` contains shared utility packages
  - `packages/shared-utils/` - Environment validation, logging, and error handling utilities
- **Workspace Config**: `pnpm-workspace.yaml` manages package dependencies across apps

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Location**: `apps/client/`
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Location**: `apps/api-gateway/`
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions for admin authentication
- **File Upload**: Multer middleware for document and image processing
- **Security**: Helmet, rate limiting, input validation, and sanitization
- **Environment**: Zod-validated environment variables for type safety
- **Logging**: Pino logger with structured logging and module-specific contexts
- **Error Handling**: Custom AppError classes with HTTP status codes

### AI Integration (`apps/ai-orchestrator`)
- **Architecture**: Dedicated microservice with provider pattern for AI models
- **Primary AI**: Anthropic Claude API through ClaudeProvider
- **Fallback AI**: Google Gemini API through GeminiProvider
- **Orchestrator**: Centralized chat management with `runChat({ userId, prompt })` interface
- **Memory System**: Persistent conversation memory with context management
- **Conversation Manager**: Session handling and context building
- **Document Processing**: PDF, DOCX, and TXT file text extraction
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

## Shared Utilities (`packages/shared-utils`)

### Environment Validation
- **Zod Schema**: Validates all environment variables on startup
- **Type Safety**: Exports typed `env` object with proper defaults
- **Required Variables**: DATABASE_URL, ANTHROPIC_API_KEY, GEMINI_API_KEY
- **Optional Variables**: REDIS_URL with fallback defaults
- **Security**: SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD with secure defaults

### Logging System
- **Base Logger**: Pino logger with development/production configurations
- **Request Scoping**: `withReq(reqId)` for request-specific logging
- **Module Scoping**: `withModule(moduleName)` for component-specific logging
- **Structured Output**: JSON format with timestamps and context data
- **Development Mode**: Pretty-printed logs with colors and formatting

### Error Handling
- **AppError Class**: Custom error class with statusCode, code, and details
- **HTTP Status**: Proper status code mapping for API responses
- **Type Safety**: TypeScript interfaces for consistent error structure

## Recent Changes (July 2025)

### Accessibility Error Translator Implementation Complete ✅
**July 24, 2025** - Successfully implemented color-coded and icon-based error communication system:
- Created `AccessibilityErrorTranslator.tsx` component with 6 severity levels (critical, high, medium, low, info, success)
- Implemented 6 error categories with distinct icons (validation, network, permission, timeout, system, security)
- Built interactive demo page at `/error-translator` with live examples and controls
- Added full accessibility support with ARIA labels, semantic HTML, and screen reader compatibility
- Integrated navigation routing with Link components for seamless user experience
- Included comprehensive usage guidelines and implementation examples

### Monorepo Migration & Code Quality Implementation Complete ✅
**July 24, 2025** - Successfully completed comprehensive 4-step monorepo restructuring:
- **Step 1**: Monorepo Migration with centralized shared-utils package
- **Step 2**: ESLint 9 & Prettier setup with modern flat config
- **Step 3**: Vitest testing framework with 15 passing tests
- **Step 4**: CI/CD pipeline with 5 GitHub Actions workflows
- Created production-ready architecture with quality gates and automation
- All tests passing, code quality enforced, security monitoring enabled

## Previous Changes

### Monorepo Migration Complete ✓
- Successfully restructured project into monorepo architecture
- Created `packages/shared-utils` with centralized utilities
- Updated all apps/api-gateway files to use shared-utils
- Replaced all process.env references with validated env object
- Converted all console.log/error statements to structured Pino logging
- Added module-specific loggers throughout the codebase

### AI Service Restructuring Complete ✓
- Created dedicated `apps/ai-orchestrator` microservice
- Implemented IAIProvider interface with ClaudeProvider and GeminiProvider
- Built Orchestrator class exposing runChat({ userId, prompt }) interface
- Migrated conversationManager and memoryService to ai-orchestrator
- Updated api-gateway to use proxy calls via OrchestratorClient
- Separated AI concerns from main application logic

### BullMQ Document Ingestion Pipeline Complete ✓
- Built async document processing worker with BullMQ queue system
- Created `apps/ingestion-worker` with text extraction and chunking
- Implemented `packages/vector-repo` for embedding storage
- Updated upload routes to return 202 responses and queue processing jobs
- Added queue monitoring endpoints for job status tracking
- Graceful Redis fallback when queue service unavailable

### Comprehensive Error Handling System Complete ✓
- Created standardized error handlers for Express and Fastify frameworks
- AppError instances return `{ success: false, error: { code, message, details } }` format
- Generic errors log full stack traces and return 500 with code: 'INTERNAL'
- Wrapped routes with asyncHandler to catch uncaught exceptions
- Added error helper functions and validation error factories
- Implemented structured error logging with request context

### Code Quality Tools Setup Complete ✓
- Implemented ESLint 9 with modern flat config format
- Configured TypeScript, React, and Node.js specific linting rules
- Set up Prettier for consistent code formatting across monorepo
- Created environment-specific overrides (browser for client, Node for server)
- Fixed import paths and removed unused variables throughout codebase
- Established foundation for automated code quality enforcement

### Vitest Testing Framework Complete ✓
- Configured Vitest with jsdom environment for React component testing
- Set up @testing-library/react for component interaction testing
- Created comprehensive test setup with proper mocking utilities
- Built test suites for AppError class, environment validation, and React components
- Established test helper utilities for consistent testing patterns
- Implemented proper async/await patterns and module mocking
- Coverage reporting configured with v8 provider for detailed test metrics

### CI/CD Pipeline Complete ✓
- Implemented comprehensive GitHub Actions workflows for automated testing
- Created multi-stage pipeline with linting, testing, security scanning, and deployment
- Set up CodeQL security analysis with JavaScript/TypeScript support
- Configured Dependabot for automated dependency updates with auto-merge
- Built performance testing pipeline with Lighthouse CI and bundle analysis
- Created issue and pull request templates for standardized contributions
- Implemented automated security vulnerability scanning and reporting
- Set up validation scripts for build artifacts and CI/CD environment

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

- **July 19, 2025**: Restructured project into monorepo architecture
  - Moved React frontend code from `client/` to `apps/client/`
  - Moved server code from `server/` to `apps/api-gateway/`
  - Moved shared schema from `shared/` to `apps/shared/`
  - Created `pnpm-workspace.yaml` with packages configuration for `apps/*` and `packages/*`
  - Updated all relative imports throughout codebase to use new monorepo structure
  - Updated tsconfig.json paths to reference new directory structure
  - All import statements in server files now use relative paths instead of `@shared` aliases
  - Server successfully running from new location with proper path resolution

- **July 19, 2025**: Created comprehensive system documentation covering complete architecture flow from frontend to database to third-party integrations
  - Documented all API routes and endpoints with detailed specifications  
  - Mapped complete data flow architecture for content management, AI conversations, and document processing
  - Detailed third-party service integrations (Anthropic Claude, Google Gemini, PostgreSQL)
  - Added security implementation details and performance optimization strategies
  - Included troubleshooting guide and deployment procedures

## Changelog

- July 19, 2025: Comprehensive system documentation created
- June 24, 2025: Initial setup
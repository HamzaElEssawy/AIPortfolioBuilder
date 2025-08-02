# Personal AI Portfolio & Companion System

## Overview
This is a comprehensive full-stack web application combining a professional portfolio website with an advanced AI-powered personal companion. The system offers dynamic content management, AI-powered career guidance, document processing, and intelligent conversation management with persistent memory. Its business vision is to provide a cutting-edge platform for professionals to showcase their work and leverage AI for career development and personal assistance, tapping into the growing market for AI-enhanced personal productivity tools.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
- **Package Manager**: pnpm workspaces
- **Applications**: `apps/` for client, API gateway, and AI orchestrator
- **Shared Packages**: `packages/` for shared utilities like environment validation and logging

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Framework**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions for admin
- **File Upload**: Multer
- **Security**: Helmet, rate limiting, input validation
- **Environment**: Zod-validated environment variables
- **Logging**: Pino with structured logging
- **Error Handling**: Custom `AppError` classes

### AI Integration (`apps/ai-orchestrator`)
- **Architecture**: Dedicated microservice with provider pattern
- **Primary AI**: Anthropic Claude API
- **Fallback AI**: Google Gemini API
- **Core Functionality**: Centralized chat management, persistent conversation memory, document processing, and vector embeddings.

### Key Components

#### Portfolio Website
- **Dynamic Sections**: Hero, About, Case Studies, Skills, Timeline, Contact System.
- **Content**: Configurable, rich-text, comprehensive showcases.

#### Admin Dashboard
- **Content Management**: Real-time editing, CRUD operations for case studies, image management.
- **Tools**: Metrics dashboard, knowledge base upload, user management.

#### AI Personal Companion
- **Capabilities**: Knowledge base integration (document processing, categorization), multi-session conversation management, Mem0-like persistent memory, career guidance (resume, interviews), brand analysis, document intelligence.

### Shared Utilities (`packages/shared-utils`)
- **Environment Validation**: Zod schema for type-safe environment variables.
- **Logging System**: Pino-based structured logging with request and module scoping.
- **Error Handling**: Custom `AppError` class for consistent API error responses.

### UI/UX Decisions
- **Components**: Utilizes Shadcn/ui for consistent, accessible, and themeable UI elements.
- **Styling**: Tailwind CSS for utility-first styling, enabling rapid and consistent design.

### Feature Specifications
- **Accessibility**: Includes an `AccessibilityErrorTranslator` component with color-coded, icon-based error communication across six severity levels and categories, supporting ARIA labels and screen reader compatibility.
- **Monorepo Structure**: Enforces code consistency and reusability across applications and shared packages.
- **Code Quality**: ESLint 9, Prettier, Vitest, and GitHub Actions for CI/CD, ensuring high standards and automated testing.

### System Design Choices
- **Microservices**: Dedicated AI orchestrator for scalability and separation of concerns.
- **Asynchronous Processing**: Planned BullMQ for document ingestion, enabling non-blocking file processing.
- **Data Flow**: Defined flows for content management (PostgreSQL, React Query), AI conversations (document processing, vector embeddings, AI response generation), and document processing (Multer, text extraction, AI analysis, embeddings).

## External Dependencies

### AI Services
- **Anthropic Claude API**: For advanced AI reasoning and generation.
- **Google Gemini API**: Fallback AI and embedding generation.

### Database & Infrastructure
- **PostgreSQL**: Primary data store.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Local File Storage**: For uploaded documents and images.

### Development & Security
- **Express Rate Limiter**: For API protection.
- **Express Sessions**: For admin authentication.
- **Zod**: For comprehensive input validation.
- **Helmet**: For setting security HTTP headers.
```
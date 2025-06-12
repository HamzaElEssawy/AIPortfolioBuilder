# Comprehensive System Documentation

## System Architecture Overview

### Frontend (React + TypeScript)
- **Location**: `client/` directory
- **Framework**: React with TypeScript, Vite build system
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Authentication**: Session-based admin authentication

### Backend (Node.js + Express)
- **Location**: `server/` directory
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions
- **AI Integration**: Anthropic Claude API

### Database Schema (PostgreSQL)

#### Core Tables
```sql
-- User Management
users (id, username, password)

-- Contact System
contact_submissions (id, name, email, company, project_type, message, submitted_at)

-- Portfolio Content
case_studies (id, title, challenge, approach, solution, impact, metrics[], technologies[], status, technical_details, visual_elements, cross_cultural_elements, created_at, updated_at)

-- Media Management
media_assets (id, filename, url, type, size, tags[], uploaded_at)

-- Content Management System
content_sections (id, name, content, status, last_modified, version)
content_versions (id, section_id, content, version, created_at, published_at)

-- Knowledge Base
knowledge_base_documents (id, filename, category, size, status, vector_id, uploaded_at)
```

## Admin Dashboard Functions Status

### ✅ WORKING FUNCTIONS

#### 1. Contact Submissions Management
- **GET** `/api/admin/contact-submissions` - Fetch all submissions
- **DELETE** `/api/admin/contact-submissions/:id` - Delete submission
- **GET** `/api/admin/export-submissions` - Export to CSV
- **Database**: Connected to `contact_submissions` table
- **Frontend**: `client/src/pages/Admin.tsx` (submissions tab)

#### 2. Admin Authentication
- **POST** `/api/admin/login` - Admin login
- **GET** `/api/admin/status` - Check admin status
- **Middleware**: `isAdmin` for protected routes
- **Frontend**: `client/src/components/AdminAuthGuard.tsx`

### ✅ FIXED FUNCTIONS (Database Connected)

#### 3. Case Studies Management
- **GET** `/api/admin/case-studies` - Fetch all case studies
- **GET** `/api/admin/case-studies/:id` - Fetch single case study
- **POST** `/api/admin/case-studies` - Create case study
- **PUT** `/api/admin/case-studies/:id` - Update case study
- **DELETE** `/api/admin/case-studies/:id` - Delete case study
- **Database**: Connected to `case_studies` table
- **Frontend**: Enhanced case study editor tab

#### 4. Media Assets Management
- **GET** `/api/admin/media` - Fetch all media assets
- **GET** `/api/admin/media/:id` - Fetch single asset
- **POST** `/api/admin/media` - Create media asset
- **PUT** `/api/admin/media/:id` - Update media asset
- **DELETE** `/api/admin/media/:id` - Delete media asset
- **Database**: Connected to `media_assets` table
- **Frontend**: Portfolio manager tab

#### 5. Knowledge Base Management
- **GET** `/api/admin/knowledge-base/documents` - Fetch all documents
- **GET** `/api/admin/knowledge-base/documents/:id` - Fetch single document
- **POST** `/api/admin/knowledge-base/documents` - Create document
- **PUT** `/api/admin/knowledge-base/documents/:id` - Update document
- **DELETE** `/api/admin/knowledge-base/documents/:id` - Delete document
- **GET** `/api/admin/knowledge-base/stats` - Get statistics
- **Database**: Connected to `knowledge_base_documents` table
- **Frontend**: Knowledge base manager tab

### 🔄 HYBRID SYSTEM (File + Database)

#### 6. Content Management System
- **Current**: Uses file-based storage in `data/` directory
- **Enhanced**: Database tables created for migration
- **API**: Content sections and versions endpoints
- **Frontend**: Enhanced content manager
- **Migration**: Automatic migration from files to database

## API Endpoints Reference

### Public Endpoints
```
POST /api/contact-submissions - Submit contact form
GET /api/portfolio/content/:section - Get portfolio section content
POST /api/claude-conversation - AI assistant chat
```

### Admin-Only Endpoints
```
# Authentication
POST /api/admin/login
GET /api/admin/status

# Contact Management
GET /api/admin/contact-submissions
DELETE /api/admin/contact-submissions/:id
GET /api/admin/export-submissions

# Case Studies
GET /api/admin/case-studies
GET /api/admin/case-studies/:id
POST /api/admin/case-studies
PUT /api/admin/case-studies/:id
DELETE /api/admin/case-studies/:id
POST /api/admin/generate-case-study (Claude AI)

# Media Assets
GET /api/admin/media
GET /api/admin/media/:id
POST /api/admin/media
PUT /api/admin/media/:id
DELETE /api/admin/media/:id

# Knowledge Base
GET /api/admin/knowledge-base/documents
GET /api/admin/knowledge-base/documents/:id
POST /api/admin/knowledge-base/documents
PUT /api/admin/knowledge-base/documents/:id
DELETE /api/admin/knowledge-base/documents/:id
GET /api/admin/knowledge-base/stats

# Content Management
GET /api/admin/content/sections
GET /api/admin/content/sections/:id
POST /api/admin/content/sections
PUT /api/admin/content/sections/:id
DELETE /api/admin/content/sections/:id
GET /api/admin/content/versions
```

## Frontend Components Architecture

### Pages
- `client/src/pages/Home.tsx` - Main portfolio website
- `client/src/pages/Admin.tsx` - Admin dashboard with tabs
- `client/src/pages/AdminLogin.tsx` - Admin authentication

### Admin Dashboard Components
- `AdminAuthGuard.tsx` - Authentication wrapper
- `EnhancedContentManager.tsx` - Content sections management
- `EnhancedCaseStudyEditor.tsx` - AI-powered case study creation
- `VisualHierarchyEnhancer.tsx` - Design system controls
- `PortfolioManager.tsx` - Media and portfolio management
- `KnowledgeBaseManager.tsx` - Document management
- `AIAssistant.tsx` - Claude AI integration
- `DeploymentRecommendations.tsx` - Deployment guidance

### Portfolio Components
- `Hero.tsx` - Landing section
- `About.tsx` - About section
- `Experience.tsx` - Professional timeline
- `CaseStudies.tsx` - Project showcases
- `SkillsShowcase.tsx` - Technical skills
- `Contact.tsx` - Contact form
- `Navigation.tsx` - Site navigation
- `Footer.tsx` - Site footer

## Database Storage Layer

### Interface: `IStorage` (server/storage.ts)
```typescript
interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>
  getContactSubmissions(): Promise<ContactSubmission[]>
  deleteContactSubmission(id: number): Promise<void>
  
  // Case studies
  getCaseStudies(): Promise<CaseStudy[]>
  getCaseStudy(id: number): Promise<CaseStudy | undefined>
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>
  updateCaseStudy(id: number, caseStudy: Partial<InsertCaseStudy>): Promise<CaseStudy>
  deleteCaseStudy(id: number): Promise<void>
  
  // Media assets
  getMediaAssets(): Promise<MediaAsset[]>
  getMediaAsset(id: number): Promise<MediaAsset | undefined>
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>
  updateMediaAsset(id: number, asset: Partial<InsertMediaAsset>): Promise<MediaAsset>
  deleteMediaAsset(id: number): Promise<void>
  
  // Content sections
  getContentSections(): Promise<ContentSection[]>
  getContentSection(id: string): Promise<ContentSection | undefined>
  createContentSection(section: InsertContentSection): Promise<ContentSection>
  updateContentSection(id: string, section: Partial<InsertContentSection>): Promise<ContentSection>
  deleteContentSection(id: string): Promise<void>
  
  // Content versions
  getContentVersions(sectionId?: string): Promise<ContentVersion[]>
  createContentVersion(version: InsertContentVersion): Promise<ContentVersion>
  
  // Knowledge base documents
  getKnowledgeBaseDocuments(): Promise<KnowledgeBaseDocument[]>
  getKnowledgeBaseDocument(id: number): Promise<KnowledgeBaseDocument | undefined>
  createKnowledgeBaseDocument(doc: InsertKnowledgeBaseDocument): Promise<KnowledgeBaseDocument>
  updateKnowledgeBaseDocument(id: number, doc: Partial<InsertKnowledgeBaseDocument>): Promise<KnowledgeBaseDocument>
  deleteKnowledgeBaseDocument(id: number): Promise<void>
}
```

## Current Data

### Sample Case Study
```json
{
  "id": 1,
  "title": "AI Compliance Platform for Financial Services",
  "challenge": "Built AI-driven compliance platform from concept to $110K+ funding...",
  "approach": "Implemented lean startup methodology with rapid prototyping...",
  "solution": "Developed comprehensive compliance automation platform...",
  "impact": "Secured $110K+ in early-stage funding, achieved product-market fit...",
  "metrics": ["$110K+ funding secured", "50% reduction in manual review", "99.9% accuracy rate", "10+ enterprise pilots"],
  "technologies": ["React", "Node.js", "PostgreSQL", "Claude API", "Python ML"],
  "status": "published"
}
```

### Sample Media Assets
```json
[
  {
    "id": 1,
    "filename": "hamza-professional-headshot.jpg",
    "url": "/media/hamza-headshot.jpg",
    "type": "image",
    "size": 2048576,
    "tags": ["headshot", "professional", "portfolio"]
  },
  {
    "id": 2,
    "filename": "ai-compliance-platform-architecture.pdf",
    "url": "/media/platform-architecture.pdf",
    "type": "document",
    "size": 5242880,
    "tags": ["architecture", "compliance", "technical"]
  }
]
```

### Sample Knowledge Base Documents
```json
[
  {
    "id": 1,
    "filename": "hamza-resume-2024-latest.pdf",
    "category": "resume",
    "size": 2048576,
    "status": "embedded",
    "vectorId": "vec_001"
  },
  {
    "id": 2,
    "filename": "google-ai-pm-interview-transcript.txt",
    "category": "interview",
    "size": 156789,
    "status": "embedded",
    "vectorId": "vec_002"
  },
  {
    "id": 3,
    "filename": "career-strategy-2024-notes.docx",
    "category": "career-plan",
    "size": 89654,
    "status": "processing"
  }
]
```

## Testing Procedures

### Manual Testing Checklist

#### Admin Dashboard Functions
1. **Login**: Navigate to `/admin-login`, enter credentials
2. **Contact Submissions**: View, filter, delete submissions
3. **Case Studies**: Create, edit, delete case studies
4. **Media Assets**: Upload, tag, organize media files
5. **Knowledge Base**: Upload documents, track processing status
6. **Content Management**: Edit portfolio sections, track versions
7. **AI Assistant**: Test Claude integration for career advice
8. **Design System**: Adjust typography, colors, responsive layouts

#### Portfolio-Dashboard Synchronization
1. **Edit Hero Section**: Admin → Live portfolio update
2. **Add Case Study**: Admin → Portfolio case studies page
3. **Update About Section**: Admin → Live about page
4. **Modify Skills**: Admin → Skills showcase update

#### Database Integrity
1. **Create Operations**: Verify database inserts
2. **Update Operations**: Confirm version tracking
3. **Delete Operations**: Ensure clean removal
4. **Foreign Key Relationships**: Test data consistency

## Deployment Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=your-secret-key

# AI Integration
ANTHROPIC_API_KEY=sk-...

# Server
NODE_ENV=production
PORT=5000
```

### File Structure
```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database layer
│   ├── db.ts              # Database connection
│   └── contentManager.ts  # File-based content
├── shared/                 # Shared types
│   ├── schema.ts          # Database schema
│   └── contentSchema.ts   # Content types
├── data/                   # Content files
└── package.json           # Dependencies
```

## Next Steps for Complete System

1. **Test All Admin Functions**: Verify each CRUD operation
2. **Content Migration**: Complete file-to-database migration
3. **File Upload Implementation**: Add actual file upload functionality
4. **Real-time Synchronization**: Test portfolio-dashboard sync
5. **Performance Optimization**: Add caching and optimization
6. **Security Hardening**: Implement proper authentication
7. **Production Deployment**: Configure for production environment
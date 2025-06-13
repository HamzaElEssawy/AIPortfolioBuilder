# Content Management System Redesign & Fix

## Current Issues Identified

1. **HTML Rendering Problem**: Raw HTML/CSS stored as text instead of clean content
2. **Text Editor Integration**: TinyMCE not properly integrated with content saving
3. **Database Disconnect**: File-based contentManager vs database storage mismatch
4. **Data Format Issues**: Content stored with React component metadata instead of clean HTML

## Root Cause Analysis

The content management system has multiple disconnected layers:
- File-based contentManager.ts storing JSON
- Database content_sections table (empty)
- Frontend displaying raw HTML markup as text
- Text editor saving React component code instead of clean HTML

## Comprehensive Fix Plan

### Phase 1: Clean Content Storage
1. Sanitize existing content data
2. Remove React component metadata
3. Store clean HTML in database
4. Migrate from file-based to database storage

### Phase 2: Text Editor Integration
1. Fix TinyMCE content extraction
2. Ensure clean HTML output (no component metadata)
3. Proper content sanitization before storage
4. Real-time preview with clean rendering

### Phase 3: Database Migration
1. Move all content from files to database
2. Update API endpoints to use database
3. Remove file-based contentManager dependency
4. Ensure consistent data format

### Phase 4: Frontend Rendering Fix
1. Update AboutStreamlined to handle clean HTML
2. Remove dangerouslySetInnerHTML where possible
3. Use proper text rendering for plain text fields
4. Clean separation between rich text and plain text

## Implementation Strategy

1. Create new content API endpoints using database
2. Build content sanitization pipeline
3. Update frontend components to use clean data
4. Test end-to-end content flow
5. Migrate existing content data

This will ensure clean, professional content display without HTML markup showing as text.
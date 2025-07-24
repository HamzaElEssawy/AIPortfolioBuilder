#!/bin/bash

# Build Validation Script
# Validates that the build artifacts are correctly generated

set -e

echo "🔍 Validating build artifacts..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found"
    exit 1
fi

# Check for main JavaScript file
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found"
    exit 1
fi

# Check file sizes
INDEX_SIZE=$(stat -f%z "dist/index.js" 2>/dev/null || stat -c%s "dist/index.js")
echo "📦 Bundle size: ${INDEX_SIZE} bytes"

# Validate bundle size (5MB limit)
MAX_SIZE=5242880
if [ "$INDEX_SIZE" -gt "$MAX_SIZE" ]; then
    echo "❌ Bundle size ($INDEX_SIZE bytes) exceeds limit ($MAX_SIZE bytes)"
    exit 1
fi

# Check for source maps (in development)
if [ "$NODE_ENV" != "production" ] && [ ! -f "dist/index.js.map" ]; then
    echo "⚠️  Source map not found (recommended for development)"
fi

# Validate JavaScript syntax
echo "🔍 Validating JavaScript syntax..."
node -c "dist/index.js"

echo "✅ Build artifacts validated successfully!"
echo "📊 Build summary:"
echo "  - Bundle size: ${INDEX_SIZE} bytes"
echo "  - Syntax: Valid"
echo "  - Files: Complete"
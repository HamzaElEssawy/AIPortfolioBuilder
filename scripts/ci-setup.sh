#!/bin/bash

# CI/CD Setup Script for AI Portfolio Project
# This script sets up the development environment for CI/CD

set -e

echo "🚀 Setting up CI/CD environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js detected: $NODE_VERSION"
    
    # Check if Node.js version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "❌ Node.js version 18+ required, found $NODE_VERSION"
        exit 1
    fi
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm detected: $PNPM_VERSION"
else
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Set up Git hooks (if husky is configured)
if [ -d ".husky" ]; then
    echo "🪝 Setting up Git hooks..."
    pnpm exec husky install
fi

# Run initial checks
echo "🔍 Running initial code quality checks..."

# TypeScript check
echo "  📝 Checking TypeScript..."
pnpm exec tsc --noEmit

# Linting check
echo "  🔧 Running ESLint..."
pnpm exec eslint . --max-warnings 0

# Formatting check
echo "  💅 Checking Prettier formatting..."
pnpm exec prettier --check .

# Run tests
echo "  🧪 Running tests..."
pnpm exec vitest run

echo "✅ CI/CD environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Configure GitHub secrets (if deploying)"
echo "  2. Update .github/dependabot.yml with your GitHub username"
echo "  3. Review and customize .github/workflows/ files"
echo "  4. Push to GitHub to trigger CI/CD pipeline"
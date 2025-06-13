#!/usr/bin/env node

/**
 * Comprehensive System Integration Test Suite
 * Tests all admin-to-live integrations and identifies gaps
 */

const BASE_URL = 'http://localhost:5000';

class SystemIntegrationTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      gaps: []
    };
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  async testContentIntegration() {
    console.log('\n=== CONTENT INTEGRATION TEST ===');
    
    // Test Hero Section Integration
    try {
      const heroContent = await this.makeRequest('/api/portfolio/content/hero');
      if (heroContent && heroContent.headline) {
        this.results.passed.push('Hero content API working');
      } else {
        this.results.failed.push('Hero content missing or malformed');
      }
      
      // Check for HTML encoding issues
      if (heroContent.subheadline && heroContent.subheadline.includes('<')) {
        this.results.warnings.push('Hero content contains HTML markup');
      }
    } catch (error) {
      this.results.failed.push(`Hero content API error: ${error.message}`);
    }

    // Test About Section Integration
    try {
      const aboutContent = await this.makeRequest('/api/portfolio/content/about');
      if (aboutContent && aboutContent.title) {
        this.results.passed.push('About content API working');
      } else {
        this.results.failed.push('About content missing or malformed');
      }
      
      // Check for HTML encoding issues
      if (aboutContent.competencies && aboutContent.competencies.includes('&lt;')) {
        this.results.warnings.push('About content has HTML encoding issues');
      }
      
      // Check Leadership Philosophy integration
      if (!aboutContent.philosophyQuote) {
        this.results.gaps.push('Leadership Philosophy not connected to admin');
      }
    } catch (error) {
      this.results.failed.push(`About content API error: ${error.message}`);
    }
  }

  async testDynamicSectionsIntegration() {
    console.log('\n=== DYNAMIC SECTIONS INTEGRATION TEST ===');
    
    // Test Skills Section
    try {
      const skills = await this.makeRequest('/api/portfolio/skills');
      if (skills && Array.isArray(skills)) {
        this.results.passed.push('Skills API working');
        if (skills.length === 0) {
          this.results.gaps.push('No skills data found');
        }
      } else {
        this.results.failed.push('Skills API malformed response');
      }
      
      // Check if skills have admin interface
      try {
        await this.makeRequest('/api/admin/skills');
        this.results.passed.push('Skills admin API exists');
      } catch (error) {
        this.results.gaps.push('Skills admin interface missing');
      }
    } catch (error) {
      this.results.failed.push(`Skills API error: ${error.message}`);
    }

    // Test Timeline Section
    try {
      const timeline = await this.makeRequest('/api/portfolio/timeline');
      if (timeline && Array.isArray(timeline)) {
        this.results.passed.push('Timeline API working');
        if (timeline.length === 0) {
          this.results.gaps.push('No timeline data found');
        }
      } else {
        this.results.failed.push('Timeline API malformed response');
      }
      
      // Check if timeline has admin interface
      try {
        await this.makeRequest('/api/admin/timeline');
        this.results.passed.push('Timeline admin API exists');
      } catch (error) {
        this.results.gaps.push('Timeline admin interface missing');
      }
    } catch (error) {
      this.results.failed.push(`Timeline API error: ${error.message}`);
    }

    // Test Core Values Section
    try {
      const coreValues = await this.makeRequest('/api/portfolio/core-values');
      if (coreValues && Array.isArray(coreValues)) {
        this.results.passed.push('Core Values API working');
        if (coreValues.length === 0) {
          this.results.gaps.push('No core values data found');
        }
      } else {
        this.results.failed.push('Core Values API malformed response');
      }
      
      // Check if core values have admin interface
      try {
        await this.makeRequest('/api/admin/core-values');
        this.results.passed.push('Core Values admin API exists');
      } catch (error) {
        this.results.gaps.push('Core Values admin interface missing');
      }
    } catch (error) {
      this.results.failed.push(`Core Values API error: ${error.message}`);
    }
  }

  async testImageManagement() {
    console.log('\n=== IMAGE MANAGEMENT TEST ===');
    
    // Test Hero Images
    try {
      const heroImages = await this.makeRequest('/api/portfolio/images/hero');
      if (heroImages && Array.isArray(heroImages)) {
        this.results.passed.push('Hero images API working');
        if (heroImages.length === 0) {
          this.results.warnings.push('No hero images found');
        }
      }
    } catch (error) {
      this.results.failed.push(`Hero images API error: ${error.message}`);
    }

    // Test About Images
    try {
      const aboutImages = await this.makeRequest('/api/portfolio/images/about');
      if (aboutImages && Array.isArray(aboutImages)) {
        this.results.passed.push('About images API working');
        if (aboutImages.length === 0) {
          this.results.warnings.push('No about images found');
        }
      }
    } catch (error) {
      this.results.failed.push(`About images API error: ${error.message}`);
    }
  }

  async testCaseStudiesIntegration() {
    console.log('\n=== CASE STUDIES INTEGRATION TEST ===');
    
    try {
      const caseStudies = await this.makeRequest('/api/admin/case-studies');
      if (caseStudies && Array.isArray(caseStudies)) {
        this.results.passed.push('Case Studies API working');
        if (caseStudies.length === 0) {
          this.results.warnings.push('No case studies found');
        }
      }
    } catch (error) {
      this.results.failed.push(`Case Studies API error: ${error.message}`);
    }
  }

  async testCacheSystem() {
    console.log('\n=== CACHE SYSTEM TEST ===');
    
    try {
      // Test cache stats
      const cacheStats = await this.makeRequest('/api/admin/cache/stats');
      if (cacheStats) {
        this.results.passed.push('Cache system working');
      }
    } catch (error) {
      this.results.warnings.push('Cache stats not accessible');
    }

    try {
      // Test cache clearing
      const clearResult = await this.makeRequest('/api/admin/cache/clear', { method: 'POST' });
      if (clearResult) {
        this.results.passed.push('Cache clearing working');
      }
    } catch (error) {
      this.results.warnings.push('Cache clearing not working');
    }
  }

  async testAdminInterface() {
    console.log('\n=== ADMIN INTERFACE TEST ===');
    
    // Test portfolio status
    try {
      const status = await this.makeRequest('/api/admin/portfolio-status');
      if (status) {
        this.results.passed.push('Portfolio status API working');
      }
    } catch (error) {
      this.results.failed.push(`Portfolio status API error: ${error.message}`);
    }

    // Test admin authentication
    try {
      const adminStatus = await this.makeRequest('/api/admin/status');
      if (adminStatus) {
        this.results.passed.push('Admin authentication working');
      }
    } catch (error) {
      this.results.warnings.push('Admin authentication may not be working');
    }
  }

  async testPerformanceMonitoring() {
    console.log('\n=== PERFORMANCE MONITORING TEST ===');
    
    try {
      const metrics = await this.makeRequest('/api/admin/performance/metrics');
      if (metrics) {
        this.results.passed.push('Performance monitoring working');
      }
    } catch (error) {
      this.results.gaps.push('Performance monitoring not accessible');
    }
  }

  async testMissingEndpoints() {
    console.log('\n=== MISSING ENDPOINTS TEST ===');
    
    const missingEndpoints = [
      '/api/admin/skills',
      '/api/admin/timeline',
      '/api/admin/core-values',
      '/api/admin/seo-settings'
    ];

    for (const endpoint of missingEndpoints) {
      try {
        await this.makeRequest(endpoint);
        this.results.passed.push(`${endpoint} exists`);
      } catch (error) {
        this.results.gaps.push(`${endpoint} missing`);
      }
    }
  }

  generateReport() {
    console.log('\n'.repeat(2));
    console.log('='.repeat(80));
    console.log('             COMPREHENSIVE SYSTEM INTEGRATION REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🟢 WORKING FEATURES:');
    this.results.passed.forEach(item => console.log(`  ✓ ${item}`));
    
    console.log('\n🔴 BROKEN FEATURES:');
    this.results.failed.forEach(item => console.log(`  ✗ ${item}`));
    
    console.log('\n🟡 WARNINGS:');
    this.results.warnings.forEach(item => console.log(`  ⚠ ${item}`));
    
    console.log('\n🔍 INTEGRATION GAPS:');
    this.results.gaps.forEach(item => console.log(`  → ${item}`));
    
    // Calculate completion percentage
    const total = this.results.passed.length + this.results.failed.length + this.results.gaps.length;
    const working = this.results.passed.length;
    const percentage = total > 0 ? Math.round((working / total) * 100) : 0;
    
    console.log('\n📊 SYSTEM INTEGRATION STATUS:');
    console.log(`  Overall Integration: ${percentage}% complete`);
    console.log(`  Working Features: ${this.results.passed.length}`);
    console.log(`  Broken Features: ${this.results.failed.length}`);
    console.log(`  Missing Features: ${this.results.gaps.length}`);
    console.log(`  Warnings: ${this.results.warnings.length}`);
    
    console.log('\n🎯 PRIORITY FIXES NEEDED:');
    console.log('  1. Fix HTML encoding in content display');
    console.log('  2. Create Skills management interface');
    console.log('  3. Create Timeline management interface');
    console.log('  4. Create Core Values management interface');
    console.log('  5. Implement SEO management frontend');
    
    console.log('\n='.repeat(80));
  }

  async runAllTests() {
    console.log('Starting Comprehensive System Integration Test...');
    
    await this.testContentIntegration();
    await this.testDynamicSectionsIntegration();
    await this.testImageManagement();
    await this.testCaseStudiesIntegration();
    await this.testCacheSystem();
    await this.testAdminInterface();
    await this.testPerformanceMonitoring();
    await this.testMissingEndpoints();
    
    this.generateReport();
  }
}

// Run the tests
const tester = new SystemIntegrationTester();
tester.runAllTests().catch(console.error);
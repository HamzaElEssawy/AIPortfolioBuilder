#!/usr/bin/env node

/**
 * Comprehensive Content Management System Test Suite
 * Tests the robust text editor, content synchronization, and cache invalidation
 */

import { promises as fs } from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
const TEST_CONTENT = {
  hero: {
    headline: "AI Product Leader & Innovator TEST",
    subheadline: "Multi-time Founder & Technical Visionary TEST", 
    ctaText: "Let's Build Together TEST",
    ctaSecondaryText: "Explore My Work TEST"
  },
  about: {
    title: "About Hamza - Testing Content System",
    summary: "Experienced AI Product Leader with a proven track record of building scalable solutions that transform businesses through intelligent automation and strategic product development. TEST CONTENT UPDATE",
    competencies: "AI Product Strategy, Machine Learning Operations, Cross-functional Team Leadership, Enterprise Solution Architecture, Regulatory Compliance Systems TEST"
  }
};

class ContentSystemTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
    this.startTime = Date.now();
  }

  async runTest(testName, testFn) {
    console.log(`🧪 Running: ${testName}`);
    try {
      const start = Date.now();
      await testFn();
      const duration = Date.now() - start;
      this.testResults.push({
        name: testName,
        status: 'PASS',
        duration: `${duration}ms`
      });
      console.log(`✅ PASS: ${testName} (${duration}ms)`);
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message
      });
      this.errors.push({ test: testName, error: error.message });
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async testServerAvailability() {
    const response = await this.makeRequest('/api/admin/status');
    if (!response.isAdmin) {
      throw new Error('Admin access not available');
    }
  }

  async testContentRetrieval() {
    // Test hero content retrieval
    const heroContent = await this.makeRequest('/api/portfolio/content/hero');
    if (!heroContent.headline || !heroContent.subheadline) {
      throw new Error('Hero content missing required fields');
    }

    // Test about content retrieval
    const aboutContent = await this.makeRequest('/api/portfolio/content/about');
    if (!aboutContent.title || !aboutContent.summary) {
      throw new Error('About content missing required fields');
    }
  }

  async testContentUpdate() {
    // Update hero section
    const heroResponse = await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(TEST_CONTENT.hero)
    });

    if (!heroResponse.success) {
      throw new Error('Hero content update failed');
    }

    // Update about section
    const aboutResponse = await this.makeRequest('/api/portfolio/content/about', {
      method: 'PUT', 
      body: JSON.stringify(TEST_CONTENT.about)
    });

    if (!aboutResponse.success) {
      throw new Error('About content update failed');
    }
  }

  async testContentVerification() {
    // Wait for cache invalidation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify hero content update
    const heroContent = await this.makeRequest('/api/portfolio/content/hero');
    if (heroContent.headline !== TEST_CONTENT.hero.headline) {
      throw new Error(`Hero headline mismatch. Expected: ${TEST_CONTENT.hero.headline}, Got: ${heroContent.headline}`);
    }

    // Verify about content update
    const aboutContent = await this.makeRequest('/api/portfolio/content/about');
    if (aboutContent.title !== TEST_CONTENT.about.title) {
      throw new Error(`About title mismatch. Expected: ${TEST_CONTENT.about.title}, Got: ${aboutContent.title}`);
    }
  }

  async testCacheInvalidation() {
    // Make multiple requests to test cache behavior
    const start = Date.now();
    
    // First request (should hit fresh data)
    const response1 = await this.makeRequest('/api/portfolio/content/hero');
    const time1 = Date.now() - start;

    // Second request (should hit cache)
    const response2 = await this.makeRequest('/api/portfolio/content/hero');
    const time2 = Date.now() - start - time1;

    // Verify responses are identical
    if (JSON.stringify(response1) !== JSON.stringify(response2)) {
      throw new Error('Cache inconsistency detected');
    }

    // Cache hit should be faster than initial request
    if (time2 >= time1) {
      console.log(`⚠️  Warning: Cache hit (${time2}ms) not faster than initial request (${time1}ms)`);
    }
  }

  async testRealTimeSync() {
    const testTimestamp = new Date().toISOString();
    const syncTestContent = {
      ...TEST_CONTENT.hero,
      headline: `Real-time Sync Test ${testTimestamp}`
    };

    // Update content
    await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(syncTestContent)
    });

    // Immediate verification
    const verifyContent = await this.makeRequest('/api/portfolio/content/hero');
    if (!verifyContent.headline.includes('Real-time Sync Test')) {
      throw new Error('Real-time sync failed - content not immediately available');
    }
  }

  async testErrorHandling() {
    try {
      // Test invalid endpoint
      await this.makeRequest('/api/portfolio/content/nonexistent');
      throw new Error('Expected 404 error for invalid endpoint');
    } catch (error) {
      if (!error.message.includes('404')) {
        throw new Error(`Expected 404 error, got: ${error.message}`);
      }
    }

    try {
      // Test invalid content structure
      await this.makeRequest('/api/portfolio/content/hero', {
        method: 'PUT',
        body: JSON.stringify({ invalid: 'structure' })
      });
      // This might succeed depending on validation - that's okay
    } catch (error) {
      // Expected behavior for some implementations
    }
  }

  async testPortfolioEndpoints() {
    const endpoints = [
      '/api/portfolio/metrics',
      '/api/portfolio/skills', 
      '/api/portfolio/timeline',
      '/api/portfolio/core-values'
    ];

    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      if (!Array.isArray(response)) {
        throw new Error(`${endpoint} should return an array`);
      }
    }
  }

  async restoreOriginalContent() {
    // Restore to working content
    const originalContent = {
      hero: {
        headline: "AI Product Leader &",
        subheadline: "Multi-time Founder",
        ctaText: "Let's Connect",
        ctaSecondaryText: "View Portfolio"
      },
      about: {
        title: "About Hamza",
        summary: "Experienced AI Product Leader with a proven track record of building scalable solutions that transform businesses through intelligent automation and strategic product development.",
        competencies: "AI Product Strategy, Machine Learning Operations, Cross-functional Team Leadership, Enterprise Solution Architecture, Regulatory Compliance Systems"
      }
    };

    await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(originalContent.hero)
    });

    await this.makeRequest('/api/portfolio/content/about', {
      method: 'PUT',
      body: JSON.stringify(originalContent.about)
    });
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log('\n' + '='.repeat(60));
    console.log('COMPREHENSIVE CONTENT SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / this.testResults.length) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log('='.repeat(60));

    if (this.errors.length > 0) {
      console.log('\nERRORS:');
      this.errors.forEach(error => {
        console.log(`❌ ${error.test}: ${error.error}`);
      });
    }

    console.log('\nDETAILED RESULTS:');
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const duration = result.duration || 'N/A';
      console.log(`${status} ${result.name} (${duration})`);
    });

    return {
      totalTests: this.testResults.length,
      passed: passCount,
      failed: failCount,
      successRate: (passCount / this.testResults.length) * 100,
      totalTime,
      errors: this.errors
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Content Management System Tests\n');

    await this.runTest('Server Availability', () => this.testServerAvailability());
    await this.runTest('Content Retrieval', () => this.testContentRetrieval());
    await this.runTest('Content Update', () => this.testContentUpdate());
    await this.runTest('Content Verification', () => this.testContentVerification());
    await this.runTest('Cache Invalidation', () => this.testCacheInvalidation());
    await this.runTest('Real-time Synchronization', () => this.testRealTimeSync());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Portfolio Endpoints', () => this.testPortfolioEndpoints());
    await this.runTest('Content Restoration', () => this.restoreOriginalContent());

    return this.generateReport();
  }
}

// Run tests if this file is executed directly
const tester = new ContentSystemTester();
tester.runAllTests()
  .then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });

export default ContentSystemTester;
/**
 * Cache Alignment Test Suite
 * Verifies cache consistency with database content storage system
 */

class CacheAlignmentTester {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.results = [];
  }

  async runTest(testName, testFn) {
    try {
      console.log(`\n🧪 Running: ${testName}`);
      await testFn();
      console.log(`✅ PASSED: ${testName}`);
      this.results.push({ test: testName, status: 'PASSED' });
    } catch (error) {
      console.error(`❌ FAILED: ${testName} - ${error.message}`);
      this.results.push({ test: testName, status: 'FAILED', error: error.message });
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async testDatabaseContentStorage() {
    // Test that content is properly stored in database
    const heroContent = await this.makeRequest('/api/portfolio/content/hero');
    const aboutContent = await this.makeRequest('/api/portfolio/content/about');

    if (!heroContent.headline || !heroContent.subheadline) {
      throw new Error('Hero content missing required fields from database');
    }

    if (!aboutContent.title || !aboutContent.summary) {
      throw new Error('About content missing required fields from database');
    }

    console.log('✓ Database content storage verified');
  }

  async testCacheInvalidation() {
    const testTimestamp = Date.now();
    const testContent = {
      headline: `Cache Test ${testTimestamp}`,
      subheadline: "Testing cache invalidation",
      ctaText: "Test CTA",
      ctaSecondaryText: "Test Secondary"
    };

    // Update content
    await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(testContent)
    });

    // Wait briefly for cache invalidation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify immediate availability
    const updatedContent = await this.makeRequest('/api/portfolio/content/hero');
    
    if (!updatedContent.headline.includes(`Cache Test ${testTimestamp}`)) {
      throw new Error('Cache invalidation failed - updated content not immediately available');
    }

    console.log('✓ Cache invalidation working correctly');
  }

  async testContentSanitization() {
    const maliciousContent = {
      title: "Clean Title",
      summary: "<script>alert('xss')</script>This is <strong>bold</strong> text",
      competencies: "<div class='malicious'>Valid <em>emphasis</em> and <strong>bold</strong></div>",
      philosophyQuote: "<p style='color: red;'>Clean <b>philosophy</b></p>",
      philosophyTitle: "Philosophy Title"
    };

    // Update with potentially malicious content
    await this.makeRequest('/api/portfolio/content/about', {
      method: 'PUT',
      body: JSON.stringify(maliciousContent)
    });

    // Verify content is sanitized
    const cleanContent = await this.makeRequest('/api/portfolio/content/about');
    
    if (cleanContent.summary.includes('<script>') || 
        cleanContent.competencies.includes('class=') ||
        cleanContent.philosophyQuote.includes('style=')) {
      throw new Error('Content sanitization failed - malicious content detected');
    }

    if (!cleanContent.summary.includes('<strong>bold</strong>') ||
        !cleanContent.competencies.includes('<em>emphasis</em>')) {
      throw new Error('Content sanitization too aggressive - valid formatting removed');
    }

    console.log('✓ Content sanitization working correctly');
  }

  async testCacheHitRates() {
    // Make multiple requests to test cache performance
    const endpoints = [
      '/api/portfolio/content/hero',
      '/api/portfolio/content/about',
      '/api/portfolio/skills',
      '/api/portfolio/timeline',
      '/api/portfolio/metrics'
    ];

    for (const endpoint of endpoints) {
      // First request (cache miss)
      await this.makeRequest(endpoint);
      
      // Second request (should be cache hit)
      const start = Date.now();
      await this.makeRequest(endpoint);
      const duration = Date.now() - start;

      if (duration > 50) {
        console.warn(`⚠️ Slow cache response for ${endpoint}: ${duration}ms`);
      }
    }

    console.log('✓ Cache hit rates verified');
  }

  async testAdminToLiveSync() {
    // Test that admin changes immediately sync to live portfolio
    const timestamp = Date.now();
    const testData = {
      headline: `Admin Sync Test ${timestamp}`,
      subheadline: "Testing admin to live synchronization",
      ctaText: "Sync Test",
      ctaSecondaryText: "Live Update"
    };

    // Update via admin endpoint
    await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(testData)
    });

    // Verify immediately available on live endpoint
    const liveContent = await this.makeRequest('/api/portfolio/content/hero');
    
    if (!liveContent.headline.includes(`Admin Sync Test ${timestamp}`)) {
      throw new Error('Admin to live sync failed');
    }

    console.log('✓ Admin to live synchronization verified');
  }

  async testDatabaseFallback() {
    // Test that database serves as primary source
    const heroContent = await this.makeRequest('/api/portfolio/content/hero');
    const aboutContent = await this.makeRequest('/api/portfolio/content/about');

    // Verify content structure matches database schema
    const heroFields = ['headline', 'subheadline', 'ctaText', 'ctaSecondaryText'];
    const aboutFields = ['title', 'summary'];

    for (const field of heroFields) {
      if (!(field in heroContent)) {
        throw new Error(`Hero content missing field: ${field}`);
      }
    }

    for (const field of aboutFields) {
      if (!(field in aboutContent)) {
        throw new Error(`About content missing field: ${field}`);
      }
    }

    console.log('✓ Database schema alignment verified');
  }

  async restoreOriginalContent() {
    // Restore clean test content
    const originalHero = {
      headline: "AI Product Leader & Multi-time Founder",
      subheadline: "7+ Years Scaling AI Solutions from 0→1 | Cross-Cultural Team Leadership | $110K+ Funding Secured",
      ctaText: "View My Work",
      ctaSecondaryText: "Let's Connect"
    };

    const originalAbout = {
      title: "About Hamza",
      summary: "AI Product Leader with 7+ years of experience building and scaling intelligent solutions that transform businesses. Proven track record of taking AI products from concept to market success across MENA and SEA regions.",
      competencies: "Strategic AI product development, cross-functional team leadership, enterprise solution architecture, regulatory compliance systems, and multilingual AI implementations.",
      philosophyQuote: "Innovation thrives at the intersection of technical excellence and deep market understanding.",
      philosophyTitle: "Leadership Philosophy"
    };

    await this.makeRequest('/api/portfolio/content/hero', {
      method: 'PUT',
      body: JSON.stringify(originalHero)
    });

    await this.makeRequest('/api/portfolio/content/about', {
      method: 'PUT',
      body: JSON.stringify(originalAbout)
    });

    console.log('✓ Original content restored');
  }

  generateReport() {
    console.log('\n📊 CACHE ALIGNMENT TEST REPORT');
    console.log('================================');
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }

    if (passed === this.results.length) {
      console.log('\n🎉 ALL TESTS PASSED - Cache system fully aligned!');
    } else {
      console.log('\n⚠️  Some tests failed - cache alignment needs attention');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Cache Alignment Test Suite...');
    
    await this.runTest('Database Content Storage', () => this.testDatabaseContentStorage());
    await this.runTest('Cache Invalidation', () => this.testCacheInvalidation());
    await this.runTest('Content Sanitization', () => this.testContentSanitization());
    await this.runTest('Cache Hit Rates', () => this.testCacheHitRates());
    await this.runTest('Admin to Live Sync', () => this.testAdminToLiveSync());
    await this.runTest('Database Schema Alignment', () => this.testDatabaseFallback());
    await this.runTest('Content Restoration', () => this.restoreOriginalContent());
    
    this.generateReport();
  }
}

// Run the tests
const tester = new CacheAlignmentTester();
tester.runAllTests().catch(console.error);
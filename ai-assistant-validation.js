import fetch from 'node-fetch';

class AIAssistantValidator {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.results = {};
  }

  async test(name, fn) {
    try {
      console.log(`Testing: ${name}`);
      const result = await fn();
      this.results[name] = { status: 'PASS', result };
      console.log(`✅ ${name}`);
      return result;
    } catch (error) {
      this.results[name] = { status: 'FAIL', error: error.message };
      console.log(`❌ ${name}: ${error.message}`);
      return null;
    }
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
  }

  async validateCore() {
    console.log('\n🔍 Core AI Assistant Validation\n');

    await this.test('Admin Login', async () => {
      return this.request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
    });

    await this.test('Knowledge Base Status', async () => {
      return this.request('/api/admin/knowledge-base/documents');
    });

    await this.test('AI Assistant Response', async () => {
      return this.request('/api/admin/ai-assistant', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Test AI integration',
          sessionType: 'career_assistant'
        })
      });
    });

    await this.test('Document Categories', async () => {
      return this.request('/api/admin/knowledge-base/categories');
    });

    await this.test('Knowledge Base Stats', async () => {
      return this.request('/api/admin/knowledge-base/stats');
    });

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Validation Results');
    console.log('===================');
    
    const passed = Object.values(this.results).filter(r => r.status === 'PASS').length;
    const failed = Object.values(this.results).filter(r => r.status === 'FAIL').length;
    
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    Object.entries(this.results).forEach(([name, result]) => {
      console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${name}`);
    });
  }
}

const validator = new AIAssistantValidator();
validator.validateCore().catch(console.error);
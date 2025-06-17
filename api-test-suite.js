/**
 * Comprehensive API Test Suite for AI Assistant
 * Tests Claude (primary) and Gemini (fallback) APIs systematically
 */

class AIAssistantAPITester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.cookies = null;
    this.testResults = {
      auth: false,
      upload: false,
      documents: false,
      claude: false,
      gemini: false,
      chat: false,
      errors: []
    };
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async test(name, fn) {
    try {
      this.log(`Testing ${name}...`);
      await fn();
      this.log(`✓ ${name} PASSED`);
      return true;
    } catch (error) {
      this.log(`✗ ${name} FAILED: ${error.message}`);
      this.testResults.errors.push(`${name}: ${error.message}`);
      return false;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.cookies && { 'Cookie': this.cookies }),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (options.expectJson !== false) {
      const data = await response.json();
      return { response, data };
    }
    
    return { response };
  }

  async testAuthentication() {
    const { response, data } = await this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    if (!data.success) {
      throw new Error('Login response indicates failure');
    }

    this.cookies = response.headers.get('set-cookie');
    if (!this.cookies) {
      throw new Error('No session cookie received');
    }

    this.testResults.auth = true;
  }

  async testDocumentUpload() {
    // Create test document
    const testContent = `Hamza El Essawy - AI Product Leader
    
Professional Summary:
- 5+ years experience in AI/ML product development
- Led cross-functional teams of 10+ engineers and data scientists
- Built AI-powered solutions serving 1M+ users
- Expert in machine learning model deployment and scaling

Key Achievements:
- Launched 3 successful AI products generating $5M+ ARR
- Reduced model inference latency by 60% through optimization
- Built recommendation system improving user engagement by 40%

Skills:
- Python, TensorFlow, PyTorch, Kubernetes
- Product Strategy, Team Leadership, Stakeholder Management
- A/B Testing, Data Analytics, User Research`;

    const formData = new FormData();
    const testFile = new File([testContent], 'hamza-resume.txt', { type: 'text/plain' });
    formData.append('files', testFile);
    formData.append('category', 'resume');

    const { response, data } = await this.request('/api/admin/knowledge-base/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type for FormData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} - ${data?.message || 'Unknown error'}`);
    }

    if (!data.success) {
      throw new Error(`Upload response indicates failure: ${data.message}`);
    }

    if (!data.uploadedDocuments || data.uploadedDocuments.length === 0) {
      throw new Error('No documents were successfully processed');
    }

    this.testResults.upload = true;
    this.testDocumentId = data.uploadedDocuments[0].id;
  }

  async testDocumentRetrieval() {
    const { response, data } = await this.request('/api/admin/knowledge-base/documents');

    if (!response.ok) {
      throw new Error(`Document retrieval failed: ${response.status}`);
    }

    if (!Array.isArray(data)) {
      throw new Error('Documents response is not an array');
    }

    const uploadedDoc = data.find(d => d.originalName === 'hamza-resume.txt');
    if (!uploadedDoc) {
      throw new Error('Uploaded document not found in retrieval');
    }

    if (uploadedDoc.status !== 'embedded' && uploadedDoc.status !== 'processed') {
      throw new Error(`Document status is ${uploadedDoc.status}, expected embedded or processed`);
    }

    this.testResults.documents = true;
  }

  async testClaudeAPI() {
    const { response, data } = await this.request('/api/admin/ai-assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test Claude API integration - respond with "Claude is working"',
        sessionType: 'test',
        forceModel: 'claude'
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API test failed: ${response.status} - ${data?.message || 'Unknown error'}`);
    }

    if (!data.response) {
      throw new Error('No response content from Claude API');
    }

    if (!data.response.toLowerCase().includes('claude')) {
      throw new Error('Claude API response does not confirm it is working');
    }

    this.testResults.claude = true;
  }

  async testGeminiAPI() {
    const { response, data } = await this.request('/api/admin/ai-assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test Gemini API integration - respond with "Gemini is working"',
        sessionType: 'test',
        forceModel: 'gemini'
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API test failed: ${response.status} - ${data?.message || 'Unknown error'}`);
    }

    if (!data.response) {
      throw new Error('No response content from Gemini API');
    }

    this.testResults.gemini = true;
  }

  async testAIChatWithKnowledgeBase() {
    const { response, data } = await this.request('/api/admin/ai-assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What do you know about my AI and machine learning experience from my resume?',
        sessionType: 'career_assistant'
      })
    });

    if (!response.ok) {
      throw new Error(`AI Chat failed: ${response.status} - ${data?.message || 'Unknown error'}`);
    }

    if (!data.response) {
      throw new Error('No response content from AI chat');
    }

    if (data.response.length < 50) {
      throw new Error('AI response is too short, likely not using knowledge base');
    }

    // Check if response mentions AI/ML context
    const responseText = data.response.toLowerCase();
    if (!responseText.includes('ai') && !responseText.includes('machine learning') && !responseText.includes('product')) {
      throw new Error('AI response does not seem to reference uploaded resume content');
    }

    this.testResults.chat = true;
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive AI Assistant API Test Suite\n');

    await this.test('Authentication', () => this.testAuthentication());
    await this.test('Document Upload', () => this.testDocumentUpload());
    await this.test('Document Retrieval', () => this.testDocumentRetrieval());
    await this.test('Claude API', () => this.testClaudeAPI());
    await this.test('Gemini API Fallback', () => this.testGeminiAPI());
    await this.test('AI Chat with Knowledge Base', () => this.testAIChatWithKnowledgeBase());

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const tests = [
      ['Authentication', this.testResults.auth],
      ['Document Upload', this.testResults.upload],
      ['Document Retrieval', this.testResults.documents],
      ['Claude API', this.testResults.claude],
      ['Gemini API', this.testResults.gemini],
      ['AI Chat Integration', this.testResults.chat]
    ];

    tests.forEach(([name, passed]) => {
      console.log(`${passed ? '✓' : '✗'} ${name}`);
    });

    const passedCount = tests.filter(([_, passed]) => passed).length;
    const totalCount = tests.length;

    console.log(`\nOverall: ${passedCount}/${totalCount} tests passed`);

    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 Error Details:');
      this.testResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    if (passedCount === totalCount) {
      console.log('\n🎉 All tests passed! AI Assistant is fully functional.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run the test suite
const tester = new AIAssistantAPITester();
tester.runAllTests().catch(error => {
  console.error('Test suite failed to run:', error);
});
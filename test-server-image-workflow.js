/**
 * Server-side Image Upload Workflow Test
 * Tests backend functionality with curl commands to identify exact failure points
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ServerImageWorkflowTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = [];
    this.tempImageId = null;
    this.caseStudyId = null;
    this.cookieFile = '/tmp/test_cookies.txt';
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  executeCommand(command, description) {
    this.log(`Testing: ${description}`);
    this.log(`Command: ${command}`);
    
    try {
      const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
      this.log(`✅ SUCCESS: ${description}`);
      this.log(`Response: ${result.substring(0, 200)}...`);
      this.results.push({ test: description, status: 'PASS', response: result });
      return result;
    } catch (error) {
      this.log(`❌ FAILED: ${description}`);
      this.log(`Error: ${error.message}`);
      this.results.push({ test: description, status: 'FAIL', error: error.message });
      throw error;
    }
  }

  testLogin() {
    const command = `curl -s -X POST "${this.baseUrl}/api/admin/login" \\
      -H "Content-Type: application/json" \\
      -d '{"username": "admin", "password": "admin123"}' \\
      -c ${this.cookieFile}`;
    
    const response = this.executeCommand(command, 'Admin Login');
    const data = JSON.parse(response);
    
    if (!data.success) {
      throw new Error('Login failed');
    }
    
    return data;
  }

  testTempImageUpload() {
    // Create a test file
    const testFile = '/tmp/test_image.png';
    fs.writeFileSync(testFile, 'test image content');
    
    const command = `curl -s -X POST "${this.baseUrl}/api/admin/portfolio-images/case-study/temp" \\
      -H "Content-Type: multipart/form-data" \\
      -F "image=@${testFile}" \\
      -F "altText=Server Test Image" \\
      -b ${this.cookieFile}`;
    
    const response = this.executeCommand(command, 'Temporary Image Upload');
    const data = JSON.parse(response);
    
    if (!data.tempId) {
      throw new Error('No tempId returned from image upload');
    }
    
    this.tempImageId = data.tempId;
    this.log(`Stored tempImageId: ${this.tempImageId}`);
    return data;
  }

  testCaseStudyCreation() {
    if (!this.tempImageId) {
      throw new Error('No tempImageId available for case study creation');
    }

    const caseStudyData = {
      title: 'Server Test Case Study',
      subtitle: 'Testing backend integration',
      challenge: 'Backend test challenge',
      approach: 'Backend test approach',
      solution: 'Backend test solution',
      impact: 'Backend test impact',
      tempImageId: this.tempImageId
    };

    const command = `curl -s -X POST "${this.baseUrl}/api/admin/case-studies" \\
      -H "Content-Type: application/json" \\
      -b ${this.cookieFile} \\
      -d '${JSON.stringify(caseStudyData)}'`;
    
    const response = this.executeCommand(command, 'Case Study Creation with Temp Image');
    const data = JSON.parse(response);
    
    if (!data.id) {
      throw new Error('No case study ID returned');
    }
    
    this.caseStudyId = data.id;
    this.log(`Created case study with ID: ${this.caseStudyId}`);
    return data;
  }

  testImageAssociation() {
    if (!this.caseStudyId) {
      throw new Error('No case study ID available');
    }

    // Wait a moment for association to complete
    this.log('Waiting 2 seconds for image association...');
    execSync('sleep 2');

    const command = `curl -s -X GET "${this.baseUrl}/api/portfolio/images/case-study/${this.caseStudyId}" \\
      -H "Content-Type: application/json"`;
    
    const response = this.executeCommand(command, 'Image Association Verification');
    const data = JSON.parse(response);
    
    this.log(`Found ${data.length} images for case study ${this.caseStudyId}`);
    
    if (data.length === 0) {
      throw new Error('No images found - temporary image association failed');
    }

    if (data[0].altText !== 'Server Test Image') {
      throw new Error(`Alt text mismatch. Expected: "Server Test Image", Got: "${data[0].altText}"`);
    }

    return data[0];
  }

  testCaseStudyRetrieval() {
    if (!this.caseStudyId) {
      throw new Error('No case study ID available');
    }

    const command = `curl -s -X GET "${this.baseUrl}/api/admin/case-studies" \\
      -b ${this.cookieFile}`;
    
    const response = this.executeCommand(command, 'Case Study List Retrieval');
    const data = JSON.parse(response);
    
    const createdCaseStudy = data.find(cs => cs.id === this.caseStudyId);
    if (!createdCaseStudy) {
      throw new Error(`Created case study ${this.caseStudyId} not found in list`);
    }

    return createdCaseStudy;
  }

  testImageFileAccess() {
    if (!this.caseStudyId) {
      throw new Error('No case study ID available');
    }

    // First get the image data
    const imagesResponse = execSync(`curl -s -X GET "${this.baseUrl}/api/portfolio/images/case-study/${this.caseStudyId}"`);
    const images = JSON.parse(imagesResponse);
    
    if (images.length === 0) {
      throw new Error('No images available for file access test');
    }

    const imageUrl = images[0].imageUrl;
    
    const command = `curl -s -I "${this.baseUrl}${imageUrl}"`;
    
    const response = this.executeCommand(command, 'Image File Access Test');
    
    if (!response.includes('200 OK') && !response.includes('304 Not Modified')) {
      throw new Error(`Image file not accessible at ${imageUrl}`);
    }

    return { imageUrl, accessible: true };
  }

  async runCompleteTest() {
    this.log('🚀 Starting Server-side Image Upload Workflow Test');
    
    try {
      this.testLogin();
      this.testTempImageUpload();
      this.testCaseStudyCreation();
      this.testImageAssociation();
      this.testCaseStudyRetrieval();
      this.testImageFileAccess();
      
      this.generateReport();
      
    } catch (error) {
      this.log(`❌ Test workflow failed: ${error.message}`);
      this.generateReport();
      throw error;
    } finally {
      this.cleanup();
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SERVER IMAGE UPLOAD WORKFLOW TEST REPORT');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${total ? Math.round((passed / total) * 100) : 0}%`);

    console.log('\n📋 Test Results:');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${status} ${result.test}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    if (this.tempImageId || this.caseStudyId) {
      console.log(`\n🔍 Debug Information:`);
      if (this.tempImageId) console.log(`   Temp Image ID: ${this.tempImageId}`);
      if (this.caseStudyId) console.log(`   Case Study ID: ${this.caseStudyId}`);
    }

    console.log('\n' + '='.repeat(60));

    // Identify failure pattern
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('\n🔍 FAILURE ANALYSIS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.error}`);
      });
    }
  }

  cleanup() {
    if (this.caseStudyId) {
      try {
        const command = `curl -s -X DELETE "${this.baseUrl}/api/admin/case-studies/${this.caseStudyId}" -b ${this.cookieFile}`;
        execSync(command);
        this.log(`🧹 Cleaned up test case study ${this.caseStudyId}`);
      } catch (error) {
        this.log(`⚠️ Failed to clean up: ${error.message}`);
      }
    }

    // Remove cookie file
    try {
      fs.unlinkSync(this.cookieFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Run the test
const tester = new ServerImageWorkflowTester();
tester.runCompleteTest().then(() => {
  console.log('\nServer test completed successfully.');
  process.exit(0);
}).catch((error) => {
  console.error('\nServer test failed.');
  process.exit(1);
});
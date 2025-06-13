/**
 * Image Update Debug Test
 * Tests the exact image update flow to identify the error
 */

class ImageUpdateTester {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.results = {
      passed: [],
      failed: [],
      errors: []
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Request failed: ${response.status} ${response.statusText}`);
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  async testGetImages() {
    console.log('\n=== TESTING GET IMAGES ===');
    try {
      const images = await this.makeRequest('/api/admin/portfolio-images');
      console.log('Images retrieved:', images);
      this.results.passed.push('Images retrieval working');
      return images;
    } catch (error) {
      console.error('Get images failed:', error);
      this.results.failed.push(`Get images failed: ${error.message}`);
      return [];
    }
  }

  async testUpdateImage(imageId, updateData) {
    console.log(`\n=== TESTING UPDATE IMAGE ${imageId} ===`);
    console.log('Update data:', updateData);
    
    try {
      const result = await this.makeRequest(`/api/admin/portfolio-images/${imageId}`, 'PUT', updateData);
      console.log('Update successful:', result);
      this.results.passed.push(`Image ${imageId} updated successfully`);
      return result;
    } catch (error) {
      console.error('Update failed:', error);
      this.results.failed.push(`Image update failed: ${error.message}`);
      this.results.errors.push({
        imageId,
        updateData,
        error: error.message
      });
      return null;
    }
  }

  async testCreateImage(imageData) {
    console.log('\n=== TESTING CREATE IMAGE ===');
    console.log('Image data:', imageData);
    
    try {
      const result = await this.makeRequest('/api/admin/portfolio-images', 'POST', imageData);
      console.log('Create successful:', result);
      this.results.passed.push('Image created successfully');
      return result;
    } catch (error) {
      console.error('Create failed:', error);
      this.results.failed.push(`Image create failed: ${error.message}`);
      return null;
    }
  }

  async runFullTest() {
    console.log('🔍 Starting comprehensive image update test...\n');

    // Test 1: Get existing images
    const images = await this.testGetImages();

    if (images.length > 0) {
      const testImage = images[0];
      console.log('Testing with existing image:', testImage);

      // Test 2: Update existing image with minimal data
      const minimalUpdate = {
        section: testImage.section,
        imageUrl: testImage.imageUrl,
        altText: testImage.altText || 'Test alt text',
        isActive: testImage.isActive
      };
      
      await this.testUpdateImage(testImage.id, minimalUpdate);

      // Test 3: Update with complete data
      const completeUpdate = {
        section: testImage.section,
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlc3Q8L3RleHQ+PC9zdmc+',
        altText: 'Test updated image',
        caption: 'Test caption updated',
        orderIndex: 1,
        isActive: true
      };
      
      await this.testUpdateImage(testImage.id, completeUpdate);
    }

    // Test 4: Create new image
    const newImageData = {
      section: 'hero',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5ldzwvdGV4dD48L3N2Zz4=',
      altText: 'New test image',
      caption: 'New test caption',
      orderIndex: 2,
      isActive: true
    };
    
    await this.testCreateImage(newImageData);

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 IMAGE UPDATE TEST RESULTS');
    console.log('='.repeat(50));
    
    console.log('\n✅ PASSED:');
    this.results.passed.forEach(item => console.log(`  - ${item}`));
    
    console.log('\n❌ FAILED:');
    this.results.failed.forEach(item => console.log(`  - ${item}`));
    
    if (this.results.errors.length > 0) {
      console.log('\n🐛 DETAILED ERRORS:');
      this.results.errors.forEach(error => {
        console.log(`  Image ID: ${error.imageId}`);
        console.log(`  Data: ${JSON.stringify(error.updateData, null, 2)}`);
        console.log(`  Error: ${error.error}`);
        console.log('  ---');
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the test
const tester = new ImageUpdateTester();
tester.runFullTest().catch(console.error);
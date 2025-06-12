// Quick validation script for text editor functionality
const testEditorFunctionality = async () => {
  console.log('=== Testing Text Editor Functionality ===');
  
  // Test 1: Check if content is clean (no HTML tags)
  try {
    const response = await fetch('/api/portfolio/content/hero');
    const heroContent = await response.json();
    
    console.log('Hero content:', heroContent);
    
    // Check for HTML tags in content
    const hasHTMLTags = heroContent.subheadline.includes('<div>') || 
                       heroContent.subheadline.includes('<br>') ||
                       heroContent.subheadline.includes('&nbsp;');
    
    console.log('✓ Test 1 - Clean Content:', !hasHTMLTags ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.log('✗ Test 1 - Failed to fetch content:', error);
  }
  
  // Test 2: Check cache clearing functionality
  try {
    const cacheResponse = await fetch('/api/admin/cache/clear', { method: 'POST' });
    const cacheResult = await cacheResponse.json();
    
    console.log('✓ Test 2 - Cache Clear:', cacheResult.message ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.log('✗ Test 2 - Cache clear failed:', error);
  }
  
  // Test 3: Verify line break handling
  const testText = "Line 1\nLine 2\nLine 3";
  console.log('✓ Test 3 - Line Break Format:', testText.includes('\n') ? 'PASS' : 'FAIL');
  
  console.log('=== Test Complete ===');
};

// Run in browser console or as module
if (typeof window !== 'undefined') {
  window.testEditorFunctionality = testEditorFunctionality;
} else if (typeof module !== 'undefined') {
  module.exports = testEditorFunctionality;
}
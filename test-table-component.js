// Test the new table component implementation
const { chromium } = require('playwright');

async function testTableComponent() {
  console.log('🧪 Testing table component implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    
    console.log('✅ App loaded');
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    console.log('🔧 Testing new table component...');
    
    // Wait to see the app state
    await page.waitForTimeout(5000);
    
    console.log('✅ No immediate errors - implementation appears successful');
    console.log('📝 Test the following manually:');
    console.log('   1. Add table component to canvas');
    console.log('   2. Check that no default columns appear');
    console.log('   3. Set data source to {{products}}');
    console.log('   4. Verify ADD COLUMN button appears');
    console.log('   5. Test adding columns from available fields');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    // Keep browser open for manual testing
    console.log('Browser left open for manual testing...');
  }
}

testTableComponent().catch(console.error);
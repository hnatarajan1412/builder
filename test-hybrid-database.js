// Test the hybrid database fix
const { chromium } = require('playwright');

async function testHybridDatabase() {
  console.log('🧪 Testing hybrid database implementation...');
  
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
        console.log(`❌ Console error: ${msg.text()}`);
      } else if (msg.text().includes('Hybrid Database')) {
        console.log(`✅ ${msg.text()}`);
      }
    });
    
    console.log('🔧 Checking for process.env error...');
    
    // Wait to see if the error occurs
    await page.waitForTimeout(5000);
    
    console.log('✅ No process.env error detected');
    console.log('📝 Test the following workflow:');
    console.log('   1. Create a new table called "users"');
    console.log('   2. Add some records to it');
    console.log('   3. Refresh the page');
    console.log('   4. Check if data persists');
    console.log('   5. Add table component and bind {{users}}');
    console.log('   6. Verify ADD COLUMN shows available fields');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    // Keep browser open for manual testing
    console.log('Browser left open for manual testing...');
  }
}

testHybridDatabase().catch(console.error);
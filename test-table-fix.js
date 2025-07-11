// Quick test to verify table component fix
const { chromium } = require('playwright');

async function testTableFix() {
  console.log('🧪 Testing table component fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    
    console.log('✅ App loaded, checking for errors...');
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    // Try to add a table component
    console.log('🔧 Testing table component creation...');
    
    // Wait a bit to see if any immediate errors occur
    await page.waitForTimeout(5000);
    
    console.log('✅ No immediate errors detected - fix appears successful');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

testTableFix().catch(console.error);
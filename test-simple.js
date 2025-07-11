const { chromium } = require('playwright');

async function simpleTest() {
  console.log('🧪 Simple UI Test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');
    
    // Take a screenshot
    await page.screenshot({ path: 'current-state.png' });
    console.log('📸 Screenshot saved as current-state.png');
    
    // Look for any buttons in the header
    const headerButtons = await page.locator('header button').all();
    console.log(`\n📍 Found ${headerButtons.length} buttons in header:`);
    
    for (let i = 0; i < headerButtons.length; i++) {
      const button = headerButtons[i];
      const title = await button.getAttribute('title');
      const text = await button.innerText();
      console.log(`  Button ${i + 1}: title="${title || 'none'}", text="${text || 'none'}"`);
    }
    
    // Check for the database icon specifically
    console.log('\n🔍 Looking for Database functionality...');
    
    // Try different ways to find it
    const possibleSelectors = [
      'button[title*="Database"]',
      'button[title*="database"]',
      'button:has(svg path[d*="M4 7h16M4"])', // Database icon path
      'button:has-text("Database")',
      '.lucide-database',
      '[data-testid*="database"]'
    ];
    
    for (const selector of possibleSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`✅ Found ${elements} element(s) with selector: ${selector}`);
      }
    }
    
    console.log('\n💡 Please check the browser window to see the current UI state');
    console.log('   If you don\'t see Database features, try:');
    console.log('   1. Hard refresh (Ctrl+Shift+R)');
    console.log('   2. Clear cache and cookies');
    console.log('   3. Check browser console for errors');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Keep browser open
  await page.waitForTimeout(60000);
  await browser.close();
}

simpleTest().catch(console.error);
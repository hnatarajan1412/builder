const { chromium } = require('playwright');

async function testDatabaseFeatures() {
  console.log('🧪 Testing Database Features...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    
    console.log('✅ App loaded');
    
    // Listen for console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });

    // First, create or select an app
    const noAppMessage = page.locator('text="No app selected"');
    if (await noAppMessage.isVisible()) {
      console.log('📱 No app selected, creating one...');
      const selectAppButton = page.locator('button:has-text("Select or Create App")');
      await selectAppButton.click();
      await page.waitForTimeout(1000);
      
      // Create new app if needed
      const createAppButton = page.locator('button:has-text("Create New App")');
      if (await createAppButton.isVisible()) {
        await createAppButton.click();
        await page.fill('input[placeholder*="app name"]', 'Test App');
        await page.fill('textarea', 'Test app for database features');
        await page.click('button:has-text("Create App")');
        await page.waitForTimeout(2000);
      }
    }

    // Try clicking the Database icon in the side panel navigation
    console.log('📊 Opening Database panel...');
    
    // Look for database icon in the header navigation
    const databaseIcons = page.locator('svg').filter({ hasText: '' });
    let databaseButton = null;
    
    // Try different selectors
    const selectors = [
      'button[title="Database"]',
      'button:has(svg.lucide-database)',
      'button:has-text("Database")',
      'div:has-text("Database")',
      '[data-testid="database-button"]'
    ];
    
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        databaseButton = element;
        console.log(`Found database button with selector: ${selector}`);
        break;
      }
    }
    
    // If not found, try by icon
    if (!databaseButton) {
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const svgs = await button.locator('svg').count();
        if (svgs > 0) {
          const title = await button.getAttribute('title');
          if (title && title.toLowerCase().includes('database')) {
            databaseButton = button;
            console.log('Found database button by title attribute');
            break;
          }
        }
      }
    }
    
    if (databaseButton) {
      await databaseButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked database button');
    } else {
      console.log('❌ Could not find database button');
      console.log('Available buttons:');
      const allButtons = await page.locator('button').all();
      for (const button of allButtons) {
        const text = await button.innerText();
        const title = await button.getAttribute('title');
        if (text || title) {
          console.log(`  - Button: text="${text}", title="${title}"`);
        }
      }
    }

    // Check if database panel opened
    const createTableButton = page.locator('button:has-text("Create Table")');
    if (await createTableButton.count() > 0) {
      console.log('✅ Database panel is open');
      
      // Test table creation
      console.log('\n📝 Testing table creation...');
      await createTableButton.click();
      await page.waitForTimeout(1000);
      
      // Check Create Table dialog
      const dialog = page.locator('text="Create New Table"');
      if (await dialog.isVisible()) {
        console.log('✅ Create Table dialog opened');
        
        // Test 1: Check ID field
        console.log('\n🔍 Test 1: Checking ID field enforcement...');
        const idFieldInput = page.locator('input[value="id"]').first();
        if (await idFieldInput.count() > 0) {
          console.log('✅ ID field exists');
          
          const isDisabled = await idFieldInput.isDisabled();
          console.log(`ID field disabled: ${isDisabled} ${isDisabled ? '✅' : '❌'}`);
          
          // Check ID field type
          const selects = await page.locator('select').all();
          if (selects.length > 0) {
            const firstSelectValue = await selects[0].inputValue();
            console.log(`ID field type: ${firstSelectValue} ${firstSelectValue === 'uuid' ? '✅' : '❌'}`);
          }
        } else {
          console.log('❌ ID field not found');
        }
        
        // Test 2: Check geolocation field type
        console.log('\n🌍 Test 2: Checking geolocation field type...');
        await page.click('button:has-text("Add Field")');
        await page.waitForTimeout(500);
        
        const lastSelect = page.locator('select').last();
        await lastSelect.click();
        
        // Get all options
        const options = await lastSelect.locator('option').allTextContents();
        console.log('Available field types:', options.join(', '));
        
        if (options.includes('geolocation')) {
          console.log('✅ Geolocation field type is available');
        } else {
          console.log('❌ Geolocation field type NOT found');
        }
        
        // Close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Test 3: Check Relationships tab
      console.log('\n🔗 Test 3: Checking Relationships tab...');
      const relationshipsTab = page.locator('button:has-text("Relationships")').or(page.locator('text="Relationships"'));
      if (await relationshipsTab.count() > 0) {
        console.log('✅ Relationships tab exists');
        await relationshipsTab.first().click();
        await page.waitForTimeout(1000);
        
        const createRelButton = page.locator('button:has-text("Create Relationship")');
        if (await createRelButton.isVisible()) {
          console.log('✅ Create Relationship button found');
        } else {
          console.log('❌ Create Relationship button not found');
        }
      } else {
        console.log('❌ Relationships tab not found');
      }
    } else {
      console.log('❌ Database panel did not open - Create Table button not found');
    }
    
    // Summary
    console.log('\n📊 FEATURE CHECK SUMMARY:');
    console.log('Run the test and check the output above for:');
    console.log('1. ✅/❌ ID field enforcement (should be disabled and UUID type)');
    console.log('2. ✅/❌ Geolocation field type availability');
    console.log('3. ✅/❌ Relationships management tab');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n🔍 Browser will stay open for manual inspection...');
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

testDatabaseFeatures().catch(console.error);
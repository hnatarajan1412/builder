const { chromium } = require('playwright');

async function finalDatabaseTest() {
  console.log('🔍 Final Database Features Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    console.log('1️⃣ Loading application...');
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    console.log('✅ Application loaded\n');
    
    // Handle app selector modal if it appears
    const modalVisible = await page.locator('[role="dialog"]').isVisible();
    if (modalVisible) {
      console.log('2️⃣ App selector modal is open');
      
      // Look for Create New App button in the modal
      const createAppBtn = page.locator('[role="dialog"] button:has-text("Create New App")');
      if (await createAppBtn.isVisible()) {
        console.log('   Creating new app...');
        await createAppBtn.click();
        await page.waitForTimeout(500);
        
        // Fill in app details
        await page.fill('input[placeholder*="name"]', 'DB Test App');
        await page.fill('textarea', 'Testing database features');
        
        // Find and click the create button
        const createBtn = page.locator('button:has-text("Create App")').last();
        await createBtn.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ App created\n');
      }
    }
    
    // Now test the database features
    console.log('3️⃣ Opening Database panel...');
    
    // Take a screenshot to see current state
    await page.screenshot({ path: 'before-database-click.png' });
    console.log('   📸 Screenshot saved: before-database-click.png');
    
    // List all visible buttons in header to debug
    const headerButtons = await page.locator('header button[title]').all();
    console.log(`   Found ${headerButtons.length} buttons with titles in header:`);
    
    for (const button of headerButtons) {
      const title = await button.getAttribute('title');
      console.log(`   - "${title}"`);
    }
    
    // Try to find and click Database button
    const databaseBtn = page.locator('button[title="Database"]');
    if (await databaseBtn.count() > 0) {
      console.log('\n   ✅ Database button found!');
      await databaseBtn.click();
      await page.waitForTimeout(1500);
      
      // Take screenshot after click
      await page.screenshot({ path: 'after-database-click.png' });
      console.log('   📸 Screenshot saved: after-database-click.png');
      
      // Check if panel opened
      const createTableBtn = page.locator('button:has-text("Create Table")');
      if (await createTableBtn.isVisible()) {
        console.log('   ✅ Database panel opened successfully\n');
        
        // TEST: Create table and check features
        console.log('4️⃣ Testing table creation features...');
        await createTableBtn.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of create table dialog
        await page.screenshot({ path: 'create-table-dialog.png' });
        console.log('   📸 Screenshot saved: create-table-dialog.png');
        
        // Check for features
        console.log('\n   🔍 Checking implemented features:');
        
        // 1. ID field
        const idField = await page.locator('input[value="id"]').count();
        console.log(`   1. ID field exists: ${idField > 0 ? '✅' : '❌'}`);
        
        if (idField > 0) {
          const idInput = page.locator('input[value="id"]').first();
          const disabled = await idInput.isDisabled();
          console.log(`      - ID field is read-only: ${disabled ? '✅' : '❌'}`);
          
          const typeSelect = page.locator('select').first();
          const typeValue = await typeSelect.inputValue();
          console.log(`      - ID field type is UUID: ${typeValue === 'uuid' ? '✅' : '❌'} (actual: ${typeValue})`);
        }
        
        // 2. Field types
        await page.click('button:has-text("Add Field")');
        await page.waitForTimeout(500);
        
        const lastSelect = page.locator('select').last();
        const options = await lastSelect.locator('option').allTextContents();
        console.log(`\n   2. Available field types: ${options.join(', ')}`);
        console.log(`      - Has geolocation: ${options.includes('geolocation') ? '✅' : '❌'}`);
        
        // Close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // 3. Relationships tab
        console.log('\n   3. Checking Relationships tab...');
        const relTab = page.locator('button:has-text("Relationships")');
        if (await relTab.count() > 0) {
          console.log('      - Relationships tab exists: ✅');
          await relTab.click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ path: 'relationships-tab.png' });
          console.log('   📸 Screenshot saved: relationships-tab.png');
          
          const createRelBtn = page.locator('button:has-text("Create Relationship")');
          console.log(`      - Create Relationship button: ${await createRelBtn.isVisible() ? '✅' : '❌'}`);
        } else {
          console.log('      - Relationships tab exists: ❌');
        }
        
      } else {
        console.log('   ❌ Database panel did not open');
      }
    } else {
      console.log('   ❌ Database button NOT found in header');
    }
    
    console.log('\n📊 TEST COMPLETE');
    console.log('Check the screenshots for visual confirmation:');
    console.log('- before-database-click.png');
    console.log('- after-database-click.png');
    console.log('- create-table-dialog.png');
    console.log('- relationships-tab.png');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'error-state.png' });
    console.log('📸 Error screenshot saved: error-state.png');
  }
  
  console.log('\n⏳ Browser will remain open for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
}

finalDatabaseTest().catch(console.error);
const { chromium } = require('playwright');

async function verifyDatabaseFeatures() {
  console.log('🔍 Verifying Database Features Implementation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    console.log('1️⃣ Loading application...');
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    console.log('✅ Application loaded\n');
    
    // First ensure we have an app
    const noAppSelected = await page.locator('text="No app selected"').isVisible();
    if (noAppSelected) {
      console.log('2️⃣ Creating test app...');
      await page.click('button:has-text("Select or Create App")');
      await page.waitForTimeout(1000);
      
      // Try to create new app
      const createNewApp = page.locator('button:has-text("Create New App")');
      if (await createNewApp.isVisible()) {
        await createNewApp.click();
        await page.fill('input[placeholder*="name"]', 'Database Test App');
        await page.fill('textarea', 'Testing database features');
        await page.click('button:has-text("Create App")');
        await page.waitForTimeout(2000);
        console.log('✅ Test app created\n');
      }
    }
    
    // Now look for the Database icon
    console.log('3️⃣ Looking for Database panel...');
    
    // The Database icon should be in the header
    const databaseButton = page.locator('button[title="Database"]');
    const databaseButtonCount = await databaseButton.count();
    
    if (databaseButtonCount > 0) {
      console.log('✅ Found Database button in header');
      await databaseButton.click();
      await page.waitForTimeout(1500);
      
      // Check if side panel opened
      const sidePanelVisible = await page.locator('text="Database"').nth(1).isVisible();
      if (sidePanelVisible) {
        console.log('✅ Database side panel opened\n');
        
        // TEST 1: Create Table and check ID field
        console.log('4️⃣ TEST 1: ID Field Enforcement');
        console.log('   Creating a new table...');
        
        const createTableBtn = page.locator('button:has-text("Create Table")');
        if (await createTableBtn.isVisible()) {
          await createTableBtn.click();
          await page.waitForTimeout(1000);
          
          // Check ID field
          const idInput = page.locator('input[value="id"]');
          if (await idInput.count() > 0) {
            const isDisabled = await idInput.isDisabled();
            console.log(`   ✅ ID field exists and is ${isDisabled ? 'read-only' : 'NOT read-only'} ${isDisabled ? '✅' : '❌'}`);
            
            // Check type
            const firstSelect = page.locator('select').first();
            const idType = await firstSelect.inputValue();
            console.log(`   ✅ ID field type is: ${idType} ${idType === 'uuid' ? '✅' : '❌'}`);
          } else {
            console.log('   ❌ ID field not found in table creation');
          }
          
          // TEST 2: Geolocation field type
          console.log('\n5️⃣ TEST 2: Geolocation Field Type');
          console.log('   Adding a new field...');
          
          await page.click('button:has-text("Add Field")');
          await page.waitForTimeout(500);
          
          const lastSelect = page.locator('select').last();
          const options = await lastSelect.locator('option').allTextContents();
          console.log(`   Available field types: ${options.join(', ')}`);
          
          if (options.includes('geolocation')) {
            console.log('   ✅ Geolocation field type IS available!');
          } else {
            console.log('   ❌ Geolocation field type NOT found');
          }
          
          // Close dialog
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
        // TEST 3: Relationships Tab
        console.log('\n6️⃣ TEST 3: Relationships Management');
        const relationshipsTab = page.locator('button:has-text("Relationships")').or(page.locator('text="Relationships"'));
        
        if (await relationshipsTab.count() > 0) {
          console.log('   ✅ Relationships tab found');
          await relationshipsTab.first().click();
          await page.waitForTimeout(1000);
          
          const createRelBtn = page.locator('button:has-text("Create Relationship")');
          if (await createRelBtn.isVisible()) {
            console.log('   ✅ Create Relationship button is visible');
            
            // Test the dialog
            await createRelBtn.click();
            await page.waitForTimeout(500);
            
            const relDialog = page.locator('text="Create Table Relationship"');
            if (await relDialog.isVisible()) {
              console.log('   ✅ Relationship creation dialog works');
              
              // Check relationship types
              const oneToMany = await page.locator('text="One to Many"').isVisible();
              const manyToOne = await page.locator('text="Many to One"').isVisible(); 
              const manyToMany = await page.locator('text="Many to Many"').isVisible();
              
              console.log(`   ✅ Relationship types available:`);
              console.log(`      - One to Many: ${oneToMany ? '✅' : '❌'}`);
              console.log(`      - Many to One: ${manyToOne ? '✅' : '❌'}`);
              console.log(`      - Many to Many: ${manyToMany ? '✅' : '❌'}`);
            }
          }
        } else {
          console.log('   ❌ Relationships tab NOT found');
        }
        
      } else {
        console.log('❌ Database panel did not open properly');
      }
    } else {
      console.log('❌ Database button not found in header');
      console.log('   Looking for alternative ways to access database...');
      
      // List all buttons in header
      const headerButtons = await page.locator('header button').all();
      console.log(`   Found ${headerButtons.length} buttons in header:`);
      for (let i = 0; i < Math.min(headerButtons.length, 10); i++) {
        const btn = headerButtons[i];
        const title = await btn.getAttribute('title');
        const text = await btn.innerText();
        console.log(`   - Button ${i+1}: title="${title}", text="${text}"`);
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('Check the output above for ✅ and ❌ marks');
    console.log('\n💡 If features are missing:');
    console.log('1. Try a hard browser refresh (Ctrl+Shift+R)');
    console.log('2. Clear browser cache completely');
    console.log('3. Check browser DevTools console for errors');
    console.log('4. Ensure the correct branch is checked out');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
  
  console.log('\n⏳ Browser will remain open for 60 seconds for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
}

verifyDatabaseFeatures().catch(console.error);
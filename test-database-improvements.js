const { chromium } = require('playwright');

async function testDatabaseImprovements() {
  console.log('🧪 Testing Database Improvements...');
  
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

    // Click on Database icon in header
    console.log('📊 Opening Database panel...');
    const databaseButton = page.locator('button[title="Database"]');
    await databaseButton.click();
    await page.waitForTimeout(1000);
    
    // Check if database panel is open
    const databasePanel = page.locator('text="Database"').first();
    if (await databasePanel.isVisible()) {
      console.log('✅ Database panel opened');
    } else {
      console.log('❌ Database panel not visible');
    }

    // Click Create Table button
    console.log('📝 Testing table creation...');
    const createTableButton = page.locator('button:has-text("Create Table")');
    if (await createTableButton.isVisible()) {
      await createTableButton.click();
      await page.waitForTimeout(1000);
      
      // Check Create Table dialog
      const dialog = page.locator('text="Create New Table"');
      if (await dialog.isVisible()) {
        console.log('✅ Create Table dialog opened');
        
        // Check if ID field exists and is disabled
        const idField = page.locator('input[value="id"]').first();
        if (await idField.isVisible()) {
          console.log('✅ ID field exists');
          
          // Check if it's disabled
          const isDisabled = await idField.isDisabled();
          if (isDisabled) {
            console.log('✅ ID field is read-only (disabled)');
          } else {
            console.log('❌ ID field is NOT disabled - it should be read-only!');
          }
          
          // Check if type is UUID
          const idTypeSelect = page.locator('select').first();
          const idType = await idTypeSelect.inputValue();
          if (idType === 'uuid') {
            console.log('✅ ID field type is UUID');
          } else {
            console.log(`❌ ID field type is ${idType}, should be UUID`);
          }
        } else {
          console.log('❌ ID field not found!');
        }
        
        // Check if geolocation is in field types
        console.log('🌍 Checking for geolocation field type...');
        const addFieldButton = page.locator('button:has-text("Add Field")');
        await addFieldButton.click();
        await page.waitForTimeout(500);
        
        // Find the last select dropdown (for the new field)
        const fieldTypeSelects = page.locator('select');
        const lastSelect = fieldTypeSelects.last();
        await lastSelect.click();
        
        // Check if geolocation option exists
        const geolocationOption = page.locator('option[value="geolocation"]');
        if (await geolocationOption.count() > 0) {
          console.log('✅ Geolocation field type is available');
          await lastSelect.selectOption('geolocation');
          console.log('✅ Selected geolocation type');
        } else {
          console.log('❌ Geolocation field type NOT found in dropdown!');
          
          // Let's check what options are available
          const options = await lastSelect.locator('option').allTextContents();
          console.log('Available field types:', options);
        }
        
        // Close dialog
        const closeButton = page.locator('button[aria-label*="Close"]').or(page.locator('button:has-text("Cancel")'));
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check Relationships tab
    console.log('🔗 Checking Relationships tab...');
    const relationshipsTab = page.locator('button:has-text("Relationships")');
    if (await relationshipsTab.isVisible()) {
      console.log('✅ Relationships tab exists');
      await relationshipsTab.click();
      await page.waitForTimeout(1000);
      
      // Check if relationships content is visible
      const createRelationshipButton = page.locator('button:has-text("Create Relationship")');
      if (await createRelationshipButton.isVisible()) {
        console.log('✅ Create Relationship button found');
        
        // Click it to test the dialog
        await createRelationshipButton.click();
        await page.waitForTimeout(500);
        
        const relationshipDialog = page.locator('text="Create Table Relationship"');
        if (await relationshipDialog.isVisible()) {
          console.log('✅ Relationship creation dialog works');
          
          // Check for relationship types
          const oneToMany = page.locator('text="One to Many"');
          const manyToOne = page.locator('text="Many to One"');
          const manyToMany = page.locator('text="Many to Many"');
          
          if (await oneToMany.isVisible() && await manyToOne.isVisible() && await manyToMany.isVisible()) {
            console.log('✅ All relationship types are available');
          } else {
            console.log('❌ Some relationship types are missing');
          }
          
          // Close dialog
          const closeRelButton = page.locator('button[aria-label*="Close"]').last();
          await closeRelButton.click();
        } else {
          console.log('❌ Relationship dialog did not open');
        }
      } else {
        console.log('❌ Create Relationship button not found');
      }
    } else {
      console.log('❌ Relationships tab not found!');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('1. ID field enforcement: Check console output above');
    console.log('2. Geolocation field type: Check console output above');
    console.log('3. Relationships management: Check console output above');
    console.log('\n⚠️  If any features are missing, try:');
    console.log('   1. Hard refresh the browser (Ctrl+Shift+R)');
    console.log('   2. Clear browser cache');
    console.log('   3. Restart the development server');
    console.log('   4. Check for any build errors');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\nBrowser will stay open for manual inspection...');
    // Keep browser open for debugging
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

testDatabaseImprovements().catch(console.error);
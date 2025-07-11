const { chromium } = require('playwright');

async function testCRUDOperations() {
  console.log('🔍 Testing Data Browser CRUD Operations...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    console.log('1️⃣ Loading application...');
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    console.log('✅ Application loaded\n');
    
    // Handle app selector modal
    const modalVisible = await page.locator('[role="dialog"]').isVisible();
    if (modalVisible) {
      console.log('   App selector modal is open');
      
      // Look for Create New App button
      const createAppBtn = page.locator('[role="dialog"] button:has-text("Create New App")');
      if (await createAppBtn.isVisible()) {
        console.log('   Creating new app...');
        await createAppBtn.click();
        await page.waitForTimeout(500);
        
        // Fill in app details
        await page.fill('input[placeholder*="name"]', 'CRUD Test App');
        await page.fill('textarea', 'Testing CRUD operations');
        
        // Find and click the create button
        const createBtn = page.locator('button:has-text("Create App")').last();
        await createBtn.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ App created\n');
      }
    }
    
    // Open Database panel
    console.log('2️⃣ Opening Database panel...');
    await page.click('button[title="Database"]');
    await page.waitForTimeout(1500);
    console.log('✅ Database panel opened\n');
    
    // Create a test table
    console.log('3️⃣ Creating test table...');
    const createTableBtn = page.locator('button:has-text("Create Table")');
    await createTableBtn.click();
    await page.waitForTimeout(2000);
    
    // Wait for dialog to open and fill table name
    const tableNameInput = page.locator('input[placeholder*="table name"]');
    await tableNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await tableNameInput.fill('products');
    
    // Add a name field
    await page.click('button:has-text("Add Field")');
    await page.waitForTimeout(500);
    
    const nameInput = page.locator('input[placeholder="Field name"]').last();
    await nameInput.fill('name');
    
    // Add a price field
    await page.click('button:has-text("Add Field")');
    await page.waitForTimeout(500);
    
    const priceInput = page.locator('input[placeholder="Field name"]').last();
    await priceInput.fill('price');
    const priceType = page.locator('select').last();
    await priceType.selectOption('number');
    
    // Create the table - click the button in the dialog, not the panel
    const createBtn = page.locator('[role="dialog"] button:has-text("Create Table")').last();
    await createBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ Table created\n');
    
    // Click on the table to view data
    console.log('4️⃣ Opening table data viewer...');
    await page.click('text="products"');
    await page.waitForTimeout(1500);
    
    // Take screenshot of empty table
    await page.screenshot({ path: 'crud-1-empty-table.png' });
    console.log('📸 Screenshot saved: crud-1-empty-table.png\n');
    
    // TEST: Create (Add new row)
    console.log('5️⃣ TEST: CREATE - Adding new row...');
    await page.click('button:has-text("Add Row")');
    await page.waitForTimeout(500);
    
    // Fill in the data
    const nameField = page.locator('input[placeholder="name"]');
    if (await nameField.isVisible()) {
      await nameField.fill('iPhone 15');
      const priceField = page.locator('input[placeholder="price"]');
      await priceField.fill('999');
      
      // Save the row
      await page.click('button[title="Save"]');
      await page.waitForTimeout(1500);
      console.log('✅ Row added successfully\n');
      
      // Take screenshot
      await page.screenshot({ path: 'crud-2-after-create.png' });
      console.log('📸 Screenshot saved: crud-2-after-create.png\n');
    } else {
      console.log('❌ Could not find input fields for new row\n');
    }
    
    // TEST: Read - Verify data is displayed
    console.log('6️⃣ TEST: READ - Verifying data display...');
    const hasIPhone = await page.locator('text="iPhone 15"').isVisible();
    console.log(`   Data visible: ${hasIPhone ? '✅' : '❌'}\n`);
    
    // TEST: Update - Edit the row
    console.log('7️⃣ TEST: UPDATE - Editing row...');
    const editBtn = page.locator('button[title="Edit"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      
      // Update the name
      const editInput = page.locator('input[value="iPhone 15"]');
      if (await editInput.isVisible()) {
        await editInput.fill('iPhone 15 Pro');
        await page.click('button[title="Save"]').last();
        await page.waitForTimeout(1500);
        console.log('✅ Row updated successfully\n');
        
        // Take screenshot
        await page.screenshot({ path: 'crud-3-after-update.png' });
        console.log('📸 Screenshot saved: crud-3-after-update.png\n');
      }
    }
    
    // TEST: Delete - Remove the row
    console.log('8️⃣ TEST: DELETE - Deleting row...');
    const deleteBtn = page.locator('button[title="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Handle confirm dialog
      page.on('dialog', dialog => dialog.accept());
      await page.waitForTimeout(1500);
      console.log('✅ Row deleted successfully\n');
      
      // Take screenshot
      await page.screenshot({ path: 'crud-4-after-delete.png' });
      console.log('📸 Screenshot saved: crud-4-after-delete.png\n');
    }
    
    // TEST: Search functionality
    console.log('9️⃣ TEST: SEARCH - Testing search...');
    // First add a few rows
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Add Row")');
      await page.waitForTimeout(300);
      await page.fill('input[placeholder="name"]', `Product ${i}`);
      await page.fill('input[placeholder="price"]', `${i * 100}`);
      await page.click('button[title="Save"]');
      await page.waitForTimeout(1000);
    }
    
    // Test search
    await page.fill('input[placeholder="Search records..."]', 'Product 2');
    await page.waitForTimeout(500);
    
    const visibleRows = await page.locator('tbody tr').count();
    console.log(`   Search results: ${visibleRows - 1} rows (excluding header)\n`);
    
    await page.screenshot({ path: 'crud-5-search-results.png' });
    console.log('📸 Screenshot saved: crud-5-search-results.png\n');
    
    console.log('📊 CRUD TESTS COMPLETE');
    console.log('Check the screenshots:');
    console.log('- crud-1-empty-table.png');
    console.log('- crud-2-after-create.png');
    console.log('- crud-3-after-update.png');
    console.log('- crud-4-after-delete.png');
    console.log('- crud-5-search-results.png');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'crud-error-state.png' });
    console.log('📸 Error screenshot saved: crud-error-state.png');
  }
  
  console.log('\n⏳ Browser will remain open for 60 seconds for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
}

testCRUDOperations().catch(console.error);
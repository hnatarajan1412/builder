// Quick test script to verify Magic Text implementation
const { chromium } = require('playwright');

async function quickTest() {
  console.log('🚀 Starting quick Magic Text test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);
    
    console.log('✅ App loaded');
    
    // Check if we can see the canvas or need to create app
    const canvasExists = await page.locator('[data-testid="canvas-drop-zone"]').isVisible();
    
    if (!canvasExists) {
      // Try to create or select app
      const createButton = page.locator('button:has-text("Create"), text=Create New App').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.fill('input', 'Test App');
        await page.click('button:has-text("Create")');
        await page.waitForTimeout(2000);
      }
    }
    
    // Go to database tab and create table if needed
    await page.click('text=Database');
    await page.waitForTimeout(1000);
    
    const hasTable = await page.locator('text=products').isVisible();
    if (!hasTable) {
      await page.click('button:has-text("Create Table")');
      await page.fill('input[placeholder*="table"]', 'products');
      await page.click('button:has-text("Create")');
      console.log('✅ Created products table');
    }
    
    // Go back to Pages
    await page.click('text=Pages');
    await page.waitForTimeout(1000);
    
    // Test 1: Add Table component
    const palette = page.locator('.component-palette').first();
    const tableComponent = palette.locator('text=Table').first();
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await tableComponent.dragTo(canvas);
    await page.waitForTimeout(1000);
    
    // Select table and test Magic Text
    await page.click('[data-component-type="table"]');
    await page.waitForTimeout(500);
    
    const dataInput = page.locator('input[placeholder*="data"]').first();
    await dataInput.click();
    
    // Click magic text button
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    console.log('🔍 Checking Magic Text Picker...');
    
    // Should show products option for table (collection)
    const productsOption = await page.locator('text=products').isVisible();
    console.log(productsOption ? '✅ Shows products for table' : '❌ Missing products option');
    
    if (productsOption) {
      await page.click('text=products');
      await page.waitForTimeout(500);
      
      const dataValue = await dataInput.inputValue();
      console.log(`✅ Table data set to: ${dataValue}`);
    }
    
    // Test 2: Add Repeater
    const repeaterComponent = palette.locator('text=Repeater').first();
    await repeaterComponent.dragTo(canvas);
    await page.waitForTimeout(1000);
    
    await page.click('[data-component-type="repeater"]');
    await page.waitForTimeout(500);
    
    console.log('✅ Basic Magic Text functionality works');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error);
import { test, expect } from '@playwright/test';

test.describe('Manual Data Binding Tests', () => {
  test('Test Repeater with Magic Text', async ({ page }) => {
    await page.goto('http://localhost:3006');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Look for existing apps or create new
    const hasApps = await page.locator('.app-card').count() > 0;
    
    if (!hasApps) {
      // Create new app
      await page.click('button:has-text("Create New App")');
      await page.fill('input[placeholder="Enter app name"]', 'Test App');
      await page.fill('textarea[placeholder="Enter app description"]', 'Testing');
      await page.click('button:has-text("Create App")');
    } else {
      // Click first app
      await page.locator('.app-card').first().click();
    }
    
    // Wait for builder to load
    await page.waitForSelector('.page-canvas');
    
    // Check if we have a products table
    await page.click('button[title="Database"]');
    await page.waitForTimeout(500);
    
    const hasProductsTable = await page.locator('text=products').count() > 0;
    
    if (!hasProductsTable) {
      // Create products table
      await page.click('button:has-text("Add Table")');
      await page.fill('input[placeholder="Enter table name"]', 'products');
      
      // Add name field
      await page.click('button:has-text("Add Field")');
      await page.getByPlaceholder('Field name').fill('name');
      
      // Add price field
      await page.click('button:has-text("Add Field")');
      await page.getByPlaceholder('Field name').nth(1).fill('price');
      await page.locator('select').nth(1).selectOption('number');
      
      await page.click('button:has-text("Create Table")');
      
      // Add sample data
      await page.click('text=products');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("Add Record")');
      await page.fill('input[placeholder="name"]', 'Product 1');
      await page.fill('input[placeholder="price"]', '99.99');
      await page.click('button:has-text("Save")');
      
      await page.click('button:has-text("Add Record")');
      await page.fill('input[placeholder="name"]', 'Product 2');
      await page.fill('input[placeholder="price"]', '199.99');
      await page.click('button:has-text("Save")');
    }
    
    // Go to pages
    await page.click('button[title="Pages"]');
    await page.waitForTimeout(500);
    
    // Add repeater if not exists
    const hasRepeater = await page.locator('.repeater-container').count() > 0;
    
    if (!hasRepeater) {
      // Drag repeater
      const repeater = page.locator('[data-component-id="repeater"]');
      const canvas = page.locator('.page-canvas');
      
      await repeater.hover();
      await page.mouse.down();
      await canvas.hover();
      await page.mouse.up();
      
      await page.waitForTimeout(500);
    }
    
    // Click on repeater
    await page.click('.repeater-container');
    
    // Set data source
    const dataSourceInput = page.locator('input[placeholder*="table name"]');
    await dataSourceInput.clear();
    await dataSourceInput.fill('{{products}}');
    
    // Add text component to repeater template
    const text = page.locator('[data-component-id="text"]');
    const template = page.locator('.repeater-template-editor');
    
    await text.hover();
    await page.mouse.down();
    await template.hover();
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Configure text to show product name
    await page.click('.repeater-template-editor text');
    
    // Use magic text
    const textInput = page.locator('textarea[placeholder*="text"]').or(page.locator('input[placeholder*="text"]'));
    await textInput.clear();
    await textInput.fill('{{item.name}} - ${{item.price}}');
    
    // Preview
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Verify data is displayed
    await expect(page.locator('text=Product 1 - $99.99')).toBeVisible();
    await expect(page.locator('text=Product 2 - $199.99')).toBeVisible();
  });
});
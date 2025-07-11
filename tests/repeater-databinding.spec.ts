import { test, expect } from '@playwright/test';

test.describe('Repeater Data Binding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006');
  });

  test('should create repeater with data source and drop component template', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Repeater Test App');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing repeater data binding');
    await page.click('button:has-text("Create App")');
    
    // Create a table with sample data
    await page.click('button[title="Database"]');
    await page.click('button:has-text("Add Table")');
    await page.fill('input[placeholder="Enter table name"]', 'products');
    
    // Add fields
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'name');
    await page.selectOption('select', 'string');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'price');
    await page.selectOption('select', 'number');
    
    await page.click('button:has-text("Create Table")');
    
    // Add sample data
    await page.click('button:has-text("Add Record")');
    await page.fill('input[placeholder="name"]', 'Product 1');
    await page.fill('input[placeholder="price"]', '99.99');
    await page.click('button:has-text("Save")');
    
    await page.click('button:has-text("Add Record")');
    await page.fill('input[placeholder="name"]', 'Product 2');
    await page.fill('input[placeholder="price"]', '149.99');
    await page.click('button:has-text("Save")');
    
    // Go back to page editor
    await page.click('button[title="Pages"]');
    
    // Drag and drop repeater component
    await page.dragAndDrop(
      '[data-component-id="repeater"]',
      '.page-canvas'
    );
    
    // Configure repeater data source
    await page.click('.repeater-container');
    await page.click('[data-testid="magic-text-editor"] button:has-text("+")');
    
    // Select products table as data source
    await page.click('button:has-text("products")');
    await page.click('button:has-text("All products")');
    
    // Drop a text component into the repeater
    await page.dragAndDrop(
      '[data-component-id="text"]',
      '.repeater-container'
    );
    
    // Configure text to show product name
    await page.click('.repeater-item text');
    await page.click('[data-testid="magic-text-editor"] button:has-text("+")');
    await page.click('button:has-text("Current Item")');
    await page.click('button:has-text("name")');
    
    // Test in preview mode
    await page.click('button[title="Preview"]');
    
    // Verify that both products are displayed
    await expect(page.locator('text=Product 1')).toBeVisible();
    await expect(page.locator('text=Product 2')).toBeVisible();
  });

  test('should support item context in repeater with multiple fields', async ({ page }) => {
    // Create app with existing data
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Product List App');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing repeater with multiple fields');
    await page.click('button:has-text("Create App")');
    
    // Create products table
    await page.click('button[title="Database"]');
    await page.click('button:has-text("Add Table")');
    await page.fill('input[placeholder="Enter table name"]', 'products');
    
    // Add fields
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'name');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'price');
    await page.selectOption('select', 'number');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'description');
    await page.selectOption('select', 'text');
    
    await page.click('button:has-text("Create Table")');
    
    // Add sample products
    await page.click('button:has-text("Add Record")');
    await page.fill('input[placeholder="name"]', 'Laptop');
    await page.fill('input[placeholder="price"]', '999');
    await page.fill('textarea[placeholder="description"]', 'High-performance laptop');
    await page.click('button:has-text("Save")');
    
    // Go to page editor
    await page.click('button[title="Pages"]');
    
    // Add repeater
    await page.dragAndDrop('[data-component-id="repeater"]', '.page-canvas');
    await page.fill('[placeholder*="table name"]', '{{products}}');
    
    // Add container as template
    await page.dragAndDrop('[data-component-id="container"]', '.repeater-container');
    
    // Add text for name
    await page.dragAndDrop('[data-component-id="text"]', '.repeater-item .container');
    await page.click('.repeater-item text:first-child');
    await page.fill('[data-testid="text-content"]', '{{item.name}}');
    
    // Add text for price with formatting
    await page.dragAndDrop('[data-component-id="text"]', '.repeater-item .container');
    await page.click('.repeater-item text:last-child');
    await page.fill('[data-testid="text-content"]', 'Price: {{item.price|currency}}');
    
    // Preview
    await page.click('button[title="Preview"]');
    
    // Verify rendered content
    await expect(page.locator('text=Laptop')).toBeVisible();
    await expect(page.locator('text=Price: $999.00')).toBeVisible();
  });

  test('should support index and conditional logic in repeater', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Indexed List App');
    await page.click('button:has-text("Create App")');
    
    // Create simple list table
    await page.click('button[title="Database"]');
    await page.click('button:has-text("Add Table")');
    await page.fill('input[placeholder="Enter table name"]', 'tasks');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'title');
    
    await page.click('button:has-text("Create Table")');
    
    // Add tasks
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Add Record")');
      await page.fill('input[placeholder="title"]', `Task ${i}`);
      await page.click('button:has-text("Save")');
    }
    
    // Go to page editor
    await page.click('button[title="Pages"]');
    
    // Add repeater
    await page.dragAndDrop('[data-component-id="repeater"]', '.page-canvas');
    await page.fill('[placeholder*="table name"]', '{{tasks}}');
    
    // Add text component with index
    await page.dragAndDrop('[data-component-id="text"]', '.repeater-container');
    await page.click('.repeater-item text');
    await page.fill('[data-testid="text-content"]', '{{index}}. {{item.title}}');
    
    // Preview
    await page.click('button[title="Preview"]');
    
    // Verify indexed list
    await expect(page.locator('text=0. Task 1')).toBeVisible();
    await expect(page.locator('text=1. Task 2')).toBeVisible();
    await expect(page.locator('text=2. Task 3')).toBeVisible();
  });
});
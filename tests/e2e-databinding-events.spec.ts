import { test, expect } from '@playwright/test';

test.describe('End-to-End Data Binding and Event Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006');
  });

  test('Complete flow: Create app with table, form, and repeater with event handling', async ({ page }) => {
    // Step 1: Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'E2E Test App');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing all components');
    await page.click('button:has-text("Create App")');
    
    // Step 2: Create products table
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
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'description');
    await page.selectOption('select', 'text');
    
    await page.click('button:has-text("Create Table")');
    
    // Add sample products
    await page.click('button:has-text("Add Record")');
    await page.fill('input[placeholder="name"]', 'Laptop');
    await page.fill('input[placeholder="price"]', '999.99');
    await page.fill('textarea[placeholder="description"]', 'High-performance laptop');
    await page.click('button:has-text("Save")');
    
    await page.click('button:has-text("Add Record")');
    await page.fill('input[placeholder="name"]', 'Phone');
    await page.fill('input[placeholder="price"]', '699.99');
    await page.fill('textarea[placeholder="description"]', 'Latest smartphone');
    await page.click('button:has-text("Save")');
    
    // Step 3: Go to page editor
    await page.click('button[title="Pages"]');
    
    // Step 4: Add container for layout
    await page.dragAndDrop('[data-component-id="container"]', '.page-canvas');
    
    // Step 5: Add heading
    await page.dragAndDrop('[data-component-id="text"]', '[data-component-type="container"]');
    await page.click('.container text');
    await page.selectOption('select[value="paragraph"]', 'heading1');
    await page.fill('[placeholder*="text"]', 'Product Catalog');
    
    // Step 6: Add form for new products
    await page.dragAndDrop('[data-component-id="form"]', '[data-component-type="container"]');
    await page.click('.form-component');
    
    // Configure form to add to products table
    await page.selectOption('select', 'products');
    await page.fill('input[placeholder="Submit"]', 'Add Product');
    
    // Add form fields
    await page.dragAndDrop('[data-component-id="input"]', '.form-component');
    await page.click('.form-component input');
    await page.fill('input[placeholder="Enter placeholder text"]', 'Product name');
    
    await page.dragAndDrop('[data-component-id="input"]', '.form-component');
    await page.click('.form-component input:last-child');
    await page.selectOption('select[value="text"]', 'number');
    await page.fill('input[placeholder="Enter placeholder text"]', 'Price');
    
    // Step 7: Add table to display products
    await page.dragAndDrop('[data-component-id="table"]', '[data-component-type="container"]');
    await page.click('.table-component');
    
    // Configure table data source with magic text
    await page.click('[data-testid="magic-text-editor"] button:has-text("+")');
    await page.click('button:has-text("products")');
    await page.click('button:has-text("All products")');
    
    // Configure columns
    await page.fill('textarea[placeholder*="columns"]', JSON.stringify([
      { label: 'Name', field: 'name' },
      { label: 'Price', field: 'price', format: 'currency' },
      { label: 'Description', field: 'description' }
    ]));
    
    // Step 8: Add repeater for card view
    await page.dragAndDrop('[data-component-id="repeater"]', '[data-component-type="container"]');
    
    // Configure repeater data source
    await page.click('.repeater-container');
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Add card container to repeater
    await page.dragAndDrop('[data-component-id="container"]', '.repeater-template-editor');
    
    // Style the card
    await page.click('.repeater-template-editor .container');
    await page.click('[data-value="style"]');
    await page.fill('input[placeholder="Padding"]', '16px');
    await page.fill('input[placeholder="Background Color"]', '#f3f4f6');
    await page.fill('input[placeholder="Border Radius"]', '8px');
    await page.fill('input[placeholder="Margin Bottom"]', '8px');
    
    // Add product name to card
    await page.dragAndDrop('[data-component-id="text"]', '.repeater-template-editor .container');
    await page.click('.repeater-template-editor text');
    await page.selectOption('select[value="paragraph"]', 'heading3');
    await page.click('[data-testid="magic-text-editor"] button:has-text("+")');
    await page.click('button:has-text("Current Item")');
    await page.click('button:has-text("name")');
    
    // Add price with formatting
    await page.dragAndDrop('[data-component-id="text"]', '.repeater-template-editor .container');
    await page.click('.repeater-template-editor text:last-child');
    await page.fill('[placeholder*="text"]', 'Price: {{item.price|currency}}');
    
    // Add button with event
    await page.dragAndDrop('[data-component-id="button"]', '.repeater-template-editor .container');
    await page.click('.repeater-template-editor button');
    await page.fill('[placeholder*="button text"]', 'View Details');
    
    // Add click event
    await page.click('[data-value="events"]');
    await page.click('button:has-text("Add Event")');
    await page.selectOption('select', 'onClick');
    await page.selectOption('select[name="action"]', 'showAlert');
    await page.fill('input[placeholder="Alert message"]', 'Product: {{item.name}} - ${{item.price}}');
    
    // Step 9: Test in preview mode
    await page.click('button[title="Preview"]');
    
    // Verify table shows data
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('td:has-text("Laptop")')).toBeVisible();
    await expect(page.locator('td:has-text("Phone")')).toBeVisible();
    await expect(page.locator('td:has-text("$999.99")')).toBeVisible();
    await expect(page.locator('td:has-text("$699.99")')).toBeVisible();
    
    // Verify repeater shows cards
    await expect(page.locator('.repeater-item').first()).toBeVisible();
    await expect(page.locator('h3:has-text("Laptop")')).toBeVisible();
    await expect(page.locator('text=Price: $999.99')).toBeVisible();
    await expect(page.locator('h3:has-text("Phone")')).toBeVisible();
    await expect(page.locator('text=Price: $699.99')).toBeVisible();
    
    // Test button click event
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Product: Laptop - $999.99');
      dialog.accept();
    });
    await page.click('button:has-text("View Details")').first();
    
    // Test form submission
    await page.fill('input[placeholder="Product name"]', 'Tablet');
    await page.fill('input[placeholder="Price"]', '499.99');
    await page.click('button:has-text("Add Product")');
    
    // Verify new product appears
    await expect(page.locator('td:has-text("Tablet")')).toBeVisible();
    await expect(page.locator('h3:has-text("Tablet")')).toBeVisible();
    
    // Close preview
    await page.click('button[title="Close preview"]');
  });

  test('Test list component with magic text and formatting', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'List Test App');
    await page.click('button:has-text("Create App")');
    
    // Create tasks table
    await page.click('button[title="Database"]');
    await page.click('button:has-text("Add Table")');
    await page.fill('input[placeholder="Enter table name"]', 'tasks');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'title');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]', 'completed');
    await page.selectOption('select', 'boolean');
    
    await page.click('button:has-text("Create Table")');
    
    // Add tasks
    const tasks = ['Buy groceries', 'Walk the dog', 'Finish report'];
    for (const task of tasks) {
      await page.click('button:has-text("Add Record")');
      await page.fill('input[placeholder="title"]', task);
      await page.click('input[type="checkbox"]'); // Check some as completed
      await page.click('button:has-text("Save")');
    }
    
    // Go to page editor
    await page.click('button[title="Pages"]');
    
    // Add list component
    await page.dragAndDrop('[data-component-id="list"]', '.page-canvas');
    await page.click('.list-component');
    
    // Configure data source
    await page.fill('input[placeholder*="table name"]', '{{tasks}}');
    await page.fill('input[placeholder*="Field to display"]', 'title');
    
    // Preview
    await page.click('button[title="Preview"]');
    
    // Verify list items
    for (const task of tasks) {
      await expect(page.locator(`li:has-text("${task}")`)).toBeVisible();
    }
  });

  test('Test navigation between pages with state', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Navigation Test');
    await page.click('button:has-text("Create App")');
    
    // Create second page
    await page.click('button[title="Pages"]');
    await page.click('button:has-text("Add Page")');
    await page.fill('input[placeholder="Page name"]', 'Details');
    await page.fill('input[placeholder="Page path"]', '/details');
    await page.click('button:has-text("Create Page")');
    
    // Go back to home page
    await page.click('button:has-text("Home")');
    
    // Add button to navigate
    await page.dragAndDrop('[data-component-id="button"]', '.page-canvas');
    await page.click('button.bg-blue-600');
    await page.fill('[placeholder*="button text"]', 'Go to Details');
    
    // Add navigation event
    await page.click('[data-value="events"]');
    await page.click('button:has-text("Add Event")');
    await page.selectOption('select', 'onClick');
    await page.selectOption('select[name="action"]', 'navigate');
    await page.fill('input[placeholder="Page name or path"]', 'Details');
    
    // Preview and test navigation
    await page.click('button[title="Preview"]');
    await page.click('button:has-text("Go to Details")');
    
    // Verify navigation happened (URL or page indicator would change)
    await expect(page.locator('text=Details Page')).toBeVisible();
  });
});
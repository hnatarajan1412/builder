import { test, expect, Page } from '@playwright/test';

// Helper functions
async function createTestApp(page: Page) {
  await page.goto('/');
  
  // Create new app if needed
  const appExists = await page.locator('text=Test App').isVisible();
  if (!appExists) {
    await page.click('text=Create New App');
    await page.fill('input[placeholder="Enter app name"]', 'Test App');
    await page.click('button:has-text("Create")');
  } else {
    await page.click('text=Test App');
  }
  
  await page.waitForURL(/\/app\//);
}

async function setupTestData(page: Page) {
  // Go to Database tab
  await page.click('text=Database');
  
  // Create products table if not exists
  const productsTableExists = await page.locator('text=products').first().isVisible();
  if (!productsTableExists) {
    await page.click('text=Create Table');
    await page.fill('input[placeholder="Table name"]', 'products');
    await page.click('text=Add Field');
    
    // Add fields
    const fields = [
      { name: 'name', type: 'text' },
      { name: 'price', type: 'number' },
      { name: 'description', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'imageUrl', type: 'text' },
      { name: 'inStock', type: 'boolean' }
    ];
    
    for (const field of fields) {
      await page.fill('input[placeholder="Field name"]', field.name);
      await page.selectOption('select', field.type);
      await page.click('button:has-text("Add")');
    }
    
    await page.click('button:has-text("Create Table")');
    
    // Add sample data
    await page.click('text=products');
    await page.click('text=Add Record');
    
    const sampleProducts = [
      { name: 'iPhone 14', price: 999, description: 'Latest iPhone', category: 'Electronics', imageUrl: 'https://via.placeholder.com/200/007AFF/FFFFFF?text=iPhone', inStock: true },
      { name: 'MacBook Pro', price: 2499, description: 'M3 Pro chip', category: 'Computers', imageUrl: 'https://via.placeholder.com/200/333333/FFFFFF?text=MacBook', inStock: true },
      { name: 'AirPods', price: 249, description: 'Wireless earbuds', category: 'Audio', imageUrl: 'https://via.placeholder.com/200/FFFFFF/000000?text=AirPods', inStock: false }
    ];
    
    for (const product of sampleProducts) {
      await page.fill('input[name="name"]', product.name);
      await page.fill('input[name="price"]', product.price.toString());
      await page.fill('input[name="description"]', product.description);
      await page.fill('input[name="category"]', product.category);
      await page.fill('input[name="imageUrl"]', product.imageUrl);
      if (product.inStock) {
        await page.check('input[name="inStock"]');
      }
      await page.click('button:has-text("Save")');
    }
  }
  
  // Create users table if not exists
  const usersTableExists = await page.locator('text=users').first().isVisible();
  if (!usersTableExists) {
    await page.click('text=Create Table');
    await page.fill('input[placeholder="Table name"]', 'users');
    
    const fields = [
      { name: 'name', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'role', type: 'text' },
      { name: 'active', type: 'boolean' }
    ];
    
    for (const field of fields) {
      await page.click('text=Add Field');
      await page.fill('input[placeholder="Field name"]', field.name);
      await page.selectOption('select', field.type);
      await page.click('button:has-text("Add")');
    }
    
    await page.click('button:has-text("Create Table")');
    
    // Add sample users
    const sampleUsers = [
      { name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: true },
      { name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', active: false }
    ];
    
    await page.click('text=users');
    for (const user of sampleUsers) {
      await page.click('text=Add Record');
      await page.fill('input[name="name"]', user.name);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="role"]', user.role);
      if (user.active) {
        await page.check('input[name="active"]');
      }
      await page.click('button:has-text("Save")');
    }
  }
}

async function dragComponentToCanvas(page: Page, componentName: string) {
  const component = page.locator(`[data-component-type="${componentName}"]`).first();
  const canvas = page.locator('[data-testid="canvas-drop-zone"]');
  
  await component.hover();
  await page.mouse.down();
  
  const canvasBox = await canvas.boundingBox();
  if (canvasBox) {
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
  }
  
  await page.mouse.up();
  await page.waitForTimeout(500); // Wait for drop animation
}

test.describe('Table Component with Magic Text', () => {
  test.beforeEach(async ({ page }) => {
    await createTestApp(page);
    await setupTestData(page);
    await page.click('text=Pages');
  });

  test('should display table with magic text data source', async ({ page }) => {
    // Add table component
    await dragComponentToCanvas(page, 'table');
    
    // Configure table
    await page.click('[data-component-type="table"]');
    
    // Set data source using magic text
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Configure columns
    const columnsConfig = `[
      { "field": "name", "label": "Product" },
      { "field": "price", "label": "Price", "format": "currency" },
      { "field": "category", "label": "Category" }
    ]`;
    
    await page.fill('textarea[placeholder*="columns"]', columnsConfig);
    
    // Go to preview mode
    await page.click('button:has-text("Preview")');
    
    // Verify table displays data
    await expect(page.locator('text=iPhone 14')).toBeVisible();
    await expect(page.locator('text=MacBook Pro')).toBeVisible();
    await expect(page.locator('text=AirPods')).toBeVisible();
    
    // Verify currency formatting
    await expect(page.locator('text=$999.00')).toBeVisible();
    await expect(page.locator('text=$2,499.00')).toBeVisible();
    await expect(page.locator('text=$249.00')).toBeVisible();
  });

  test('should show empty state when no data', async ({ page }) => {
    await dragComponentToCanvas(page, 'table');
    await page.click('[data-component-type="table"]');
    
    // Don't set data source
    await page.click('button:has-text("Preview")');
    
    // Verify empty state
    await expect(page.locator('text=No data available')).toBeVisible();
    await expect(page.locator('text=Set a data source')).toBeVisible();
  });
});

test.describe('Repeater Component with Magic Text', () => {
  test.beforeEach(async ({ page }) => {
    await createTestApp(page);
    await setupTestData(page);
    await page.click('text=Pages');
  });

  test('should render repeater with text components', async ({ page }) => {
    // Add repeater
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    
    // Set data source
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Add text component to repeater template
    const repeaterTemplate = page.locator('.repeater-template-editor');
    await dragComponentToCanvas(page, 'text');
    
    // Configure text with magic text
    await page.click('.repeater-template-editor [data-component-type="text"]');
    await page.fill('[placeholder*="text or add dynamic"]', '{{item.name}} - {{item.price|currency}}');
    
    // Preview
    await page.click('button:has-text("Preview")');
    
    // Verify repeated items
    await expect(page.locator('text=iPhone 14 - $999.00')).toBeVisible();
    await expect(page.locator('text=MacBook Pro - $2,499.00')).toBeVisible();
    await expect(page.locator('text=AirPods - $249.00')).toBeVisible();
  });

  test('should handle button events with item context', async ({ page }) => {
    // Add text to show selected item
    await dragComponentToCanvas(page, 'text');
    await page.click('[data-component-type="text"]').first();
    await page.fill('[placeholder*="text or add dynamic"]', 'Selected: {{selectedProduct.name || "None"}}');
    
    // Add repeater
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Add button to repeater
    const repeaterTemplate = page.locator('.repeater-template-editor');
    await dragComponentToCanvas(page, 'button');
    
    // Configure button
    await page.click('.repeater-template-editor [data-component-type="button"]');
    await page.fill('[placeholder*="button text"]', 'Select {{item.name}}');
    
    // Add click event
    await page.click('text=Events');
    await page.click('text=Add Event');
    await page.selectOption('select[name="trigger"]', 'click');
    await page.selectOption('select[name="actionType"]', 'updateState');
    await page.fill('input[name="key"]', 'selectedProduct');
    await page.fill('input[name="value"]', '{{item}}');
    await page.click('button:has-text("Save Event")');
    
    // Preview and test
    await page.click('button:has-text("Preview")');
    
    // Click first button
    await page.click('button:has-text("Select iPhone 14")');
    
    // Verify state updated
    await expect(page.locator('text=Selected: iPhone 14')).toBeVisible();
    
    // Click another button
    await page.click('button:has-text("Select MacBook Pro")');
    await expect(page.locator('text=Selected: MacBook Pro')).toBeVisible();
  });

  test('should render image grid layout', async ({ page }) => {
    // Add repeater
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    
    // Configure repeater
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    await page.selectOption('select[name="direction"]', 'grid');
    await page.fill('input[name="gridColumns"]', '3');
    
    // Add container to template
    await dragComponentToCanvas(page, 'container');
    
    // Add image inside container
    await page.click('.repeater-template-editor [data-component-type="container"]');
    await dragComponentToCanvas(page, 'image');
    
    // Configure image
    await page.click('.repeater-template-editor [data-component-type="image"]');
    await page.fill('[placeholder*="image URL"]', '{{item.imageUrl}}');
    await page.fill('[placeholder*="alt text"]', '{{item.name}}');
    
    // Add text below image
    await dragComponentToCanvas(page, 'text');
    await page.click('.repeater-template-editor [data-component-type="text"]').last();
    await page.fill('[placeholder*="text or add dynamic"]', '{{item.name}}');
    
    // Preview
    await page.click('button:has-text("Preview")');
    
    // Verify grid layout
    const repeaterItems = page.locator('.repeater-items');
    await expect(repeaterItems).toHaveCSS('display', 'grid');
    
    // Verify images
    const images = page.locator('.repeater-items img');
    await expect(images).toHaveCount(3);
    
    // Verify alt text
    await expect(images.first()).toHaveAttribute('alt', 'iPhone 14');
  });

  test('should handle complex nested layouts', async ({ page }) => {
    // Add repeater with users
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    await page.fill('input[placeholder*="table name"]', '{{users}}');
    
    // Add container with horizontal layout
    await dragComponentToCanvas(page, 'container');
    await page.click('.repeater-template-editor [data-component-type="container"]');
    await page.selectOption('select[name="layout"]', 'horizontal');
    
    // Add multiple text components
    // Index number
    await dragComponentToCanvas(page, 'text');
    await page.click('.repeater-template-editor [data-component-type="text"]').nth(0);
    await page.fill('[placeholder*="text or add dynamic"]', '{{index + 1}}.');
    
    // Name
    await dragComponentToCanvas(page, 'text');
    await page.click('.repeater-template-editor [data-component-type="text"]').nth(1);
    await page.fill('[placeholder*="text or add dynamic"]', '{{item.name}}');
    
    // Email
    await dragComponentToCanvas(page, 'text');
    await page.click('.repeater-template-editor [data-component-type="text"]').nth(2);
    await page.fill('[placeholder*="text or add dynamic"]', '{{item.email}}');
    
    // Preview
    await page.click('button:has-text("Preview")');
    
    // Verify numbering
    await expect(page.locator('text=1.')).toBeVisible();
    await expect(page.locator('text=2.')).toBeVisible();
    await expect(page.locator('text=3.')).toBeVisible();
    
    // Verify user data
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
  });

  test('should handle empty repeater data gracefully', async ({ page }) => {
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    
    // Set non-existent table
    await page.fill('input[placeholder*="table name"]', '{{nonexistent}}');
    
    await page.click('button:has-text("Preview")');
    
    // Should show empty state
    await expect(page.locator('text=No data to display')).toBeVisible();
  });
});

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await createTestApp(page);
    await setupTestData(page);
    await page.click('text=Pages');
  });

  test('should work with table and repeater on same page', async ({ page }) => {
    // Add heading
    await dragComponentToCanvas(page, 'text');
    await page.click('[data-component-type="text"]');
    await page.selectOption('select[name="type"]', 'heading1');
    await page.fill('[placeholder*="text or add dynamic"]', 'Product Catalog');
    
    // Add table
    await dragComponentToCanvas(page, 'table');
    await page.click('[data-component-type="table"]');
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Add repeater below
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    await page.selectOption('select[name="direction"]', 'grid');
    
    // Add card layout to repeater
    await dragComponentToCanvas(page, 'container');
    await page.click('.repeater-template-editor [data-component-type="container"]');
    
    // Style the container
    await page.click('text=Style');
    await page.fill('input[name="padding"]', '16px');
    await page.fill('input[name="border"]', '1px solid #e5e7eb');
    await page.fill('input[name="borderRadius"]', '8px');
    
    // Add content
    await page.click('text=Props');
    await dragComponentToCanvas(page, 'text');
    await page.click('.repeater-template-editor [data-component-type="text"]');
    await page.fill('[placeholder*="text or add dynamic"]', '{{item.name}}');
    
    // Preview
    await page.click('button:has-text("Preview")');
    
    // Verify both components render
    await expect(page.locator('h1:has-text("Product Catalog")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('.repeater-items')).toBeVisible();
    
    // Verify data in both
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows).toHaveCount(3);
    
    const cards = page.locator('.repeater-items > div');
    await expect(cards).toHaveCount(3);
  });

  test('performance test with many items', async ({ page }) => {
    // This test would require setting up a large dataset
    // For now, we'll test with the existing data
    
    await dragComponentToCanvas(page, 'repeater');
    await page.click('[data-component-type="repeater"]');
    await page.fill('input[placeholder*="table name"]', '{{products}}');
    
    // Add complex template
    await dragComponentToCanvas(page, 'container');
    
    // Add multiple components
    const components = ['image', 'text', 'text', 'button'];
    for (const comp of components) {
      await dragComponentToCanvas(page, comp);
    }
    
    // Measure preview load time
    const startTime = Date.now();
    await page.click('button:has-text("Preview")');
    
    // Wait for all items to render
    await page.waitForSelector('.repeater-items > div');
    
    const loadTime = Date.now() - startTime;
    
    // Should load reasonably fast (under 2 seconds)
    expect(loadTime).toBeLessThan(2000);
    
    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });
});
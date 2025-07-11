import { test, expect } from '@playwright/test';

test.describe('Data Binding and Preview Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(1000);
  });

  test('should bind data to repeater component and display in preview', async ({ page }) => {
    // Create a new app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Data Binding Test App');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing data binding');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Click on database icon to open database panel
    await page.click('[data-testid="database-icon"]');
    await page.waitForTimeout(500);

    // Create a table
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'products');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'name');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'string');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'price');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'number');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'description');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'string');
    
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add sample data
    await page.click('text=products');
    await page.waitForTimeout(500);
    
    // Add first product
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter name"]', 'Widget Pro');
    await page.fill('input[placeholder="Enter price"]', '29.99');
    await page.fill('input[placeholder="Enter description"]', 'Professional widget for all needs');
    await page.click('button:has-text("Save")');
    
    // Add second product
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter name"]', 'Widget Plus');
    await page.fill('input[placeholder="Enter price"]', '39.99');
    await page.fill('input[placeholder="Enter description"]', 'Enhanced widget with extra features');
    await page.click('button:has-text("Save")');
    
    // Add third product
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter name"]', 'Widget Max');
    await page.fill('input[placeholder="Enter price"]', '49.99');
    await page.fill('input[placeholder="Enter description"]', 'Ultimate widget experience');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Switch to components panel
    await page.click('[data-testid="components-icon"]');
    await page.waitForTimeout(500);

    // Add a repeater component
    await page.click('text=Repeater');
    await page.waitForTimeout(500);

    // Select the repeater
    await page.click('.component-instance:has-text("Repeater")');
    await page.waitForTimeout(500);

    // Go to Data tab
    await page.click('text=Data');
    await page.waitForTimeout(500);

    // Select the products table
    await page.selectOption('select:has-text("Select a table")', { label: 'products (4 fields)' });
    await page.waitForTimeout(500);

    // Bind data source
    await page.click('button:has-text("Bind Table")');
    await page.waitForTimeout(500);

    // Add text components inside repeater
    await page.click('[data-testid="components-icon"]');
    
    // Add heading for product name
    await page.click('text=Text');
    await page.waitForTimeout(500);
    
    // Configure text component for name
    await page.click('.component-instance:has-text("Text"):last-of-type');
    await page.selectOption('select[name="type"]', 'heading3');
    
    // Bind to product name
    await page.click('text=Data');
    await page.selectOption('select:has-text("Select a table")', { label: 'products (4 fields)' });
    await page.click('button:has-text("name"):first-of-type');
    await page.click('button:has-text("Apply Binding")');
    await page.waitForTimeout(500);

    // Add text for price
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Text');
    await page.waitForTimeout(500);
    
    // Configure and bind price
    await page.click('.component-instance:has-text("Text"):last-of-type');
    await page.click('text=Data');
    await page.selectOption('select:has-text("Select a table")', { label: 'products (4 fields)' });
    await page.click('button:has-text("price"):first-of-type');
    
    // Select currency format
    await page.click('button:has-text("Currency")');
    await page.click('button:has-text("Apply Binding")');
    await page.waitForTimeout(500);

    // Open preview mode
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(1000);

    // Verify all products are displayed
    await expect(page.locator('text=Widget Pro')).toBeVisible();
    await expect(page.locator('text=Widget Plus')).toBeVisible();
    await expect(page.locator('text=Widget Max')).toBeVisible();

    // Verify prices are formatted as currency
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.locator('text=$39.99')).toBeVisible();
    await expect(page.locator('text=$49.99')).toBeVisible();
  });

  test('should handle empty data gracefully', async ({ page }) => {
    // Create app and empty table
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Empty Data Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing empty data');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create empty table
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'empty_table');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'field1');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add repeater with binding
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Repeater');
    await page.click('.component-instance:has-text("Repeater")');
    await page.click('text=Data');
    await page.selectOption('select:has-text("Select a table")', { label: 'empty_table (2 fields)' });
    await page.click('button:has-text("Bind Table")');
    await page.waitForTimeout(500);

    // Preview should show empty state
    await page.click('button:has-text("Preview")');
    await expect(page.locator('text=No data to display')).toBeVisible();
  });

  test('should update preview when data changes', async ({ page }) => {
    // Setup app with data
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Dynamic Data Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing data updates');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create table with one item
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'items');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'title');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add initial data
    await page.click('text=items');
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter title"]', 'Initial Title');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Setup repeater with binding
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Repeater');
    await page.click('.component-instance:has-text("Repeater")');
    await page.click('text=Data');
    await page.selectOption('select:has-text("Select a table")', { label: 'items (2 fields)' });
    await page.click('button:has-text("Bind Table")');

    // Add text component
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Text');
    await page.click('.component-instance:has-text("Text"):last-of-type');
    await page.click('text=Data');
    await page.selectOption('select:has-text("Select a table")', { label: 'items (2 fields)' });
    await page.click('button:has-text("title"):first-of-type');
    await page.click('button:has-text("Apply Binding")');
    await page.waitForTimeout(500);

    // Open preview in new window
    const [previewPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('button[title="Open in new tab"]')
    ]);

    // Verify initial data
    await expect(previewPage.locator('text=Initial Title')).toBeVisible();

    // Update data in main window
    await page.click('[data-testid="database-icon"]');
    await page.click('text=items');
    await page.click('button[aria-label="Edit row"]');
    await page.fill('input[value="Initial Title"]', 'Updated Title');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Refresh preview and verify update
    await previewPage.reload();
    await expect(previewPage.locator('text=Updated Title')).toBeVisible();
  });
});
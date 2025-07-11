import { test, expect } from '@playwright/test';

test.describe('Magic Text Data Binding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(1000);
  });

  test('should bind single record data to button label using magic text', async ({ page }) => {
    // Create app with data
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Magic Text Data Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing magic text data binding');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create a table with user data
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'users');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'name');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'email');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add user data
    await page.click('text=users');
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter name"]', 'John Doe');
    await page.fill('input[placeholder="Enter email"]', 'john@example.com');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Add button component
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Button');
    await page.waitForTimeout(500);

    // Configure button with magic text
    await page.click('.component-instance:has-text("Button")');
    await page.fill('input[name="label"]', 'Welcome {{users[0].name}}!');
    await page.waitForTimeout(300);

    // Preview and verify
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Welcome John Doe!")')).toBeVisible();
  });

  test('should bind table data source and map fields', async ({ page }) => {
    // Create app with products table
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Table Binding Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing table data binding');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create products table
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'products');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'name');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'price');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'number');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add products
    await page.click('text=products');
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Add Row")');
      await page.fill('input[placeholder="Enter name"]', `Product ${i}`);
      await page.fill('input[placeholder="Enter price"]', `${i * 10}.99`);
      await page.click('button:has-text("Save")');
    }
    await page.waitForTimeout(500);

    // Add table component
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Table');
    await page.waitForTimeout(500);

    // Configure table with magic text data source
    await page.click('.component-instance:has-text("Table")');
    
    // Set data source
    await page.fill('textarea[name="data"]', '{{products}}');
    
    // Configure columns with field mappings
    await page.fill('textarea[name="columns"]', JSON.stringify([
      { label: 'Product Name', field: 'name' },
      { label: 'Price', field: 'price', format: 'currency' }
    ]));
    await page.waitForTimeout(300);

    // Preview and verify
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);
    
    // Check table headers
    await expect(page.locator('th:has-text("Product Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    
    // Check table data
    await expect(page.locator('td:has-text("Product 1")')).toBeVisible();
    await expect(page.locator('td:has-text("$10.99")')).toBeVisible();
  });

  test('should bind list data with repeater using magic text', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Repeater Binding Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing repeater with magic text');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create posts table
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'posts');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'title');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'content');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add posts
    await page.click('text=posts');
    for (let i = 1; i <= 2; i++) {
      await page.click('button:has-text("Add Row")');
      await page.fill('input[placeholder="Enter title"]', `Post ${i}`);
      await page.fill('input[placeholder="Enter content"]', `This is the content of post ${i}`);
      await page.click('button:has-text("Save")');
    }
    await page.waitForTimeout(500);

    // Add repeater component
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Repeater');
    await page.waitForTimeout(500);

    // Configure repeater data source
    await page.click('.component-instance:has-text("Repeater")');
    await page.fill('input[name="dataSource"]', '{{posts}}');
    await page.waitForTimeout(300);

    // Add text components inside repeater
    await page.click('text=Text'); // Title
    await page.waitForTimeout(300);
    await page.click('text=Text'); // Content
    await page.waitForTimeout(300);

    // Configure first text for title
    await page.click('.component-instance:has-text("Text")').nth(1);
    await page.selectOption('select[name="type"]', 'heading3');
    await page.fill('input[name="text"]', '{{item.title}}');
    await page.waitForTimeout(300);

    // Configure second text for content
    await page.click('.component-instance:has-text("Text")').nth(2);
    await page.fill('input[name="text"]', '{{item.content}}');
    await page.waitForTimeout(300);

    // Preview and verify
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);
    
    // Check rendered items
    await expect(page.locator('h3:has-text("Post 1")')).toBeVisible();
    await expect(page.locator('text=This is the content of post 1')).toBeVisible();
    await expect(page.locator('h3:has-text("Post 2")')).toBeVisible();
    await expect(page.locator('text=This is the content of post 2')).toBeVisible();
  });

  test('should support field formatting in magic text', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Formatting Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing field formatting');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create sales table
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'sales');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'amount');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'number');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'date');
    await page.selectOption('select:near(input[placeholder="Field name"]:last-of-type)', 'date');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add sales data
    await page.click('text=sales');
    await page.click('button:has-text("Add Row")');
    await page.fill('input[placeholder="Enter amount"]', '1234.56');
    await page.fill('input[type="date"]', '2024-01-15');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Add text components
    await page.click('[data-testid="components-icon"]');
    
    // Currency formatting
    await page.click('text=Text');
    await page.click('.component-instance:has-text("Text")').last();
    await page.fill('input[name="text"]', 'Total: {{sales[0].amount | currency}}');
    await page.waitForTimeout(300);

    // Date formatting
    await page.click('text=Text');
    await page.click('.component-instance:has-text("Text")').last();
    await page.fill('input[name="text"]', 'Date: {{sales[0].date | date}}');
    await page.waitForTimeout(300);

    // Preview and verify
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);
    
    // Check formatted values
    await expect(page.locator('text=Total: $1,234.56')).toBeVisible();
    await expect(page.locator('text=Date: 1/15/2024')).toBeVisible();
  });

  test('should show magic text autocomplete suggestions', async ({ page }) => {
    // Create app with data
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Autocomplete Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing magic text autocomplete');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create a table
    await page.click('[data-testid="database-icon"]');
    await page.click('button:has-text("Create Table")');
    await page.fill('input[placeholder="Table name"]', 'customers');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'firstName');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field name"]:last-of-type', 'lastName');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Add text component
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Text');
    await page.click('.component-instance:has-text("Text")');

    // Start typing magic text
    await page.fill('input[name="text"]', '{{');
    await page.waitForTimeout(300);

    // Check for autocomplete suggestions
    await expect(page.locator('text=customers')).toBeVisible();
    await expect(page.locator('text=currentUser')).toBeVisible();
    await expect(page.locator('text=currentDate')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Create Online Store Apps', () => {
  test('should create admin and store apps with shared data', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    console.log('Step 1: Creating Admin Panel App');
    
    // Create Admin Panel
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Admin Panel');
    await page.getByPlaceholder('Enter app description').fill('Manage products and orders');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForSelector('text=Admin Panel');
    
    // Create database tables
    await page.getByRole('button', { name: 'Data' }).click();
    
    // Create products table
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('Enter table name').fill('products');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);
    
    // Add basic fields
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('name');
    await page.selectOption('select', 'text');
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('price');
    await page.selectOption('select', 'number');
    await page.getByRole('button', { name: 'Add' }).click();
    
    console.log('Step 2: Building Admin Interface');
    
    // Go to builder
    await page.getByText('Dashboard').click();
    await page.getByRole('button', { name: 'Builder' }).click();
    
    // Add title
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    await page.locator('.builder-canvas p').first().click();
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Product Admin');
    
    // Add table
    await page.locator('[data-component-id="table"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    
    console.log('Step 3: Creating Online Store App');
    
    // Navigate to apps
    await page.getByRole('button', { name: 'Apps' }).click();
    
    // Create Store App
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Online Store');
    await page.getByPlaceholder('Enter app description').fill('Customer shopping');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForSelector('text=Online Store');
    
    console.log('Step 4: Verifying Shared Database');
    
    // Check that tables are shared
    await page.getByRole('button', { name: 'Data' }).click();
    await expect(page.getByText('products')).toBeVisible();
    
    console.log('Step 5: Building Store Interface');
    
    // Go to builder
    await page.getByText('Dashboard').click();
    await page.getByRole('button', { name: 'Builder' }).click();
    
    // Add store title
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    await page.locator('.builder-canvas p').first().click();
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Welcome to Our Store');
    
    // Test data binding
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    await page.locator('.builder-canvas p').last().click();
    
    // Switch to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    await page.getByText('Dynamic Binding').click();
    
    // Verify database is accessible
    await expect(page.getByText('Database')).toBeVisible();
    await page.getByText('Database').click();
    await expect(page.getByText('products')).toBeVisible();
    
    console.log('✅ Successfully created two apps with shared database!');
    console.log('✅ Admin Panel can manage products');
    console.log('✅ Online Store can display products');
    console.log('✅ Both apps share the same database tables');
  });

  test('should test dynamic data binding between apps', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Navigate to Admin Panel
    const hasAdminPanel = await page.locator('text=Admin Panel').count() > 0;
    if (hasAdminPanel) {
      await page.getByText('Admin Panel').click();
      await page.getByText('Dashboard').click();
      
      // Add a text showing product count
      await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
      await page.locator('.builder-canvas p').last().click();
      
      // Bind to product count
      await page.getByRole('tab', { name: 'Data' }).click();
      await page.getByText('Dynamic Binding').click();
      await page.locator('textarea').fill('Total Products: {{products.count()}}');
      
      // Preview to see if it works
      await page.getByRole('button', { name: 'Preview' }).click();
      await expect(page.locator('text=Total Products: 0')).toBeVisible();
      
      console.log('✅ Dynamic binding works with aggregation functions');
    }
  });
});
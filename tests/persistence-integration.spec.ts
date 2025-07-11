import { test, expect } from '@playwright/test';

test.describe('Persistence Integration', () => {
  test('should persist apps, pages, and tables through localStorage', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Step 1: Create an app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Test Persistence App');
    await page.getByPlaceholder('Enter app description').fill('Testing complete persistence');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForSelector('text=Test Persistence App');
    
    // Verify app is created
    await expect(page.getByRole('button', { name: 'Test Persistence App' })).toBeVisible();
    
    // Step 2: Create a table
    await page.getByRole('button', { name: 'Data' }).click();
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('Enter table name').fill('test_table');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);
    
    // Verify table is created
    await expect(page.getByText('test_table')).toBeVisible();
    
    // Step 3: Add a field to the table
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('test_field');
    await page.selectOption('select', 'text');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Step 4: Create another page
    await page.getByRole('tab', { name: 'Pages' }).click();
    await page.getByRole('button', { name: 'Add Page' }).click();
    await page.getByPlaceholder('Page name').fill('Test Page');
    await page.getByPlaceholder('Page path').fill('/test');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Step 5: Refresh the page
    await page.reload();
    
    // Step 6: Verify everything persisted
    // App should still be selected
    await expect(page.getByRole('button', { name: 'Test Persistence App' })).toBeVisible();
    
    // Check tables
    await page.getByRole('button', { name: 'Data' }).click();
    await expect(page.getByText('test_table')).toBeVisible();
    await expect(page.getByText('test_field')).toBeVisible();
    
    // Check pages
    await page.getByRole('tab', { name: 'Pages' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test Page' })).toBeVisible();
    
    console.log('✅ All persistence tests passed!');
  });
  
  test('should persist across multiple apps', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Create first app if not exists
    const hasFirstApp = await page.getByRole('button', { name: 'First App' }).count() > 0;
    if (!hasFirstApp) {
      await page.getByRole('button', { name: 'Create New App' }).click();
      await page.getByPlaceholder('Enter app name').fill('First App');
      await page.getByRole('button', { name: 'Create App' }).click();
      await page.waitForSelector('text=First App');
    }
    
    // Create second app
    await page.getByRole('button', { name: 'First App' }).click();
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Second App');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForSelector('text=Second App');
    
    // Refresh
    await page.reload();
    
    // Open app selector
    await page.getByRole('button', { name: 'Second App' }).click();
    
    // Both apps should be there
    await expect(page.getByText('First App')).toBeVisible();
    await expect(page.getByText('Second App')).toBeVisible();
  });
});
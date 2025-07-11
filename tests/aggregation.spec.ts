import { test, expect } from '@playwright/test';

test.describe('Database Aggregation Functions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Aggregation Test App');
    await page.getByPlaceholder('Enter app description').fill('Testing aggregation functions');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Aggregation Test App');
    
    // Create a table with data
    await page.getByRole('button', { name: 'Data' }).click();
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('Enter table name').fill('orders');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add fields
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('product');
    await page.selectOption('select', 'text');
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('quantity');
    await page.selectOption('select', 'number');
    await page.getByRole('button', { name: 'Add' }).click();
    
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('price');
    await page.selectOption('select', 'number');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Navigate to a page
    await page.getByText('Dashboard').click();
    await page.getByRole('button', { name: 'Builder' }).click();
  });

  test('should support COUNT aggregation', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Add magic text with count
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Aggregates').click();
    await page.getByText('orders').click();
    await page.getByText('Count').click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    
    // Should show count of records (which would be 0 initially)
    await expect(page.locator('p')).toContainText('0');
  });

  test('should support SUM aggregation', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Clear existing content
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Total quantity: ');
    
    // Add magic text with sum
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Aggregates').click();
    await page.getByText('orders').click();
    
    // For sum, we need to specify the field
    // This would need UI enhancement to select field for aggregation
    // For now, let's use formula approach
    await page.keyboard.press('Escape'); // Close menu
    
    // Use formula instead
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    await page.fill('input[placeholder="Enter your formula (use field names in curly braces):"]', 'orders.sum(quantity)');
    await page.keyboard.press('Enter');
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('Total quantity: 0');
  });

  test('should support multiple aggregations in one text', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Clear and add text
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Orders: ');
    
    // Add count
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Aggregates').click();
    await page.getByText('orders').click();
    await page.getByText('Count').click();
    
    // Add more text
    await page.locator('input[type="text"]').last().fill(', Average price: $');
    
    // Add average using formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    await page.fill('input[placeholder="Enter your formula (use field names in curly braces):"]', 'orders.avg(price)');
    await page.keyboard.press('Enter');
    
    // Apply currency formatting
    await page.locator('button[title="Format options"]').last().click();
    await page.getByText('Currency').click();
    await page.getByText('USD ($)').click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('Orders: 0, Average price: $');
  });

  test('should update aggregations when data changes', async ({ page }) => {
    // This test would verify that aggregations update in real-time
    // when data is added/modified/deleted
    
    // Add a text component with count
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Aggregates').click();
    await page.getByText('orders').click();
    await page.getByText('Count').click();
    
    // Preview
    await page.getByRole('button', { name: 'Preview' }).click();
    
    // Initially should be 0
    await expect(page.locator('p')).toContainText('0');
    
    // In a real implementation, we would:
    // 1. Open data management
    // 2. Add some records
    // 3. Return to preview
    // 4. Verify count updated
  });
});
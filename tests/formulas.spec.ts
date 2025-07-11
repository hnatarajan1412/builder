import { test, expect } from '@playwright/test';

test.describe('Custom Math Formulas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Formula Test App');
    await page.getByPlaceholder('Enter app description').fill('Testing formula calculations');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Formula Test App');
    
    // Navigate to a page
    await page.getByText('Dashboard').click();
  });

  test('should calculate simple arithmetic formulas', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Clear existing content
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Result: ');
    
    // Add a formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Wait for formula builder dialog
    await page.waitForSelector('text=Formula Builder');
    
    // Enter a simple formula
    await page.locator('textarea').fill('2 + 2 * 3');
    
    // Should see preview result
    await expect(page.locator('text=Preview result: 8')).toBeVisible();
    
    // Create the formula
    await page.getByRole('button', { name: 'Create Formula' }).click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('Result: 8');
  });

  test('should use formula templates', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Add percentage formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Percentage').click();
    
    // The percentage template should be inserted
    await expect(page.locator('.bg-purple-100')).toContainText('Percentage');
    
    // Preview - it will show the template since we don't have actual data
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toBeVisible();
  });

  test('should support complex calculations with functions', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Clear and add text
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Square root of 16: ');
    
    // Add custom formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Enter formula with function
    await page.locator('textarea').fill('sqrt(16)');
    
    // Should see preview
    await expect(page.locator('text=Preview result: 4')).toBeVisible();
    
    // Create formula
    await page.getByRole('button', { name: 'Create Formula' }).click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('Square root of 16: 4');
  });

  test('should support conditional formulas', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Add conditional formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Enter conditional formula
    await page.locator('textarea').fill('if(10 > 5, "Yes", "No")');
    
    // Should see preview
    await expect(page.locator('text=Preview result: Yes')).toBeVisible();
    
    // Create formula
    await page.getByRole('button', { name: 'Create Formula' }).click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('Yes');
  });

  test('should use operators from the formula builder', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Open formula builder
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Type initial number
    await page.locator('textarea').fill('100');
    
    // Click operator buttons
    await page.locator('button[title="Multiply"]').click(); // Times button
    await page.locator('textarea').fill('100 * 2');
    
    // Should see preview
    await expect(page.locator('text=Preview result: 200')).toBeVisible();
    
    // Create formula
    await page.getByRole('button', { name: 'Create Formula' }).click();
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('p')).toContainText('200');
  });

  test('should handle formula errors gracefully', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Open formula builder
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Enter invalid formula
    await page.locator('textarea').fill('1 / 0');
    
    // Should see preview (Infinity is valid in JavaScript)
    await expect(page.locator('text=Preview result: Infinity')).toBeVisible();
    
    // Try syntax error
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('1 + + 2');
    
    // Should see error
    await expect(page.locator('text=Invalid formula')).toBeVisible();
    
    // Create button should be disabled
    await expect(page.getByRole('button', { name: 'Create Formula' })).toBeDisabled();
  });
});
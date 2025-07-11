import { test, expect } from '@playwright/test';

test.describe('Magic Text Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Magic Text Test App');
    await page.getByPlaceholder('Enter app description').fill('Testing magic text functionality');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Magic Text Test App');
    
    // Navigate to a page
    await page.getByText('Dashboard').click();
  });

  test('should allow inserting magic text variables in text component', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Wait for properties panel
    await page.waitForSelector('text=Component Properties');
    
    // Test magic text editor
    const magicTextInput = page.locator('.property-input').first();
    
    // Click the + button to open magic text menu
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    
    // Select User > Logged In User > Name
    await page.getByText('User').click();
    await page.getByText('Logged In User').click();
    await page.getByText('Name').first().click();
    
    // Verify the magic text token was inserted
    await expect(page.locator('.bg-blue-100')).toContainText('name');
    
    // Add some static text
    await page.locator('input[type="text"]').last().fill('Welcome, ');
    
    // Test in preview mode
    await page.getByRole('button', { name: 'Preview' }).click();
    
    // Verify the text is processed correctly
    await expect(page.locator('p')).toContainText('Welcome, John Doe');
    
    // Close preview
    await page.locator('[aria-label="Close preview"]').click();
  });

  test('should support date/time magic text', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Click the + button
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    
    // Select Date & Time > Current Date
    await page.getByText('Date & Time').click();
    await page.getByText('Current Date').click();
    
    // Preview and verify date is shown
    await page.getByRole('button', { name: 'Preview' }).click();
    
    // Check that the date is displayed (format: MM/DD/YYYY)
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
    await expect(page.locator('p')).toHaveText(dateRegex);
  });

  test('should support formulas in button labels', async ({ page }) => {
    // Add a button component
    await page.locator('[data-component-id="button"]').dragTo(page.locator('.builder-canvas'));
    
    // Clear existing label
    await page.locator('input[type="text"]').first().clear();
    
    // Add a formula
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('Formulas').click();
    await page.getByText('Custom Formula').click();
    
    // Enter a simple formula
    await page.fill('input[placeholder="Enter your formula (use field names in curly braces):"]', '2 + 2');
    await page.keyboard.press('Enter');
    
    // Preview and verify calculation
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('button')).toContainText('4');
  });

  test('should support magic text in input placeholders', async ({ page }) => {
    // Add an input component
    await page.locator('[data-component-id="input"]').dragTo(page.locator('.builder-canvas'));
    
    // Navigate to placeholder property
    await page.waitForSelector('text=Placeholder');
    
    // Add magic text to placeholder
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('User').click();
    await page.getByText('Logged In User').click();
    await page.getByText('Email').first().click();
    
    // Add prefix text
    await page.locator('input[type="text"]').last().fill('Enter email (e.g. ');
    
    // Add suffix
    await page.locator('input[type="text"]').last().fill(')');
    
    // Preview and verify placeholder
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('input')).toHaveAttribute('placeholder', 'Enter email (e.g. john@example.com)');
  });

  test('should preserve magic text when editing properties', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Add magic text
    await page.getByRole('button', { name: 'Insert dynamic content' }).click();
    await page.getByText('User').click();
    await page.getByText('Logged In User').click();
    await page.getByText('Name').first().click();
    
    // Change text type to Heading 1
    await page.selectOption('select', 'heading1');
    
    // Verify magic text is preserved
    await expect(page.locator('.bg-blue-100')).toContainText('name');
    
    // Preview and verify
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('h1')).toContainText('John Doe');
  });
});
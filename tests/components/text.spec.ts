import { test, expect } from '@playwright/test';

test.describe('Text Component - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add text component and configure all properties', async ({ page }) => {
    // Add a text component
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify text is added
    const text = canvas.locator('p');
    await expect(text).toBeVisible();
    await expect(text).toHaveText('Text');
    
    // Select the text
    await text.click();
    
    // Wait for properties panel
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change text content
    const textArea = page.locator('textarea');
    await textArea.clear();
    await textArea.fill('Welcome to our no-code platform!');
    await expect(text).toHaveText('Welcome to our no-code platform!');
    
    // Change text type to heading
    await page.getByRole('combobox').selectOption('heading1');
    // Component should now be an h1
    const heading = canvas.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Welcome to our no-code platform!');
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply styles
    await page.locator('label:has-text("Font Size")').locator('..').locator('input').fill('24px');
    await page.locator('label:has-text("Font Weight")').locator('..').locator('select').selectOption('700');
    await page.locator('label:has-text("Text Color")').locator('..').locator('input[type="text"]').fill('#1f2937');
    await page.locator('label:has-text("Text Align")').locator('..').locator('select').selectOption('center');
    
    // Test Data Tab for dynamic content
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    await page.getByRole('button', { name: 'Dynamic Binding' }).click();
    
    // Create test data
    await page.getByRole('tab', { name: /Data/i }).nth(0).click();
    await page.getByText('Add Table').click();
    await page.getByPlaceholder('users').fill('content');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('headline');
    await page.locator('select').nth(1).selectOption('text');
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add test data
    await page.locator('.border-gray-200').filter({ hasText: 'content' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Add Record' }).click();
    await page.locator('textarea').last().fill('Dynamic headline from database!');
    await page.locator('button').filter({ has: page.locator('.w-4.h-4') }).first().click(); // Save
    
    // Test Events Tab
    await page.getByRole('tab', { name: /Components/i }).click();
    await heading.click();
    await page.getByRole('tab', { name: /Events/i }).click();
    
    // Add click event
    const addButton = page.locator('button[title="Add Event"]');
    await addButton.click();
    
    await page.waitForTimeout(500);
    const eventItem = page.locator('.border-gray-200').first();
    await eventItem.click();
    
    await page.waitForTimeout(500);
    const actionSelect = page.locator('label:has-text("Action")').locator('..').locator('select');
    await actionSelect.selectOption('showAlert');
    
    await page.getByPlaceholder('Alert message...').fill('Text clicked!');
    
    // Test in Preview Mode
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    // Verify text is rendered
    const previewHeading = page.locator('h1').filter({ hasText: 'Welcome to our no-code platform!' });
    await expect(previewHeading).toBeVisible();
    
    // Verify styles are applied
    await expect(previewHeading).toHaveCSS('font-size', '24px');
    await expect(previewHeading).toHaveCSS('font-weight', '700');
    await expect(previewHeading).toHaveCSS('text-align', 'center');
    
    // Set up dialog handler before triggering the click
    const dialogPromise = page.waitForEvent('dialog');
    
    // Test click event
    await previewHeading.click();
    
    // Handle the alert dialog
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Text clicked!');
    await dialog.accept();
    
    // Close preview
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle different text types correctly', async ({ page }) => {
    // Add text
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const text = canvas.locator('p');
    await text.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Test heading 1
    await page.getByRole('combobox').selectOption('heading1');
    await expect(canvas.locator('h1')).toBeVisible();
    
    // Test heading 2
    await page.getByRole('combobox').selectOption('heading2');
    await expect(canvas.locator('h2')).toBeVisible();
    
    // Test heading 3
    await page.getByRole('combobox').selectOption('heading3');
    await expect(canvas.locator('h3')).toBeVisible();
    
    // Test caption
    await page.getByRole('combobox').selectOption('caption');
    await expect(canvas.locator('span')).toBeVisible();
    
    // Test back to paragraph
    await page.getByRole('combobox').selectOption('paragraph');
    await expect(canvas.locator('p')).toBeVisible();
  });

  test('should support text styling and formatting', async ({ page }) => {
    // Add text
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const text = canvas.locator('p');
    await text.click();
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Test line height
    await page.locator('label:has-text("Line Height")').locator('..').locator('input').fill('1.8');
    
    // Test letter spacing
    await page.locator('label:has-text("Letter Spacing")').locator('..').locator('input').fill('0.05em');
    
    // Test text decoration
    await page.locator('label:has-text("Text Decoration")').locator('..').locator('select').selectOption('underline');
    
    // Test text transform
    await page.locator('label:has-text("Text Transform")').locator('..').locator('select').selectOption('uppercase');
    
    // Verify styles in preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewText = page.locator('p');
    await expect(previewText).toHaveCSS('line-height', '1.8');
    await expect(previewText).toHaveCSS('letter-spacing', '0.05em');
    await expect(previewText).toHaveCSS('text-decoration-line', 'underline');
    await expect(previewText).toHaveCSS('text-transform', 'uppercase');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle multiline text and overflow', async ({ page }) => {
    // Add text
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const text = canvas.locator('p');
    await text.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Add multiline text
    const textArea = page.locator('textarea');
    await textArea.clear();
    await textArea.fill(`This is line one.
This is line two.
This is line three with a very long content that might need to wrap or be truncated depending on the container width.`);
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Set max width
    await page.locator('label:has-text("Max Width")').locator('..').locator('input').fill('300px');
    
    // Test text overflow
    await page.locator('label:has-text("Text Overflow")').locator('..').locator('select').selectOption('ellipsis');
    
    // Test white space
    await page.locator('label:has-text("White Space")').locator('..').locator('select').selectOption('nowrap');
    
    // Verify in preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewText = page.locator('p');
    await expect(previewText).toHaveCSS('max-width', '300px');
    await expect(previewText).toHaveCSS('text-overflow', 'ellipsis');
    await expect(previewText).toHaveCSS('white-space', 'nowrap');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});
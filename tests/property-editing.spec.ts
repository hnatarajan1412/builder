import { test, expect } from '@playwright/test';

test.describe('Property Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('currentApp', JSON.stringify({
        id: 'test-app',
        name: 'Test App',
        pages: ['page-1']
      }));
      localStorage.setItem('currentPage', JSON.stringify({
        id: 'page-1',
        name: 'Test Page',
        components: []
      }));
    });
  });

  test('should edit text component properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add text component
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    await textTile.dragTo(canvas);
    
    // Select it
    const textElement = canvas.locator('p');
    await textElement.click();
    
    // Edit text content
    const textArea = page.getByLabel('Text Content');
    await textArea.fill('Welcome to our website!');
    
    // Change text type to heading
    await page.getByLabel('Text Type').selectOption('heading1');
    
    // Verify changes
    await expect(canvas.locator('h1')).toHaveText('Welcome to our website!');
  });

  test('should edit button properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    
    const button = canvas.locator('button');
    await button.click();
    
    // Edit all button properties
    await page.getByLabel('Button Label').fill('Submit Form');
    await page.getByLabel('Button Type').selectOption('primary');
    await page.getByLabel('Size').selectOption('large');
    await page.getByLabel('Disabled').check();
    
    // Verify changes
    await expect(button).toHaveText('Submit Form');
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass(/large/);
  });

  test('should edit input properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add input
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    await inputTile.dragTo(canvas);
    
    const input = canvas.locator('input');
    await input.click();
    
    // Edit properties
    await page.getByLabel('Placeholder').fill('Enter your email');
    await page.getByLabel('Input Type').selectOption('email');
    await page.getByLabel('Default Value').fill('user@example.com');
    await page.getByLabel('Required').check();
    
    // Verify changes
    await expect(input).toHaveAttribute('placeholder', 'Enter your email');
    await expect(input).toHaveAttribute('type', 'email');
    await expect(input).toHaveValue('user@example.com');
    await expect(input).toHaveAttribute('required');
  });

  test('should edit image properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add image
    const imageTile = page.locator('.component-tile').filter({ hasText: 'Image' });
    await imageTile.dragTo(canvas);
    
    const image = canvas.locator('img');
    await image.click();
    
    // Edit properties
    const newImageUrl = 'https://example.com/new-image.jpg';
    await page.getByLabel('Image Source').fill(newImageUrl);
    await page.getByLabel('Alt Text').fill('Company Logo');
    await page.getByLabel('Object Fit').selectOption('contain');
    
    // Verify changes
    await expect(image).toHaveAttribute('src', newImageUrl);
    await expect(image).toHaveAttribute('alt', 'Company Logo');
    await expect(image).toHaveCSS('object-fit', 'contain');
  });

  test('should edit container properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.dragTo(canvas);
    
    const container = canvas.locator('[data-component-type="container"]');
    await container.click();
    
    // Edit properties
    await page.getByLabel('Layout Type').selectOption('horizontal');
    await page.getByLabel('Gap (px)').fill('24');
    
    // Add children to see layout changes
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(container);
    await buttonTile.dragTo(container);
    
    // Verify layout
    await expect(container).toHaveCSS('display', 'flex');
    await expect(container).toHaveCSS('flex-direction', 'row');
    await expect(container).toHaveCSS('gap', '24px');
  });

  test('should sync property changes immediately', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    
    const button = canvas.locator('button');
    await button.click();
    
    const labelInput = page.getByLabel('Button Label');
    
    // Type character by character and verify immediate updates
    await labelInput.fill('H');
    await expect(button).toHaveText('H');
    
    await labelInput.fill('He');
    await expect(button).toHaveText('He');
    
    await labelInput.fill('Hello');
    await expect(button).toHaveText('Hello');
  });

  test('should handle invalid property values', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.dragTo(canvas);
    
    const container = canvas.locator('[data-component-type="container"]');
    await container.click();
    
    // Try invalid gap value
    const gapInput = page.getByLabel('Gap (px)');
    await gapInput.fill('-10');
    
    // Should either prevent negative or show error
    const value = await gapInput.inputValue();
    expect(parseInt(value)).toBeGreaterThanOrEqual(0);
  });

  test('should preserve properties when switching components', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add two buttons
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    await buttonTile.dragTo(canvas);
    
    const buttons = canvas.locator('button');
    const button1 = buttons.first();
    const button2 = buttons.last();
    
    // Edit first button
    await button1.click();
    await page.getByLabel('Button Label').fill('First Button');
    
    // Edit second button
    await button2.click();
    await page.getByLabel('Button Label').fill('Second Button');
    
    // Switch back to first button
    await button1.click();
    await expect(page.getByLabel('Button Label')).toHaveValue('First Button');
    
    // Switch to second button
    await button2.click();
    await expect(page.getByLabel('Button Label')).toHaveValue('Second Button');
  });

  test('should clear properties panel when deselecting', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add and select button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    await canvas.locator('button').click();
    
    // Properties panel should be visible
    await expect(page.locator('aside').filter({ hasText: 'Properties' })).toBeVisible();
    
    // Click on empty canvas area
    await canvas.click({ position: { x: 10, y: 10 } });
    
    // Properties panel should hide
    await expect(page.locator('aside').filter({ hasText: 'Properties' })).not.toBeVisible();
  });
});
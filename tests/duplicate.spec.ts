import { test, expect } from '@playwright/test';

test.describe('Component Duplication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should duplicate component using button', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Select the button
    const button = canvas.locator('button:has-text("Button")');
    await button.click();
    
    // Click duplicate button
    await page.locator('[title="Duplicate"]').click();
    
    // Should now have 2 buttons
    await expect(canvas.locator('button:has-text("Button")')).toHaveCount(2);
  });

  test('should duplicate component using keyboard shortcut', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a text component
    const textTile = page.locator('.component-tile').filter({ hasText: 'Text' });
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Select the text
    const text = canvas.locator('p:has-text("Text content")');
    await text.click();
    
    // Press Ctrl+D to duplicate
    await page.keyboard.press('Control+d');
    
    // Should now have 2 text components
    await expect(canvas.locator('p:has-text("Text content")')).toHaveCount(2);
  });

  test('should duplicate nested components', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Add a button inside the container
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    
    const container = canvas.locator('[data-component-type="container"]');
    await container.hover();
    await page.mouse.up();
    
    // Select the container
    await container.click();
    
    // Duplicate the container
    await page.locator('[title="Duplicate"]').click();
    
    // Should now have 2 containers, each with a button
    await expect(canvas.locator('[data-component-type="container"]')).toHaveCount(2);
    await expect(canvas.locator('button:has-text("Button")')).toHaveCount(2);
  });

  test('should delete component using keyboard', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add an input
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Select the input
    const input = canvas.locator('input[placeholder="Enter text..."]');
    await input.click();
    
    // Press Delete
    await page.keyboard.press('Delete');
    
    // Input should be gone
    await expect(canvas.locator('input[placeholder="Enter text..."]')).not.toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set up test data
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

  test('should highlight drop zone on drag over', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    // Start dragging
    await buttonTile.hover();
    await page.mouse.down();
    
    // Move over canvas
    await canvas.hover();
    
    // Canvas should show drop indicator
    await expect(canvas).toHaveClass(/drop-zone-active/);
    
    // Release
    await page.mouse.up();
  });

  test('should reorder components within container', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add container first
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.dragTo(canvas);
    
    const container = canvas.locator('[data-component-type="container"]');
    
    // Add two buttons
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(container);
    await page.waitForTimeout(100);
    await buttonTile.dragTo(container);
    
    // Get buttons
    const buttons = container.locator('button');
    const firstButton = buttons.first();
    const secondButton = buttons.last();
    
    // Verify initial order
    await firstButton.click();
    await page.getByLabel('Button Label').fill('Button 1');
    await secondButton.click();
    await page.getByLabel('Button Label').fill('Button 2');
    
    // Drag second button before first
    await secondButton.dragTo(firstButton);
    
    // Verify new order
    const reorderedButtons = container.locator('button');
    await expect(reorderedButtons.first()).toHaveText('Button 2');
    await expect(reorderedButtons.last()).toHaveText('Button 1');
  });

  test('should move component between containers', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add two containers
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.dragTo(canvas);
    await page.waitForTimeout(100);
    await containerTile.dragTo(canvas);
    
    const containers = canvas.locator('[data-component-type="container"]');
    const container1 = containers.first();
    const container2 = containers.last();
    
    // Add button to first container
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(container1);
    
    // Verify button is in first container
    await expect(container1.locator('button')).toBeVisible();
    await expect(container2.locator('button')).not.toBeVisible();
    
    // Move button to second container
    const button = container1.locator('button');
    await button.dragTo(container2);
    
    // Verify button moved
    await expect(container1.locator('button')).not.toBeVisible();
    await expect(container2.locator('button')).toBeVisible();
  });

  test('should not allow invalid drops', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add an input component
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    await inputTile.dragTo(canvas);
    
    const input = canvas.locator('input');
    
    // Try to drop button on input (should not work)
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(input);
    
    // Button should be added to canvas, not inside input
    await expect(canvas.locator('button')).toBeVisible();
    await expect(input.locator('button')).not.toBeVisible();
  });

  test('should handle nested container drops', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add parent container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.dragTo(canvas);
    
    const parentContainer = canvas.locator('[data-component-type="container"]');
    
    // Add child container inside parent
    await containerTile.dragTo(parentContainer);
    
    const childContainer = parentContainer.locator('[data-component-type="container"]');
    await expect(childContainer).toBeVisible();
    
    // Add button to child container
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(childContainer);
    
    // Verify nesting
    await expect(childContainer.locator('button')).toBeVisible();
    await expect(parentContainer.locator('button')).toBeVisible(); // Also visible in parent
  });

  test('should cancel drag on escape key', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    // Start dragging
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    
    // Press escape
    await page.keyboard.press('Escape');
    
    // Release mouse
    await page.mouse.up();
    
    // Button should not be added
    await expect(canvas.locator('button')).not.toBeVisible();
  });

  test('should show visual feedback during drag', async ({ page }) => {
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    // Start dragging
    await buttonTile.hover();
    await page.mouse.down();
    
    // Component should show dragging state
    await expect(buttonTile).toHaveClass(/opacity-50/);
    
    // Move and release
    await page.mouse.move(500, 300);
    await page.mouse.up();
  });

  test('should handle rapid consecutive drops', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    // Rapidly add 5 buttons
    for (let i = 0; i < 5; i++) {
      await buttonTile.dragTo(canvas);
      await page.waitForTimeout(50);
    }
    
    // All 5 buttons should be present
    const buttons = canvas.locator('button');
    await expect(buttons).toHaveCount(5);
  });
});
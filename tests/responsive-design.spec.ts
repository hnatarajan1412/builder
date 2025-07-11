import { test, expect } from '@playwright/test';

test.describe('Responsive Design Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(1000);
  });

  test('should apply responsive styles to components', async ({ page }) => {
    // Create a new app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Responsive Design Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing responsive controls');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add a container component
    await page.click('text=Container');
    await page.waitForTimeout(500);

    // Select the container
    await page.click('.component-instance:has-text("Container")');
    await page.waitForTimeout(500);

    // Navigate to Responsive tab
    await page.click('text=Responsive');
    await page.waitForTimeout(500);

    // Test mobile breakpoint
    await page.click('button[title="< 640px"]');
    
    // Hide on mobile
    await page.click('button:has-text("Visible")');
    await expect(page.locator('button:has-text("Hidden")')).toBeVisible();

    // Set mobile width
    await page.fill('input[placeholder="auto"]', '100');
    await page.selectOption('select:near(input[placeholder="auto"])', '%');

    // Test tablet breakpoint
    await page.click('button[title="640px - 1024px"]');
    
    // Set tablet padding
    await page.fill('input[placeholder="T"]:first-of-type', '20px');
    await page.fill('input[placeholder="R"]:first-of-type', '20px');
    await page.fill('input[placeholder="B"]:first-of-type', '20px');
    await page.fill('input[placeholder="L"]:first-of-type', '20px');

    // Test desktop breakpoint
    await page.click('button[title="> 1024px"]');
    
    // Set flexbox properties
    await page.selectOption('select:has-text("Justify Content")', 'center');
    await page.selectOption('select:has-text("Align Items")', 'center');

    // Verify styles are saved
    await page.click('button[title="< 640px"]');
    await expect(page.locator('text=display:')).toBeVisible();
    await expect(page.locator('text=none')).toBeVisible();

    // Preview in different viewports
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Test mobile view
    await page.click('button[title="Mobile"]:visible');
    await page.waitForTimeout(500);
    
    // Container should be hidden on mobile
    const container = page.locator('.component-instance:has-text("Container")');
    await expect(container).not.toBeVisible();

    // Test desktop view
    await page.click('button[title="Desktop"]:visible');
    await page.waitForTimeout(500);
    
    // Container should be visible on desktop
    await expect(container).toBeVisible();
  });

  test('should handle text alignment responsively', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Text Alignment Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing text alignment');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add text component
    await page.click('text=Text');
    await page.waitForTimeout(500);

    // Select the text component
    await page.click('.component-instance:has-text("Text")');
    await page.waitForTimeout(500);

    // Go to Responsive tab
    await page.click('text=Responsive');
    await page.waitForTimeout(500);

    // Set mobile text alignment
    await page.click('button[title="< 640px"]');
    await page.click('button[aria-label="Align Center"]');

    // Set tablet text alignment
    await page.click('button[title="640px - 1024px"]');
    await page.click('button[aria-label="Align Right"]');

    // Set desktop text alignment
    await page.click('button[title="> 1024px"]');
    await page.click('button[aria-label="Align Left"]');

    // Verify styles summary
    await expect(page.locator('text=textAlign:')).toBeVisible();
    await expect(page.locator('text=left')).toBeVisible();
  });

  test('should remove responsive styles', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Remove Styles Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing style removal');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add component
    await page.click('text=Container');
    await page.click('.component-instance:has-text("Container")');
    await page.click('text=Responsive');

    // Add some styles
    await page.fill('input[placeholder="auto"]', '500px');
    await page.fill('input[placeholder="T"]:first-of-type', '10px');

    // Verify styles are added
    await expect(page.locator('text=width:')).toBeVisible();
    await expect(page.locator('text=paddingTop:')).toBeVisible();

    // Remove width style
    await page.click('button:near(text=width:) .w-3');
    await expect(page.locator('text=width:')).not.toBeVisible();

    // Remove padding style
    await page.click('button:near(text=paddingTop:) .w-3');
    await expect(page.locator('text=paddingTop:')).not.toBeVisible();
  });
});
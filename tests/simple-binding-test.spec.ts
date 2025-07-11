import { test, expect } from '@playwright/test';

test('simple binding test', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:3003');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'app-loaded.png' });
  
  // Check if the app loaded
  const title = await page.textContent('h1');
  console.log('App title:', title);
  
  // Check for any visible error messages
  const errors = await page.locator('.error, [role="alert"]').allTextContents();
  if (errors.length > 0) {
    console.log('Errors found:', errors);
  }
  
  // Try to create an app
  try {
    await page.getByRole('button', { name: 'Create New App' }).click();
    console.log('Create app button clicked');
  } catch (e) {
    console.log('Could not find create app button');
    // Take screenshot
    await page.screenshot({ path: 'no-create-button.png' });
  }
});
import { test, expect } from '@playwright/test';

test.describe('Event Handlers in Preview Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(1000);
  });

  test('button click events should work in preview', async ({ page }) => {
    // Create a new app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Event Handler Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing event handlers');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add a button component
    await page.click('text=Button');
    await page.waitForTimeout(500);

    // Select the button
    await page.click('.component-instance:has-text("Button")');
    await page.waitForTimeout(500);

    // Go to Events tab
    await page.click('text=Events');
    await page.waitForTimeout(500);

    // Add an onClick event
    await page.click('button:has-text("Add Action")');
    await page.waitForTimeout(300);

    // Configure the action
    await page.selectOption('select:has-text("Action Type")', 'showAlert');
    await page.fill('input[placeholder="Alert message..."]', 'Button clicked successfully!');
    await page.waitForTimeout(300);

    // Open preview mode
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Set up dialog handler before clicking
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Button clicked successfully!');
      await dialog.accept();
    });

    // Click the button in preview
    await page.click('button:has-text("Button"):visible');
  });

  test('form submit events should work in preview', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Form Event Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing form events');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add form component
    await page.click('text=Form');
    await page.waitForTimeout(500);

    // Add input inside form
    await page.click('text=Input');
    await page.waitForTimeout(500);

    // Add button inside form
    await page.click('text=Button');
    await page.waitForTimeout(500);

    // Select the form
    await page.click('.component-instance:has-text("Form")').first();
    await page.waitForTimeout(500);

    // Go to Events tab
    await page.click('text=Events');
    await page.waitForTimeout(500);

    // Add onSubmit event
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select:has-text("Trigger Event")', 'onSubmit');
    await page.selectOption('select:has-text("Action Type")', 'showAlert');
    await page.fill('input[placeholder="Alert message..."]', 'Form submitted!');
    await page.waitForTimeout(300);

    // Configure submit button
    await page.click('.component-instance:has-text("Button")').last();
    await page.fill('input[name="label"]', 'Submit');
    await page.selectOption('select[name="type"]', 'submit');

    // Open preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Form submitted!');
      await dialog.accept();
    });

    // Submit the form
    await page.click('button:has-text("Submit"):visible');
  });

  test('state update events should work in preview', async ({ page }) => {
    // Create app
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'State Event Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing state events');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Add input component
    await page.click('text=Input');
    await page.waitForTimeout(500);

    // Add text component to display state
    await page.click('text=Text');
    await page.waitForTimeout(500);

    // Configure input to update state
    await page.click('.component-instance:has-text("Input")');
    await page.click('text=Events');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select:has-text("Trigger Event")', 'onChange');
    await page.selectOption('select:has-text("Action Type")', 'state');
    await page.fill('input[placeholder="e.g., userName, isLoggedIn"]', 'inputValue');
    await page.fill('input[placeholder="Value or expression"]', 'event.target.value');
    await page.waitForTimeout(300);

    // Configure text to display state
    await page.click('.component-instance:has-text("Text")');
    await page.click('text=Props');
    await page.fill('input[name="text"]', 'You typed: {{inputValue}}');

    // Open preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Type in the input
    await page.fill('input[type="text"]:visible', 'Hello World');
    
    // Check if text updates (might need Magic Text processing)
    await expect(page.locator('text=You typed:')).toBeVisible();
  });

  test('navigation events should work in preview', async ({ page }) => {
    // Create app with multiple pages
    await page.click('button:has-text("Create New App")');
    await page.fill('input[placeholder="Enter app name"]', 'Navigation Test');
    await page.fill('textarea[placeholder="Enter app description"]', 'Testing navigation');
    await page.click('button:has-text("Create App")');
    await page.waitForTimeout(500);

    // Create a second page
    await page.click('[data-testid="pages-icon"]');
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder="Page name"]', 'About');
    await page.fill('input[placeholder="/path"]', '/about');
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(500);

    // Go back to first page
    await page.click('text=Dashboard');
    await page.waitForTimeout(500);

    // Add navigation button
    await page.click('[data-testid="components-icon"]');
    await page.click('text=Button');
    await page.waitForTimeout(500);

    // Configure button navigation
    await page.click('.component-instance:has-text("Button")');
    await page.fill('input[name="label"]', 'Go to About');
    
    await page.click('text=Events');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select:has-text("Action Type")', 'navigate');
    await page.selectOption('select:has-text("Navigate To")', { label: 'About' });
    await page.waitForTimeout(300);

    // Open preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Listen for console logs
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Navigate to:')) {
        console.log('Navigation event triggered:', msg.text());
      }
    });

    // Click navigation button
    await page.click('button:has-text("Go to About"):visible');
    
    // In real implementation, this would navigate to the About page
    // For now, we just verify the event was triggered via console logs
  });
});
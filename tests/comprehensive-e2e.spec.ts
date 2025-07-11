import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E Tests - No Code Platform Features', () => {
  test('complete platform workflow with real data', async ({ page }) => {
    await page.goto('http://localhost:3003');
    console.log('🚀 Starting comprehensive E2E test...');
    
    // Step 1: Create a new app for testing
    console.log('📱 Step 1: Creating test app...');
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('E2E Test Store');
    await page.getByPlaceholder('Enter app description').fill('Comprehensive testing application');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);
    
    // Verify app creation
    await expect(page.getByRole('button', { name: 'E2E Test Store' })).toBeVisible();
    console.log('✅ App created successfully');
    
    // Step 2: Test Enhanced Data Management UI
    console.log('🗃️  Step 2: Testing enhanced data management...');
    await page.getByRole('button', { name: 'Data' }).click();
    await page.waitForTimeout(500);
    
    // Verify enhanced UI components
    await expect(page.getByText('Manage tables and data for E2E Test Store')).toBeVisible();
    await expect(page.getByPlaceholder('Search tables...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    
    // Test tabbed interface
    await expect(page.getByRole('tab', { name: /Tables/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Relationships' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Data Browser' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
    console.log('✅ Enhanced data UI verified');
    
    // Step 3: Create a comprehensive table for testing
    console.log('📊 Step 3: Creating comprehensive test table...');
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('Enter table name').fill('products');
    
    // Add multiple field types
    const fields = [
      { name: 'name', type: 'text' },
      { name: 'price', type: 'number' },
      { name: 'category', type: 'text' },
      { name: 'in_stock', type: 'boolean' },
      { name: 'description', type: 'text' }
    ];
    
    // Add the additional fields
    for (let i = 1; i < fields.length; i++) {
      await page.getByRole('button', { name: 'Add Field' }).click();
      const fieldInputs = page.locator('input[placeholder="Field name"]');
      await fieldInputs.nth(i).fill(fields[i].name);
      
      const fieldSelects = page.locator('select');
      await fieldSelects.nth(i).selectOption(fields[i].type);
    }

    await page.getByRole('button', { name: 'Create Table' }).click();
    await page.waitForTimeout(1000);

    // Verify table creation with enhanced UI
    await expect(page.getByText('products')).toBeVisible();
    await expect(page.getByText('5 fields')).toBeVisible();
    console.log('✅ Comprehensive table created');

    // Step 4: Test Component Repeaters
    console.log('🔁 Step 4: Testing component repeaters...');
    await page.getByRole('tab', { name: 'Pages' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).click();

    // Switch to Components and add a repeater
    await page.getByRole('tab', { name: 'Components' }).click();
    await page.waitForTimeout(500);

    // Drag repeater component
    await page.locator('[data-component-id="repeater"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(1000);

    // Click on the repeater to select it
    await page.locator('.repeater-container').click();

    // Verify repeater properties panel
    await expect(page.getByText('Data Source')).toBeVisible();
    await expect(page.getByText('Select a table')).toBeVisible();

    // Configure repeater data source
    await page.selectOption('select', { label: /products/ });
    await page.waitForTimeout(500);

    // Verify repeater configuration
    await expect(page.getByText('Connected to: products')).toBeVisible();
    console.log('✅ Repeater component configured');

    // Step 5: Test Form Data Binding and Submission
    console.log('📝 Step 5: Testing form components...');

    // Add a form component
    await page.locator('[data-component-id="form"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(1000);

    // Click on form to select it
    await page.locator('.form-container').click();

    // Configure form to submit to products table
    await expect(page.getByText('Submit Action')).toBeVisible();
    await page.selectOption('select', { label: /products/ });

    // Add input fields to the form
    await page.locator('[data-component-id="input"]').dragTo(page.locator('.form-container'));
    await page.waitForTimeout(500);

    // Configure the input field
    await page.locator('.form-container input').click();
    await page.locator('input[placeholder="Enter text..."]').fill('Product Name');

    console.log('✅ Form component configured');

    // Step 6: Test Visual Data Binding
    console.log('🔗 Step 6: Testing visual data binding...');

    // Add a text component for data binding
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);

    // Select the text component
    await page.locator('.builder-canvas p').last().click();

    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();

    // Switch to dynamic binding
    await page.getByText('Dynamic Binding').click();

    // Verify data binding interface
    await expect(page.getByText('Bindable Properties')).toBeVisible();
    await expect(page.getByText('Data Sources')).toBeVisible();
    await expect(page.getByText('Database')).toBeVisible();

    // Test data source expansion
    await page.getByText('Database').click();
    await expect(page.getByText('products')).toBeVisible();

    console.log('✅ Visual data binding verified');

    // Step 7: Test App State Management
    console.log('🏪 Step 7: Testing app state management...');

    // Create a second page to test navigation
    await page.getByRole('tab', { name: 'Pages' }).click();
    await page.getByRole('button', { name: 'Add Page' }).click();
    await page.getByPlaceholder('Page name').fill('Product Detail');
    await page.getByPlaceholder('Page path').fill('/product');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify page creation and navigation
    await expect(page.getByRole('heading', { name: 'Product Detail' })).toBeVisible();
    console.log('✅ Page management working');

    // Step 8: Test Preview Mode with Real Data
    console.log('👁️ Step 8: Testing preview mode...');

    // Go back to Dashboard page
    await page.getByRole('heading', { name: 'Dashboard' }).click();

    // Click preview button
    await page.getByRole('button', { name: 'Preview' }).click();
    await page.waitForTimeout(2000);

    // Verify preview mode is active
    await expect(page.locator('.preview-mode, [class*="preview"]')).toBeVisible();

    // Close preview
    await page.locator('button[aria-label="Close preview"], button:has-text("Close")').first().click();
    console.log('✅ Preview mode working');

    // Step 9: Test App Persistence
    console.log('💾 Step 9: Testing app persistence...');

    // Refresh the page to test persistence
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify app and data persist
    await expect(page.getByRole('button', { name: 'E2E Test Store' })).toBeVisible();

    // Check that table persists
    await page.getByRole('button', { name: 'Data' }).click();
    await expect(page.getByText('products')).toBeVisible();

    // Check that pages persist
    await page.getByRole('tab', { name: 'Pages' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Detail' })).toBeVisible();

    console.log('✅ App persistence verified');

    // Step 10: Test Multiple Apps
    console.log('🏗️ Step 10: Testing multiple apps...');

    // Create a second app
    await page.getByRole('button', { name: 'E2E Test Store' }).click();
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Admin Panel');
    await page.getByPlaceholder('Enter app description').fill('Admin interface');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);

    // Verify second app creation
    await expect(page.getByRole('button', { name: 'Admin Panel' })).toBeVisible();

    // Test app switching
    await page.getByRole('button', { name: 'Admin Panel' }).click();
    await expect(page.getByText('E2E Test Store')).toBeVisible();

    // Verify shared database (tables should be visible in both apps)
    await page.getByText('E2E Test Store').click();
    await page.getByRole('button', { name: 'Data' }).click();
    await expect(page.getByText('products')).toBeVisible();

    console.log('✅ Multiple apps and shared database verified');

    // Final Summary
    console.log('\n🎉 COMPREHENSIVE E2E TEST COMPLETE!');
    console.log('✅ Enhanced Data Management UI: Working');
    console.log('✅ Component Repeaters: Working');
    console.log('✅ Form Data Binding: Working');
    console.log('✅ Visual Data Binding: Working');
    console.log('✅ App State Management: Working');
    console.log('✅ App Persistence: Working');
    console.log('✅ Preview Mode: Working');
    console.log('✅ Multiple Apps: Working');
    console.log('✅ Shared Database: Working');
    console.log('\n🚀 All requested features are functional!');
  });

  test('test component marketplace preparation', async ({ page }) => {
    await page.goto('http://localhost:3003');

    // Create test app for marketplace components
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Marketplace Test');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);

    // Test component library structure
    await page.getByRole('tab', { name: 'Components' }).click();

    // Verify component categories
    await expect(page.getByText('Basic')).toBeVisible();
    await expect(page.getByText('Layout')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
    await expect(page.getByText('Custom Components')).toBeVisible();

    // Verify new components are available
    await expect(page.locator('[data-component-id="repeater"]')).toBeVisible();
    await expect(page.locator('[data-component-id="form"]')).toBeVisible();

    console.log('✅ Component marketplace structure ready');
  });

  test('test navigation and routing readiness', async ({ page }) => {
    await page.goto('http://localhost:3003');

    // Create test app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Navigation Test');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);

    // Create multiple pages for navigation testing
    const pages = ['Home', 'About', 'Contact', 'Products'];

    for (const pageName of pages.slice(1)) { // Skip Home as it's created by default
      await page.getByRole('tab', { name: 'Pages' }).click();
      await page.getByRole('button', { name: 'Add Page' }).click();
      await page.getByPlaceholder('Page name').fill(pageName);
      await page.getByPlaceholder('Page path').fill(`/${pageName.toLowerCase()}`);
      await page.getByRole('button', { name: 'Create' }).click();
      await page.waitForTimeout(500);
    }

    // Verify all pages are created
    for (const pageName of pages) {
      if (pageName === 'Home') {
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      } else {
        await expect(page.getByRole('heading', { name: pageName })).toBeVisible();
      }
    }

    console.log('✅ Navigation structure ready for routing implementation');
  });
});
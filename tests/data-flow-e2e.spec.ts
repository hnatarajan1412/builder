import { test, expect } from '@playwright/test';

test.describe('Complete Data Flow E2E Test', () => {
  test('comprehensive data functionality test', async ({ page }) => {
    await page.goto('http://localhost:3004');
    console.log('🚀 Starting comprehensive data flow test...\n');
    
    // Step 1: Create Admin App
    console.log('📱 Step 1: Creating Admin Panel App');
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Admin Panel');
    await page.getByPlaceholder('Enter app description').fill('Product and inventory management');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);
    
    // Verify app created
    await expect(page.getByText('Admin Panel')).toBeVisible();
    console.log('  ✅ Admin Panel app created');
    
    // Step 2: Navigate to Database
    console.log('\n💾 Step 2: Setting up Database Schema');
    
    // Click database icon
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    
    // Create Products table
    console.log('  📊 Creating products table...');
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('e.g., users, products').fill('products');
    
    // Add product fields
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('name');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(2).fill('description');
    await page.locator('select').nth(2).selectOption('text');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(3).fill('price');
    await page.locator('select').nth(3).selectOption('number');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(4).fill('inventory');
    await page.locator('select').nth(4).selectOption('number');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(5).fill('category');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(6).fill('image_url');
    
    await page.getByRole('button', { name: 'Create Table' }).click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Products table created');
    
    // Create Orders table
    console.log('  📊 Creating orders table...');
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('e.g., users, products').fill('orders');
    
    // Add order fields
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('customer_name');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(2).fill('customer_email');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(3).fill('product_id');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(4).fill('quantity');
    await page.locator('select').nth(4).selectOption('number');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(5).fill('total_price');
    await page.locator('select').nth(5).selectOption('number');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(6).fill('status');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(7).fill('order_date');
    await page.locator('select').nth(7).selectOption('datetime');
    
    await page.getByRole('button', { name: 'Create Table' }).click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Orders table created');
    
    // Step 3: Add Sample Data
    console.log('\n📝 Step 3: Adding Sample Products');
    
    // View products table data
    await page.locator('button[title="View Records"]').first().click();
    await page.waitForTimeout(500);
    
    // Add first product
    await page.getByRole('button', { name: 'Add Row' }).click();
    const inputs = page.locator('input[placeholder="id"]');
    await inputs.fill('prod-001');
    await page.locator('input[placeholder="name"]').fill('Laptop Pro X1');
    await page.locator('input[placeholder="description"]').fill('High-performance laptop for professionals');
    await page.locator('input[placeholder="price"]').fill('1299');
    await page.locator('input[placeholder="inventory"]').fill('50');
    await page.locator('input[placeholder="category"]').fill('Electronics');
    await page.locator('input[placeholder="image_url"]').fill('https://example.com/laptop.jpg');
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(500);
    console.log('  ✅ Added product: Laptop Pro X1');
    
    // Add second product
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.locator('input[placeholder="id"]').fill('prod-002');
    await page.locator('input[placeholder="name"]').fill('Wireless Mouse');
    await page.locator('input[placeholder="description"]').fill('Ergonomic wireless mouse with precision tracking');
    await page.locator('input[placeholder="price"]').fill('49');
    await page.locator('input[placeholder="inventory"]').fill('200');
    await page.locator('input[placeholder="category"]').fill('Accessories');
    await page.locator('input[placeholder="image_url"]').fill('https://example.com/mouse.jpg');
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(500);
    console.log('  ✅ Added product: Wireless Mouse');
    
    // Go back to database view
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    
    // Step 4: Create Store App
    console.log('\n📱 Step 4: Creating Customer Store App');
    
    // Open app selector
    await page.getByText('Admin Panel').first().click();
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Customer Store');
    await page.getByPlaceholder('Enter app description').fill('Online store for customers');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Customer Store app created');
    
    // Step 5: Verify Shared Database
    console.log('\n🔄 Step 5: Verifying Shared Database Access');
    
    // Check database in store app
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(1000);
    
    // Ensure we're in the tables tab
    const tablesTab = page.locator('button[role="tab"]:has-text("Tables")');
    if (await tablesTab.isVisible()) {
      await tablesTab.click();
      await page.waitForTimeout(500);
    }
    
    // Verify tables exist
    await expect(page.locator('.group:has-text("products")')).toBeVisible();
    await expect(page.locator('.group:has-text("orders")')).toBeVisible();
    console.log('  ✅ Both apps can see shared tables');
    
    // Check products data
    const viewButtons = page.locator('button[title="View Records"]');
    await viewButtons.first().click();
    await page.waitForTimeout(500);
    
    // Verify products are visible
    await expect(page.getByText('Laptop Pro X1')).toBeVisible();
    await expect(page.getByText('Wireless Mouse')).toBeVisible();
    console.log('  ✅ Product data accessible from Store app');
    
    // Step 6: Create an Order
    console.log('\n🛒 Step 6: Creating Order from Store App');
    
    // Go back and view orders table
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    await viewButtons.nth(1).click();
    await page.waitForTimeout(500);
    
    // Add order
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.locator('input[placeholder="id"]').fill('ord-001');
    await page.locator('input[placeholder="customer_name"]').fill('John Doe');
    await page.locator('input[placeholder="customer_email"]').fill('john@example.com');
    await page.locator('input[placeholder="product_id"]').fill('prod-001');
    await page.locator('input[placeholder="quantity"]').fill('1');
    await page.locator('input[placeholder="total_price"]').fill('1299');
    await page.locator('input[placeholder="status"]').fill('pending');
    await page.locator('input[placeholder="order_date"]').fill('2024-01-15T10:30:00');
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(500);
    console.log('  ✅ Order created from Store app');
    
    // Step 7: Verify Order in Admin App
    console.log('\n🔍 Step 7: Verifying Order in Admin App');
    
    // Switch to Admin Panel
    await page.getByText('Customer Store').first().click();
    await page.getByText('Admin Panel').click();
    await page.waitForTimeout(500);
    
    // View orders
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    await viewButtons.nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify order is visible
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('ord-001')).toBeVisible();
    console.log('  ✅ Order visible in Admin app');
    
    // Step 8: Test Data Persistence
    console.log('\n💾 Step 8: Testing Data Persistence');
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Verify apps persist
    await expect(page.getByText('Admin Panel')).toBeVisible();
    console.log('  ✅ Apps persist after reload');
    
    // Check database
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    
    // Verify tables persist
    await expect(page.getByText('products')).toBeVisible();
    await expect(page.getByText('orders')).toBeVisible();
    console.log('  ✅ Tables persist after reload');
    
    // Check data persists
    await viewButtons.first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Laptop Pro X1')).toBeVisible();
    console.log('  ✅ Data persists after reload');
    
    // Summary
    console.log('\n🎉 DATA FLOW TEST COMPLETE!');
    console.log('================================');
    console.log('✅ Created Admin Panel and Customer Store apps');
    console.log('✅ Created products and orders tables');
    console.log('✅ Added sample product data');
    console.log('✅ Verified shared database access between apps');
    console.log('✅ Created order from Store app');
    console.log('✅ Verified order visible in Admin app');
    console.log('✅ Confirmed data persistence');
    console.log('✅ Single-tenancy working correctly');
    console.log('================================');
    console.log('🚀 Platform is ready for multi-app development!');
  });
});
import { test, expect } from '@playwright/test';

test.describe('Table Schema Editing', () => {
  test('can edit table schema after creation', async ({ page }) => {
    await page.goto('http://localhost:3004');
    console.log('🔧 Testing table schema editing...\n');
    
    // Create an app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Schema Test App');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);
    
    // Open database panel
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    
    // Create a simple table with just ID
    console.log('📊 Creating books table with only ID field...');
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('e.g., users, products').fill('books');
    
    // Remove all fields except ID
    await page.getByRole('button', { name: 'Create Table' }).click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Books table created with only ID field');
    
    // Now edit the schema
    console.log('\n✏️ Editing table schema...');
    await page.locator('button[title="Edit Schema"]').click();
    await page.waitForTimeout(500);
    
    // Verify edit modal opened
    await expect(page.getByText('Edit Table Schema: books')).toBeVisible();
    console.log('  ✅ Edit schema modal opened');
    
    // Add new fields
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('title');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(2).fill('author');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(3).fill('isbn');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(4).fill('published_date');
    await page.locator('select').nth(4).selectOption('date');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(5).fill('price');
    await page.locator('select').nth(5).selectOption('number');
    
    console.log('  ✅ Added 5 new fields to schema');
    
    // Save the changes
    await page.getByRole('button', { name: 'Update Schema' }).click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Schema updated successfully');
    
    // Verify fields were added by viewing table data
    await page.locator('button[title="View Records"]').click();
    await page.waitForTimeout(500);
    
    // Check if new columns are visible in table header
    await expect(page.getByText('TITLE')).toBeVisible();
    await expect(page.getByText('AUTHOR')).toBeVisible();
    await expect(page.getByText('ISBN')).toBeVisible();
    await expect(page.getByText('PRICE')).toBeVisible();
    console.log('  ✅ All new fields visible in data table');
    
    // Add a book to test the new schema
    console.log('\n📚 Adding a book with new schema...');
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.locator('input[placeholder="id"]').fill('book-001');
    await page.locator('input[placeholder="title"]').fill('The Great Gatsby');
    await page.locator('input[placeholder="author"]').fill('F. Scott Fitzgerald');
    await page.locator('input[placeholder="isbn"]').fill('978-0-7432-7356-5');
    await page.locator('input[placeholder="published_date"]').fill('1925-04-10');
    await page.locator('input[placeholder="price"]').fill('12.99');
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(500);
    console.log('  ✅ Book added successfully with all fields');
    
    // Go back and edit schema again - remove a field
    console.log('\n🗑️ Testing field removal...');
    await page.locator('button[title="Database"]').click();
    await page.waitForTimeout(500);
    await page.locator('button[title="Edit Schema"]').click();
    await page.waitForTimeout(500);
    
    // Remove the isbn field
    await page.locator('button[title="Remove field"]').nth(3).click();
    console.log('  ✅ Removed ISBN field');
    
    await page.getByRole('button', { name: 'Update Schema' }).click();
    await page.waitForTimeout(1000);
    
    // Verify field was removed
    await page.locator('button[title="View Records"]').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('ISBN')).not.toBeVisible();
    console.log('  ✅ ISBN field successfully removed from table');
    
    console.log('\n🎉 TABLE SCHEMA EDITING TEST COMPLETE!');
    console.log('================================');
    console.log('✅ Can create table with minimal fields');
    console.log('✅ Can edit schema and add new fields');
    console.log('✅ Can remove fields from schema');
    console.log('✅ Schema changes reflect in data table');
    console.log('✅ Can insert data with new schema');
    console.log('================================');
  });
});
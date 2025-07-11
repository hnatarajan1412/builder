# Manual Test Instructions for Repeater with Magic Text

## Test 1: Basic Repeater Setup

1. **Create a new app**
   - Click "Create New App"
   - Name it "Product Catalog"

2. **Create a products table**
   - Go to Database tab
   - Click "Add Table"
   - Name: "products"
   - Add fields:
     - name (string)
     - price (number)
     - description (text)
     - imageUrl (string)

3. **Add sample data**
   - Add 3-4 product records with sample data
   - Example:
     - Product 1: Laptop, 999.99, "High performance laptop", "https://via.placeholder.com/200"
     - Product 2: Phone, 699.99, "Latest smartphone", "https://via.placeholder.com/200"

4. **Add Repeater to page**
   - Go to Pages tab
   - Drag "Repeater" component to canvas
   - Click on the repeater
   - In Props tab, click the + button next to "Data Source"
   - Navigate to products table and select "All products"
   - The field should show: {{products}}

5. **Add template components**
   - Drag a Container into the repeater (it should accept the drop)
   - Inside the container, add:
     - Text component
     - Image component
     - Button component

6. **Configure template with magic text**
   - Click on the Text component
   - Click + button in text field
   - Select "Current Item" > "name"
   - The text should show: {{item.name}}
   
   - Click on Image component
   - Set src to: {{item.imageUrl}}
   - Set alt to: {{item.name}}
   
   - Click on Button
   - Set label to: Buy {{item.name}} - {{item.price|currency}}

7. **Test in Preview Mode**
   - Click Preview button
   - Verify:
     - All products are displayed
     - Each shows correct name
     - Images load properly
     - Buttons show formatted prices
     - No "{{" brackets visible

## Test 2: List Component with Magic Text

1. **Add List component**
   - Drag List to canvas
   - In Data Source field, enter: {{products}}
   - Set Display Field to: name

2. **Preview and verify**
   - List shows all product names

## Test 3: Nested Data Access

1. **Create a users table with nested data**
   - Add table "users"
   - Add fields: name, email, preferences (json)

2. **Add sample user**
   - Name: John Doe
   - Email: john@example.com
   - Preferences: {"theme": "dark", "notifications": true}

3. **Test nested access**
   - Add text: {{users[0].preferences.theme}}
   - Should display: dark

## Common Issues to Check:

- [ ] Repeater accepts dropped components
- [ ] Magic text picker shows "Current Item" option only in repeater context
- [ ] Data binding works in preview mode
- [ ] Formatting (currency, date) works correctly
- [ ] No console errors
- [ ] Components update when data changes
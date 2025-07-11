# Manual Test Steps for Repeater with Magic Text

## Test Scenario: Product Catalog with Repeater

### 1. Setup Database
1. Open the app at http://localhost:3006
2. Create a new app or use existing one
3. Go to Database tab
4. Create a "products" table with fields:
   - name (string)
   - price (number)
   - description (text)
5. Add 2-3 sample products

### 2. Add Repeater Component
1. Go to Pages tab
2. Drag "Repeater" from the component palette to the canvas
3. Click on the repeater to select it

### 3. Configure Data Source
1. In the Properties panel, find "Data Source" field
2. Type: `{{products}}`
3. The repeater should show "Template (edit here):" section

### 4. Design Template
1. Drag a Container into the template area
2. Inside the container, add:
   - Text component for product name
   - Text component for price
   - Button component

### 5. Configure Template Components
1. Click on the first text component
2. In the text field, click the "+" button
3. Select "Current Item" > "name"
4. The field should show: `{{item.name}}`

5. Click on the second text component
6. Type: `Price: {{item.price|currency}}`

7. Click on the button
8. Set label to: `Buy {{item.name}}`

### 6. Preview
1. Click the Preview button
2. You should see:
   - Each product displayed in its own container
   - Product names showing correctly
   - Prices formatted as currency (e.g., $99.99)
   - Buttons with product names

### Expected Results
- ✅ Repeater accepts dropped components
- ✅ Magic Text picker shows "Current Item" option
- ✅ Data is displayed correctly in preview
- ✅ Formatting works (currency)
- ✅ No error messages in console

### Common Issues to Check
1. If data doesn't show:
   - Check if table name is correct
   - Ensure there's data in the table
   - Check console for errors

2. If "Current Item" doesn't appear:
   - Make sure the component is inside the repeater template
   - Try refreshing the page

3. If formatting doesn't work:
   - Check the syntax: `{{value|format}}`
   - Supported formats: currency, date, percentage, number:2
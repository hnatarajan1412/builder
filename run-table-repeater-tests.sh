#!/bin/bash

echo "Running Table and Repeater Component Tests..."
echo "============================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the specific test file
echo "Running automated tests..."
npm test -- src/tests/table-repeater-tests.tsx --watchAll=false

# Show manual test guide
echo ""
echo "============================================"
echo "Automated tests complete!"
echo ""
echo "For manual testing, please follow the guide in:"
echo "  test-table-repeater-comprehensive.md"
echo ""
echo "Quick start for manual testing:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3006"
echo "3. Create test tables (products, users, orders)"
echo "4. Follow test scenarios in the guide"
echo ""
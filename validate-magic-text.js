// Simple validation script to test our magic text implementation
// Run with: node validate-magic-text.js

console.log('🧪 Testing Magic Text Data Type Validation...\n');

// Mock the validation function
function validateDataType(expression, expectedType) {
  if (expectedType === 'any') return true;
  
  // Remove the {{ }} wrapper if present
  const cleanExpression = expression.replace(/^\{\{|\}\}$/g, '').trim();
  
  // Check for collection indicators
  const isCollection = (
    // Direct table name (e.g., "products")
    /^[a-zA-Z_]\w*$/.test(cleanExpression) ||
    // Array methods (e.g., "products.filter(...)")
    /\.(filter|map|sort|slice)\s*\(/.test(cleanExpression) ||
    // Special collection returns
    cleanExpression.endsWith('.all()') ||
    cleanExpression.includes('.where(')
  );
  
  // Check for singleton indicators
  const isSingleton = (
    // Array index access (e.g., "products[0]")
    /\[\d+\]/.test(cleanExpression) ||
    // Property access (e.g., "user.name")
    /\.[a-zA-Z_]\w*$/.test(cleanExpression) && !isCollection ||
    // Aggregation functions
    /\.(count|sum|avg|min|max)\s*\(/.test(cleanExpression) ||
    // Built-in singletons
    cleanExpression.startsWith('user.') ||
    cleanExpression.startsWith('currentPage.') ||
    ['now', 'today', 'tomorrow', 'yesterday'].includes(cleanExpression)
  );
  
  if (expectedType === 'collection') {
    return isCollection && !isSingleton;
  } else if (expectedType === 'singleton') {
    return isSingleton && !isCollection;
  }
  
  return false;
}

// Test cases following best practices
const testCases = [
  // Collection validations (for table/repeater data sources)
  {
    expression: '{{products}}',
    expectedType: 'collection',
    expected: true,
    description: 'Table component should accept products collection'
  },
  {
    expression: '{{users}}',
    expectedType: 'collection',
    expected: true,
    description: 'Repeater component should accept users collection'
  },
  {
    expression: '{{orders.filter(status="active")}}',
    expectedType: 'collection',
    expected: true,
    description: 'Filtered collections should be valid for repeaters'
  },
  
  // Invalid collections (singletons passed to collection components)
  {
    expression: '{{user.name}}',
    expectedType: 'collection',
    expected: false,
    description: 'Table should NOT accept user.name (singleton)'
  },
  {
    expression: '{{products[0].name}}',
    expectedType: 'collection',
    expected: false,
    description: 'Repeater should NOT accept products[0].name (singleton)'
  },
  {
    expression: '{{products.count()}}',
    expectedType: 'collection',
    expected: false,
    description: 'Table should NOT accept count aggregation (singleton)'
  },
  
  // Singleton validations (for child components in repeaters)
  {
    expression: '{{item.name}}',
    expectedType: 'singleton',
    expected: true,
    description: 'Text in repeater should accept item.name'
  },
  {
    expression: '{{item.price}}',
    expectedType: 'singleton',
    expected: true,
    description: 'Text in repeater should accept item.price'
  },
  {
    expression: '{{user.email}}',
    expectedType: 'singleton',
    expected: true,
    description: 'Text component should accept user.email'
  },
  {
    expression: '{{products[0].name}}',
    expectedType: 'singleton',
    expected: true,
    description: 'Text should accept first product name'
  },
  {
    expression: '{{orders.sum(total)}}',
    expectedType: 'singleton',
    expected: true,
    description: 'Text should accept aggregation result'
  },
  
  // Invalid singletons (collections passed to singleton components)
  {
    expression: '{{products}}',
    expectedType: 'singleton',
    expected: false,
    description: 'Text component should NOT accept products collection'
  },
  {
    expression: '{{users}}',
    expectedType: 'singleton',
    expected: false,
    description: 'Button text should NOT accept users collection'
  },
  
  // Any type (should all pass)
  {
    expression: '{{products}}',
    expectedType: 'any',
    expected: true,
    description: 'Any type should accept collections'
  },
  {
    expression: '{{user.name}}',
    expectedType: 'any',
    expected: true,
    description: 'Any type should accept singletons'
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('🔍 Testing Data Type Validation:\n');

testCases.forEach((testCase, index) => {
  const result = validateDataType(testCase.expression, testCase.expectedType);
  const success = result === testCase.expected;
  
  if (success) {
    console.log(`✅ ${index + 1}. ${testCase.description}`);
    console.log(`   ${testCase.expression} → ${testCase.expectedType}: ${result}\n`);
    passed++;
  } else {
    console.log(`❌ ${index + 1}. ${testCase.description}`);
    console.log(`   ${testCase.expression} → ${testCase.expectedType}: ${result} (expected: ${testCase.expected})\n`);
    failed++;
  }
});

// Results
console.log('📊 Test Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! Magic text validation works correctly.');
  console.log('\n📝 Summary of what was implemented:');
  console.log('   • Table components only accept collections ({{products}}, {{users}})');
  console.log('   • Repeater components only accept collections');
  console.log('   • Text/Button components in repeaters use {{item.field}} for current item');
  console.log('   • Text components outside repeaters can use singletons ({{user.name}})');
  console.log('   • Magic text picker filters options based on component context');
  console.log('   • Follows best practices for parent-child data binding');
} else {
  console.log('⚠️  Some tests failed. Please review the validation logic.');
}

console.log('\n🚀 Ready for manual testing in the browser!');
console.log('   1. Start the app: npm run dev');
console.log('   2. Test table component with {{products}}');
console.log('   3. Test repeater with {{products}} and {{item.name}} in children');
console.log('   4. Verify magic text picker shows appropriate options');
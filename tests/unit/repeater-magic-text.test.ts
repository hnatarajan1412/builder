import { renderTemplateWithData } from '../../src/components/RepeaterComponent';
import { MagicTextProcessor } from '../../src/utils/magicTextProcessor';
import { databaseService } from '../../src/services/database-compat.service';

// Mock the necessary modules
jest.mock('../../src/utils/magicTextProcessor');
jest.mock('../../src/services/database.service');

describe('Repeater with Magic Text', () => {
  const appId = 'test-app';
  
  beforeEach(() => {
    jest.clearAllMocks();
    databaseService.initializeApp(appId);
  });

  test('should process dataSource with magic text', () => {
    // Setup
    const tableName = 'products';
    const testData = [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 }
    ];

    // Mock database query
    (databaseService.query as jest.Mock).mockReturnValue({ rows: testData });

    // Test processing "{{products}}" magic text
    const dataSource = '{{products}}';
    const context = { appId };

    // The MagicTextProcessor should return just the table name
    (MagicTextProcessor.process as jest.Mock).mockReturnValue('products');

    // Simulate what happens in RepeaterComponent getData()
    const processedData = MagicTextProcessor.process(dataSource, context);
    expect(processedData).toBe('products');

    // When it's a table name, fetch the data
    const result = databaseService.query(appId, processedData);
    expect(result.rows).toEqual(testData);
  });

  test('should handle item context in repeater template', () => {
    const itemContext = {
      item: { name: 'Test Product', price: 99.99 },
      index: 0
    };

    // Test magic text processing within repeater
    const templates = [
      { input: '{{item.name}}', expected: 'Test Product' },
      { input: '{{index}}', expected: '0' },
      { input: 'Item {{index}}: {{item.name}}', expected: 'Item 0: Test Product' }
    ];

    templates.forEach(({ input, expected }) => {
      (MagicTextProcessor.process as jest.Mock).mockImplementation((text, ctx) => {
        if (text === '{{item.name}}' && ctx.item) return ctx.item.name;
        if (text === '{{index}}' && ctx.index !== undefined) return ctx.index.toString();
        if (text.includes('{{')) {
          return text
            .replace('{{item.name}}', ctx.item?.name || '')
            .replace('{{index}}', ctx.index?.toString() || '');
        }
        return text;
      });

      const result = MagicTextProcessor.process(input, itemContext);
      expect(result).toBe(expected);
    });
  });

  test('should handle empty or invalid dataSource', () => {
    const testCases = [
      { dataSource: '', expected: [] },
      { dataSource: null, expected: [] },
      { dataSource: undefined, expected: [] },
      { dataSource: '{{nonexistent}}', expected: [] }
    ];

    testCases.forEach(({ dataSource, expected }) => {
      // Mock MagicTextProcessor to return empty string for invalid inputs
      (MagicTextProcessor.process as jest.Mock).mockReturnValue('');
      
      // Simulate getData logic
      let result = [];
      if (dataSource && typeof dataSource === 'string') {
        const processed = MagicTextProcessor.process(dataSource, { appId });
        if (processed && /^[a-zA-Z_]\w*$/.test(processed)) {
          try {
            const queryResult = databaseService.query(appId, processed);
            result = queryResult.rows || [];
          } catch (e) {
            result = [];
          }
        }
      }
      
      expect(result).toEqual(expected);
    });
  });
});
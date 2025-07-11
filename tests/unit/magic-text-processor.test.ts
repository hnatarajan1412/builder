import { MagicTextProcessor } from '../../src/utils/magicTextProcessor';
import { databaseService } from '../../src/services/database-compat.service';

describe('MagicTextProcessor', () => {
  const appId = 'test-app';
  
  beforeEach(() => {
    // Initialize test app
    databaseService.initializeApp(appId);
  });

  describe('Basic variable processing', () => {
    it('should process user variables', () => {
      const context = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin'
        }
      };
      
      expect(MagicTextProcessor.process('Hello {{user.name}}!', context))
        .toBe('Hello John Doe!');
      
      expect(MagicTextProcessor.process('Email: {{user.email}}', context))
        .toBe('Email: john@example.com');
    });

    it('should handle missing variables gracefully', () => {
      const context = {};
      
      expect(MagicTextProcessor.process('Hello {{user.name}}!', context))
        .toBe('Hello !');
    });
  });

  describe('Item context in repeaters', () => {
    it('should process item variables', () => {
      const context = {
        item: {
          name: 'Product 1',
          price: 99.99,
          category: 'Electronics'
        },
        index: 0
      };
      
      expect(MagicTextProcessor.process('{{item.name}}', context))
        .toBe('Product 1');
      
      expect(MagicTextProcessor.process('Item {{index}}: {{item.name}}', context))
        .toBe('Item 0: Product 1');
    });
  });

  describe('Date and time processing', () => {
    it('should process date variables', () => {
      const context = {};
      
      const result = MagicTextProcessor.process('Today is {{today}}', context);
      expect(result).toContain('Today is');
      expect(result).not.toBe('Today is {{today}}');
    });
  });

  describe('Formatting', () => {
    it('should format currency', () => {
      const context = {
        price: 99.99
      };
      
      expect(MagicTextProcessor.process('Price: {{price|currency}}', context))
        .toBe('Price: $99.99');
    });

    it('should format percentage', () => {
      const context = {
        value: 0.856
      };
      
      expect(MagicTextProcessor.process('Progress: {{value|percentage:1}}', context))
        .toBe('Progress: 85.6%');
    });

    it('should format numbers', () => {
      const context = {
        value: 123.456
      };
      
      expect(MagicTextProcessor.process('Value: {{value|number:2}}', context))
        .toBe('Value: 123.46');
    });
  });

  describe('Database access', () => {
    it('should access table data by index', () => {
      // Create test table
      databaseService.addTable(appId, 'products', [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' }
      ]);
      
      // Add test data
      databaseService.addRecord(appId, 'products', { name: 'Product 1', price: 100 });
      databaseService.addRecord(appId, 'products', { name: 'Product 2', price: 200 });
      
      const context = { appId };
      
      expect(MagicTextProcessor.process('{{products[0].name}}', context))
        .toBe('Product 1');
      
      expect(MagicTextProcessor.process('{{products[1].price}}', context))
        .toBe('200');
    });

    it('should return table data when just table name is used', () => {
      // Create test table
      databaseService.addTable(appId, 'users', [
        { name: 'name', type: 'string' }
      ]);
      
      // Add test data
      databaseService.addRecord(appId, 'users', { name: 'User 1' });
      databaseService.addRecord(appId, 'users', { name: 'User 2' });
      
      const context = { appId };
      
      // When used in magic text brackets, returns string representation
      const result = MagicTextProcessor.process('{{users}}', context);
      expect(result).toContain('[object Object]');
    });
  });

  describe('Aggregations', () => {
    it('should calculate aggregations', () => {
      // Create test table
      databaseService.addTable(appId, 'orders', [
        { name: 'amount', type: 'number' }
      ]);
      
      // Add test data
      databaseService.addRecord(appId, 'orders', { amount: 100 });
      databaseService.addRecord(appId, 'orders', { amount: 200 });
      databaseService.addRecord(appId, 'orders', { amount: 300 });
      
      const context = { appId };
      
      expect(MagicTextProcessor.process('{{orders.count()}}', context))
        .toBe('3');
      
      expect(MagicTextProcessor.process('{{orders.sum(amount)}}', context))
        .toBe('600');
      
      expect(MagicTextProcessor.process('{{orders.avg(amount)}}', context))
        .toBe('200');
    });
  });
});
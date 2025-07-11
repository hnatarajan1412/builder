import { databaseService } from '../services/database-compat.service';
import { FormulaEvaluator } from './formulaEvaluator';
import { MagicTextFormatter, FormatOptions } from './magicTextFormatter';

interface ProcessorContext {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  tables?: Record<string, any[]>;
  appId?: string;
  pageState?: Record<string, any>;
  item?: any;  // Current item in repeater/list context
  index?: number;  // Current index in repeater/list context
  [key: string]: any;
}

export class MagicTextProcessor {
  // Validate if a magic text expression returns the expected data type
  static validateDataType(expression: string, expectedType: 'collection' | 'singleton' | 'any'): boolean {
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
  
  static process(text: string, context: ProcessorContext = {}): string {
    if (!text || typeof text !== 'string') return '';
    
    // Process all {{variable}} expressions
    return text.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      try {
        // Check if it has formatting options
        const formatMatch = expression.match(/^(.+)\|(.+)$/);
        let value: any;
        let formatOptions: FormatOptions = {};
        
        if (formatMatch) {
          const [, varPath, format] = formatMatch;
          value = this.evaluateExpression(varPath.trim(), context);
          formatOptions = this.parseFormatOptions(format.trim());
        } else {
          value = this.evaluateExpression(expression.trim(), context);
        }
        
        // Apply formatting if specified
        if (formatOptions.type) {
          return MagicTextFormatter.format(value, formatOptions);
        }
        
        // Default formatting based on value type
        if (value instanceof Date) {
          return MagicTextFormatter.format(value, { type: 'datetime' });
        }
        
        if (value === null || value === undefined) {
          return '';
        }
        
        return String(value);
      } catch (error) {
        console.error('Magic text processing error:', error);
        return match; // Return original if error
      }
    });
  }
  
  private static evaluateExpression(expression: string, context: ProcessorContext): any {
    // Handle formulas
    if (expression.startsWith('formula:')) {
      const formula = expression.replace('formula:', '');
      return FormulaEvaluator.evaluate(formula, context);
    }
    
    // Handle item and index in repeater context
    if (expression === 'item' && context.item !== undefined) {
      return context.item;
    }
    if (expression === 'index' && context.index !== undefined) {
      return context.index;
    }
    if (expression.startsWith('item.') && context.item !== undefined) {
      const fieldPath = expression.substring(5);
      return this.getValueFromPath(context.item, fieldPath);
    }
    
    // Handle special built-in variables
    if (expression === 'now' || expression === 'now.datetime') {
      return new Date();
    }
    if (expression === 'now.date') {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }
    if (expression === 'now.time') {
      return new Date();
    }
    if (expression === 'today') {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }
    if (expression === 'tomorrow') {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    if (expression === 'yesterday') {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    
    // Handle database table access
    // Check if expression is just a table name (for list/repeater data sources)
    if (context.appId && /^[a-zA-Z_]\w*$/.test(expression)) {
      try {
        const result = databaseService.query(context.appId, expression);
        if (result.rows) {
          return result.rows;
        }
      } catch (e) {
        // Not a table name, continue with regular path
      }
    }
    
    // Handle table[index].field notation
    const tableIndexMatch = expression.match(/^(\w+)\[(\d+)\]\.(.+)$/);
    if (tableIndexMatch && context.appId) {
      const [, tableName, index, fieldPath] = tableIndexMatch;
      try {
        const result = databaseService.query(context.appId, tableName);
        const record = result.rows[parseInt(index)];
        if (record) {
          return this.getValueFromPath(record, fieldPath);
        }
      } catch (e) {
        // Continue with regular path
      }
    }
    
    // Handle database aggregations
    const aggregateMatch = expression.match(/^(\w+)\.(count|sum|avg|min|max)\(([^)]*)\)$/);
    if (aggregateMatch) {
      const [, tableName, func, field] = aggregateMatch;
      return this.handleAggregation(tableName, func, field, context);
    }
    
    // Handle regular path expressions
    return this.getValueFromPath(context, expression);
  }
  
  private static handleAggregation(
    tableName: string,
    func: string,
    field: string,
    context: ProcessorContext
  ): any {
    if (!context.appId) return 0;
    
    const result = databaseService.query(context.appId, tableName);
    const data = result.rows;
    
    switch (func) {
      case 'count':
        return data.length;
      
      case 'sum':
        if (!field) return 0;
        return data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
      
      case 'avg':
        if (!field || data.length === 0) return 0;
        const total = data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
        return total / data.length;
      
      case 'min':
        if (!field || data.length === 0) return null;
        return Math.min(...data.map(row => parseFloat(row[field]) || 0));
      
      case 'max':
        if (!field || data.length === 0) return null;
        return Math.max(...data.map(row => parseFloat(row[field]) || 0));
      
      default:
        return 0;
    }
  }
  
  private static getValueFromPath(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }
    
    return value;
  }
  
  private static parseFormatOptions(format: string): FormatOptions {
    const options: FormatOptions = {};
    
    // Parse format string like "date:MM/DD/YYYY" or "currency:USD"
    const parts = format.split(':');
    const type = parts[0];
    
    switch (type) {
      case 'date':
      case 'time':
      case 'datetime':
        options.type = type;
        if (parts[1]) options.format = parts[1];
        break;
      
      case 'number':
        options.type = 'number';
        if (parts[1]) options.decimals = parseInt(parts[1]);
        break;
      
      case 'currency':
        options.type = 'currency';
        if (parts[1]) options.currency = parts[1];
        break;
      
      case 'percentage':
      case 'percent':
        options.type = 'percentage';
        if (parts[1]) options.decimals = parseInt(parts[1]);
        break;
    }
    
    return options;
  }
}
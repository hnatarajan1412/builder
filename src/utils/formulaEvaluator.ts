interface Context {
  [key: string]: any;
}

export class FormulaEvaluator {
  private static operators = {
    '+': (a: number, b: number) => a + b,
    '-': (a: number, b: number) => a - b,
    '*': (a: number, b: number) => a * b,
    '/': (a: number, b: number) => a / b,
    '%': (a: number, b: number) => a % b,
    '^': (a: number, b: number) => Math.pow(a, b),
  };
  
  private static functions = {
    // Math functions
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    min: Math.min,
    max: Math.max,
    sqrt: Math.sqrt,
    pow: Math.pow,
    random: Math.random,
    
    // Aggregation functions
    sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
    avg: (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length,
    count: (arr: any[]) => arr.length,
    
    // String functions
    length: (str: string) => str.length,
    uppercase: (str: string) => str.toUpperCase(),
    lowercase: (str: string) => str.toLowerCase(),
    trim: (str: string) => str.trim(),
    
    // Date functions
    now: () => new Date(),
    today: () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    },
    year: (date: Date) => new Date(date).getFullYear(),
    month: (date: Date) => new Date(date).getMonth() + 1,
    day: (date: Date) => new Date(date).getDate(),
    daysBetween: (date1: Date, date2: Date) => {
      const diff = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    // Conditional functions
    if: (condition: boolean, trueValue: any, falseValue: any) => condition ? trueValue : falseValue,
    isNull: (value: any) => value === null || value === undefined,
    isNotNull: (value: any) => value !== null && value !== undefined,
    isEmpty: (value: any) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (Array.isArray(value)) return value.length === 0;
      return false;
    },
  };
  
  static evaluate(formula: string, context: Context = {}): any {
    try {
      // Replace variables with their values
      let processedFormula = formula;
      
      // Replace {{variable}} syntax with context values
      processedFormula = processedFormula.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
        const value = this.getValueFromPath(context, varPath);
        return JSON.stringify(value);
      });
      
      // Replace field references in curly braces {field}
      processedFormula = processedFormula.replace(/\{([^}]+)\}/g, (match, varPath) => {
        const value = this.getValueFromPath(context, varPath);
        return JSON.stringify(value);
      });
      
      // Evaluate the formula safely
      return this.safeEval(processedFormula, context);
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return `#ERROR: ${error.message}`;
    }
  }
  
  private static getValueFromPath(context: Context, path: string): any {
    const parts = path.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      
      // Handle function calls
      if (part.includes('(')) {
        const funcMatch = part.match(/(\w+)\((.*)\)/);
        if (funcMatch) {
          const [, funcName, args] = funcMatch;
          
          // Handle aggregation functions on arrays
          if (Array.isArray(value) && ['sum', 'avg', 'count', 'min', 'max'].includes(funcName)) {
            if (args) {
              // If args provided, extract that field from each item
              const fieldValues = value.map(item => this.getValueFromPath(item, args));
              return this.functions[funcName](fieldValues);
            } else {
              return this.functions[funcName](value);
            }
          }
        }
      } else {
        value = value[part];
      }
    }
    
    return value;
  }
  
  private static safeEval(expression: string, context: Context): any {
    // Create a safe evaluation context
    const safeContext = {
      ...this.functions,
      ...context,
    };
    
    // Build function body
    const functionBody = `
      with (context) {
        return ${expression};
      }
    `;
    
    // Create and execute function
    const func = new Function('context', functionBody);
    return func(safeContext);
  }
  
  // Helper method to parse and evaluate complex formulas
  static parseFormula(formula: string): {
    isValid: boolean;
    error?: string;
    variables: string[];
    functions: string[];
  } {
    const variables: string[] = [];
    const functions: string[] = [];
    
    try {
      // Extract variables
      const varMatches = formula.matchAll(/\{([^}]+)\}/g);
      for (const match of varMatches) {
        variables.push(match[1]);
      }
      
      // Extract function calls
      const funcMatches = formula.matchAll(/(\w+)\(/g);
      for (const match of funcMatches) {
        if (this.functions[match[1]]) {
          functions.push(match[1]);
        }
      }
      
      return {
        isValid: true,
        variables: [...new Set(variables)],
        functions: [...new Set(functions)],
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        variables: [],
        functions: [],
      };
    }
  }
  
  // Predefined formula templates
  static templates = {
    percentage: '{value} / {total} * 100',
    percentageChange: '({new} - {old}) / {old} * 100',
    average: 'sum({values}) / count({values})',
    roundToCurrency: 'round({amount} * 100) / 100',
    daysSinceCreated: 'daysBetween({created_at}, now())',
    isOverdue: 'if({due_date} < today(), true, false)',
    discountPrice: '{price} * (1 - {discount} / 100)',
    taxAmount: '{subtotal} * {tax_rate} / 100',
    totalWithTax: '{subtotal} + ({subtotal} * {tax_rate} / 100)',
    bmi: '{weight} / pow({height} / 100, 2)',
    compound: '{principal} * pow(1 + {rate} / 100, {years})',
  };
}

// Export convenience function
export const formulaEvaluator = FormulaEvaluator.evaluate;
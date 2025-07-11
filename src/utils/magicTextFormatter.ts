export interface FormatOptions {
  type?: 'date' | 'time' | 'datetime' | 'number' | 'currency' | 'percentage';
  format?: string;
  locale?: string;
  currency?: string;
  decimals?: number;
}

export class MagicTextFormatter {
  static format(value: any, options: FormatOptions = {}): string {
    if (value === null || value === undefined) return '';
    
    const locale = options.locale || 'en-US';
    
    switch (options.type) {
      case 'date':
        return this.formatDate(value, options.format || 'MM/DD/YYYY', locale);
      
      case 'time':
        return this.formatTime(value, options.format || 'HH:mm', locale);
      
      case 'datetime':
        return this.formatDateTime(value, options.format || 'MM/DD/YYYY HH:mm', locale);
      
      case 'number':
        return this.formatNumber(value, options.decimals ?? 2, locale);
      
      case 'currency':
        return this.formatCurrency(value, options.currency || 'USD', locale);
      
      case 'percentage':
        return this.formatPercentage(value, options.decimals ?? 0, locale);
      
      default:
        return String(value);
    }
  }
  
  private static formatDate(value: any, format: string, locale: string): string {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      
      // Simple format replacements
      const replacements: Record<string, string> = {
        'YYYY': date.getFullYear().toString(),
        'YY': date.getFullYear().toString().slice(-2),
        'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
        'M': (date.getMonth() + 1).toString(),
        'DD': date.getDate().toString().padStart(2, '0'),
        'D': date.getDate().toString(),
      };
      
      let formatted = format;
      Object.entries(replacements).forEach(([key, val]) => {
        formatted = formatted.replace(new RegExp(key, 'g'), val);
      });
      
      return formatted;
    } catch {
      return String(value);
    }
  }
  
  private static formatTime(value: any, format: string, locale: string): string {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      
      const hours24 = date.getHours();
      const hours12 = hours24 % 12 || 12;
      const ampm = hours24 < 12 ? 'AM' : 'PM';
      
      const replacements: Record<string, string> = {
        'HH': hours24.toString().padStart(2, '0'),
        'H': hours24.toString(),
        'hh': hours12.toString().padStart(2, '0'),
        'h': hours12.toString(),
        'mm': date.getMinutes().toString().padStart(2, '0'),
        'm': date.getMinutes().toString(),
        'ss': date.getSeconds().toString().padStart(2, '0'),
        's': date.getSeconds().toString(),
        'a': ampm.toLowerCase(),
        'A': ampm,
      };
      
      let formatted = format;
      Object.entries(replacements).forEach(([key, val]) => {
        formatted = formatted.replace(new RegExp(key, 'g'), val);
      });
      
      return formatted;
    } catch {
      return String(value);
    }
  }
  
  private static formatDateTime(value: any, format: string, locale: string): string {
    // Combine date and time formatting
    const datePart = format.split(' ')[0];
    const timePart = format.split(' ')[1];
    
    const formattedDate = this.formatDate(value, datePart, locale);
    const formattedTime = this.formatTime(value, timePart, locale);
    
    return `${formattedDate} ${formattedTime}`;
  }
  
  private static formatNumber(value: any, decimals: number, locale: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return String(value);
      
      return num.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch {
      return String(value);
    }
  }
  
  private static formatCurrency(value: any, currency: string, locale: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return String(value);
      
      return num.toLocaleString(locale, {
        style: 'currency',
        currency: currency,
      });
    } catch {
      return String(value);
    }
  }
  
  private static formatPercentage(value: any, decimals: number, locale: string): string {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return String(value);
      
      return num.toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch {
      return String(value);
    }
  }
}
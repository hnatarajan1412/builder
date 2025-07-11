export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'date' 
  | 'color' 
  | 'url' 
  | 'email'
  | 'any';

export interface BindingExpression {
  type: 'static' | 'dynamic';
  value: any;
  expression?: string;
  dataSource?: DataSourcePath;
  transformations?: Transformation[];
}

export interface DataSourcePath {
  category: 'appState' | 'apiResponse' | 'pageContext' | 'database' | 'user' | 'system';
  path: string[];
  display: string;
  metadata?: {
    type: PropertyType;
    nullable: boolean;
    array: boolean;
    description?: string;
  };
}

export interface Transformation {
  type: 'format' | 'calculate' | 'filter' | 'map' | 'default' | 'convert';
  config: Record<string, any>;
}

export interface BindableProperty {
  name: string;
  label: string;
  type: PropertyType;
  bindingModes: ('static' | 'dynamic')[];
  validation?: PropertyValidation;
  defaultValue?: any;
  description?: string;
  required?: boolean;
}

export interface PropertyValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export interface DataSourceNode {
  id: string;
  label: string;
  type: PropertyType;
  value?: any;
  children?: DataSourceNode[];
  isArray?: boolean;
  isNullable?: boolean;
  path: string[];
  category: DataSourcePath['category'];
  description?: string;
}

export interface DataSourceTree {
  [category: string]: DataSourceNode[];
}

export interface AutoCompleteSuggestion {
  label: string;
  value: string;
  type: PropertyType;
  category: DataSourcePath['category'];
  description?: string;
  insertText: string;
  detail?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  message: string;
  position?: { start: number; end: number };
  severity: 'error';
}

export interface ValidationWarning {
  message: string;
  position?: { start: number; end: number };
  severity: 'warning';
}
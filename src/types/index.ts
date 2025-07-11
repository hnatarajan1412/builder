export interface App {
  id: string;
  name: string;
  description?: string;
  settings?: AppSettings;
  pages: string[];
  components: string[];
  tables: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  features?: {
    authentication?: boolean;
    database?: boolean;
    api?: boolean;
  };
}

export interface Page {
  id: string;
  appId: string;
  name: string;
  path: string;
  layout?: {
    type: 'grid' | 'flex' | 'absolute';
    direction?: 'row' | 'column';
    gap?: number;
    padding?: number;
  };
  components: ComponentInstance[];
  dataSources?: DataSource[];
  actions?: Action[];
  state?: Record<string, StateVariable>;
}

export interface Component {
  id: string;
  appId: string;
  name: string;
  type: ComponentType;
  props?: PropDefinition[];
  defaultProps?: Record<string, any>;
  style?: StyleProperties;
  dataBinding?: DataBinding;
  events?: EventHandler[];
  children?: boolean;
  template?: string;
}

export type ComponentType = 
  | 'button' 
  | 'input' 
  | 'text' 
  | 'container' 
  | 'image' 
  | 'form' 
  | 'table' 
  | 'list' 
  | 'repeater'
  | 'navigation'
  | 'custom';

export interface ComponentInstance {
  id: string;
  componentId: ComponentType;
  props?: Record<string, any>;
  children?: ComponentInstance[];
  style?: Record<string, any>;
  responsiveStyles?: Record<string, Record<string, any>>;
  dataBinding?: DataBinding;
  bindings?: Record<string, DataBinding>;
  events?: EventHandler[];
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required?: boolean;
  default?: any;
  description?: string;
}

export interface StyleProperties {
  width?: string | number;
  height?: string | number;
  margin?: string | number;
  padding?: string | number;
  backgroundColor?: string;
  color?: string;
  border?: string;
  borderRadius?: string | number;
  fontSize?: string | number;
  fontWeight?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string | number;
  position?: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  [key: string]: any;
}

export interface DataSource {
  id: string;
  type: 'table' | 'api' | 'static';
  source: string;
  query?: string;
  transform?: string;
}

export interface DataBinding {
  source?: string;
  field?: string;
  transform?: string;
}

export interface Action {
  id: string;
  name: string;
  trigger: 'click' | 'load' | 'submit' | 'change';
  type: 'navigate' | 'api' | 'database' | 'setState';
  payload: Record<string, any>;
}

export interface EventHandler {
  name: string;
  handler: string;
}

export interface StateVariable {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default: any;
}

export interface Table {
  id: string;
  appId: string;
  name: string;
  description?: string;
  fields: Field[];
  indexes?: Index[];
  relationships?: Relationship[];
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'text' | 'uuid' | 'geolocation' | 'relationship';
  required?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  readOnly?: boolean;
  // Relationship configuration (used when type === 'relationship')
  relatedTable?: string;
  relationshipType?: 'oneToMany' | 'manyToOne' | 'manyToMany';
  foreignKey?: {
    table: string;
    field: string;
    onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT';
  };
  junctionTable?: string; // For many-to-many relationships
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
  label?: string;
}

export interface Index {
  name: string;
  fields: string[];
  unique?: boolean;
}

export interface Relationship {
  type: 'oneToMany' | 'manyToOne' | 'manyToMany';
  targetTable: string;
  foreignKey: string;
  joinTable?: string;
}
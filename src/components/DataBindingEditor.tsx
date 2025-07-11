import React, { useState } from 'react';
import { ComponentInstance } from '../types';
import { useBuilderStore } from '../stores/builder.store';
import { Database, Link, Variable, Code } from 'lucide-react';

interface DataBindingEditorProps {
  component: ComponentInstance;
}

export const DataBindingEditor: React.FC<DataBindingEditorProps> = ({ component }) => {
  const { updateComponentBinding, updateComponentProps, tables, currentApp } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'static' | 'dynamic'>('static');
  
  const bindings = component.bindings || {};

  const handleBindingChange = (property: string, binding: any) => {
    updateComponentBinding(component.id, property, binding);
  };

  const availableProperties = getBindableProperties(component.componentId);

  return (
    <div className="space-y-4">
      {/* Binding Mode Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('static')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            activeTab === 'static'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Static Values
        </button>
        <button
          onClick={() => setActiveTab('dynamic')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            activeTab === 'dynamic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dynamic Binding
        </button>
      </div>

      {activeTab === 'dynamic' && (
        <div className="space-y-6">
          {/* Available Properties */}
          <div className="sidebar-section">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              <Variable className="w-4 h-4" />
              Bindable Properties
            </h3>
            
            <div className="space-y-3">
              {availableProperties.map((prop) => (
                <div key={prop.name} className={`border ${bindings[prop.name] ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} rounded-lg p-3`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{prop.label}</h4>
                      <p className="text-xs text-gray-500">{prop.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {prop.type}
                      </span>
                      {bindings[prop.name] && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Bound
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <BindingInput
                    property={prop.name}
                    binding={bindings[prop.name]}
                    onChange={(binding) => handleBindingChange(prop.name, binding)}
                    tableName={bindings[prop.name]?.tableName}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="sidebar-section">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              <Database className="w-4 h-4" />
              Data Sources
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">App State</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Global application state</p>
              </div>
              
              {/* Database Tables */}
              {currentApp && Object.values(tables).filter(t => t.appId === currentApp.id).map((table) => (
                <div 
                  key={table.id} 
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // If table component, bind data to the table
                    if (component.componentId === 'table') {
                      handleBindingChange('data', {
                        type: 'table',
                        source: 'database',
                        tableName: table.name,
                        field: '*' // All fields
                      });
                      
                      // Auto-generate columns from table fields
                      const columns = table.fields.map(field => ({
                        field: field.name,
                        label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
                        type: field.type
                      }));
                      
                      // Update the props directly as well
                      updateComponentProps(component.id, { 
                        columns,
                        data: [] // Will be populated from binding
                      });
                    } else if (component.componentId === 'list') {
                      // For list component, bind the items
                      handleBindingChange('items', {
                        type: 'table',
                        source: 'database',
                        tableName: table.name,
                        field: '*'
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{table.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Table with {table.fields.length} fields
                  </p>
                </div>
              ))}
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">API Response</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Data from API calls</p>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Variable className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Page Context</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Variables from parent components</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'static' && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Switch to Dynamic Binding to connect this component to data sources, 
            API responses, or application state.
          </p>
        </div>
      )}
    </div>
  );
};

interface BindingInputProps {
  property: string;
  binding?: any;
  onChange: (binding: any) => void;
  tableName?: string;
}

const BindingInput: React.FC<BindingInputProps> = ({ property, binding, onChange, tableName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expression, setExpression] = useState(binding?.expression || '');

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    onChange({
      type: 'expression',
      expression: value,
      property
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:border-gray-400 transition-colors"
        >
          {binding?.tableName ? `Table: ${binding.tableName}` : binding?.expression || 'Click to bind...'}
        </button>
        <button
          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Expression editor"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Code className="w-4 h-4" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Binding Expression
          </label>
          <textarea
            value={expression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="e.g., state.user.name or api.products[0].title"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="mt-2 flex items-start gap-2">
            <span className="text-xs text-gray-500">
              Use dot notation to access nested properties. 
              Arrays can be accessed with brackets.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function getBindableProperties(componentId: string) {
  switch (componentId) {
    case 'text':
      return [
        { name: 'text', label: 'Text Content', type: 'string', description: 'The text to display' }
      ];
    case 'button':
      return [
        { name: 'label', label: 'Button Label', type: 'string', description: 'The button text' },
        { name: 'disabled', label: 'Disabled State', type: 'boolean', description: 'Whether the button is disabled' }
      ];
    case 'input':
      return [
        { name: 'value', label: 'Input Value', type: 'string', description: 'The input field value' },
        { name: 'placeholder', label: 'Placeholder', type: 'string', description: 'Placeholder text' },
        { name: 'disabled', label: 'Disabled State', type: 'boolean', description: 'Whether the input is disabled' }
      ];
    case 'image':
      return [
        { name: 'src', label: 'Image Source', type: 'string', description: 'URL or path to the image' },
        { name: 'alt', label: 'Alt Text', type: 'string', description: 'Alternative text for accessibility' }
      ];
    case 'table':
      return [
        { name: 'data', label: 'Table Data', type: 'array', description: 'Array of data rows to display' },
        { name: 'columns', label: 'Table Columns', type: 'array', description: 'Column definitions' }
      ];
    case 'list':
      return [
        { name: 'items', label: 'List Items', type: 'array', description: 'Array of items to display' }
      ];
    case 'container':
    case 'form':
      return [
        { name: 'visible', label: 'Visibility', type: 'boolean', description: 'Whether the container is visible' }
      ];
    default:
      return [];
  }
}
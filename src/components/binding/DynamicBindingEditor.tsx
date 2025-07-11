import React, { useState } from 'react';
import { Code, Database } from 'lucide-react';
import { BindingExpression, BindableProperty, DataSourceTree } from '../../types/binding.types';
import { DataSourceExplorer } from './DataSourceExplorer';
import { ExpressionInput } from './ExpressionInput';
import { useBuilderStore } from '../../stores/builder.store';
import { useUserStore } from '../../stores/user.store';

interface DynamicBindingEditorProps {
  property: BindableProperty;
  value: BindingExpression;
  onChange: (value: BindingExpression) => void;
  componentId?: string;
}

export const DynamicBindingEditor: React.FC<DynamicBindingEditorProps> = ({
  property,
  value,
  onChange
}) => {
  const [bindingMode, setBindingMode] = useState<'static' | 'dynamic'>(value.type || 'static');
  const [expression, setExpression] = useState(value.expression || '');
  const [selectedPath] = useState<string | null>(null);
  
  const { currentApp, tables } = useBuilderStore();
  const { loggedInUser, currentUser } = useUserStore();

  // Build data source tree
  const dataSources: DataSourceTree = React.useMemo(() => {
    const sources: DataSourceTree = {
      appState: [],
      database: [],
      user: [],
      pageContext: [],
      system: [],
      apiResponse: []
    };

    // Add app state
    if (currentApp) {
      sources.appState.push({
        id: 'app',
        label: 'App',
        type: 'object',
        path: ['app'],
        category: 'appState',
        children: [
          {
            id: 'app.name',
            label: 'Name',
            type: 'string',
            path: ['app', 'name'],
            category: 'appState',
            value: currentApp.name
          },
          {
            id: 'app.id',
            label: 'ID',
            type: 'string',
            path: ['app', 'id'],
            category: 'appState',
            value: currentApp.id
          }
        ]
      });
    }

    // Add database tables
    if (currentApp && tables) {
      Object.values(tables)
        .filter(table => table.appId === currentApp.id)
        .forEach(table => {
          const tableNode: any = {
            id: `database.${table.name}`,
            label: table.name,
            type: 'array',
            isArray: true,
            path: [table.name],
            category: 'database',
            children: []
          };

          // Add count aggregation
          tableNode.children.push({
            id: `${table.name}.count`,
            label: 'count()',
            type: 'number',
            path: [table.name, 'count()'],
            category: 'database',
            description: 'Number of records'
          });

          // Add fields
          table.fields.forEach(field => {
            tableNode.children.push({
              id: `${table.name}.${field.name}`,
              label: field.name,
              type: field.type as any,
              path: [table.name, field.name],
              category: 'database',
              isArray: true,
              description: `List of ${field.name} values`
            });

            // Add aggregations for number fields
            if (field.type === 'number') {
              tableNode.children.push(
                {
                  id: `${table.name}.sum.${field.name}`,
                  label: `sum(${field.name})`,
                  type: 'number',
                  path: [table.name, `sum(${field.name})`],
                  category: 'database',
                  description: `Sum of ${field.name}`
                },
                {
                  id: `${table.name}.avg.${field.name}`,
                  label: `avg(${field.name})`,
                  type: 'number',
                  path: [table.name, `avg(${field.name})`],
                  category: 'database',
                  description: `Average of ${field.name}`
                },
                {
                  id: `${table.name}.min.${field.name}`,
                  label: `min(${field.name})`,
                  type: 'number',
                  path: [table.name, `min(${field.name})`],
                  category: 'database',
                  description: `Minimum ${field.name}`
                },
                {
                  id: `${table.name}.max.${field.name}`,
                  label: `max(${field.name})`,
                  type: 'number',
                  path: [table.name, `max(${field.name})`],
                  category: 'database',
                  description: `Maximum ${field.name}`
                }
              );
            }
          });

          sources.database.push(tableNode);
        });
    }

    // Add user context
    const userNode = {
      id: 'user',
      label: 'Logged In User',
      type: 'object' as const,
      path: ['user'],
      category: 'user' as const,
      children: [
        {
          id: 'user.name',
          label: 'Name',
          type: 'string' as const,
          path: ['user', 'name'],
          category: 'user' as const
        },
        {
          id: 'user.email',
          label: 'Email',
          type: 'email' as const,
          path: ['user', 'email'],
          category: 'user' as const
        },
        {
          id: 'user.id',
          label: 'ID',
          type: 'string' as const,
          path: ['user', 'id'],
          category: 'user' as const
        },
        {
          id: 'user.role',
          label: 'Role',
          type: 'string' as const,
          path: ['user', 'role'],
          category: 'user' as const
        }
      ]
    };

    const currentUserNode = {
      id: 'currentUser',
      label: 'Current User',
      type: 'object' as const,
      path: ['currentUser'],
      category: 'user' as const,
      children: [
        {
          id: 'currentUser.name',
          label: 'Name',
          type: 'string' as const,
          path: ['currentUser', 'name'],
          category: 'user' as const
        },
        {
          id: 'currentUser.email',
          label: 'Email',
          type: 'email' as const,
          path: ['currentUser', 'email'],
          category: 'user' as const
        },
        {
          id: 'currentUser.id',
          label: 'ID',
          type: 'string' as const,
          path: ['currentUser', 'id'],
          category: 'user' as const
        },
        {
          id: 'currentUser.role',
          label: 'Role',
          type: 'string' as const,
          path: ['currentUser', 'role'],
          category: 'user' as const
        }
      ]
    };

    sources.user.push(userNode, currentUserNode);

    // Add system variables
    sources.system.push(
      {
        id: 'now',
        label: 'Current Date/Time',
        type: 'date',
        path: ['now'],
        category: 'system',
        description: 'Current date and time'
      },
      {
        id: 'today',
        label: 'Today',
        type: 'date',
        path: ['today'],
        category: 'system',
        description: 'Today at midnight'
      },
      {
        id: 'timestamp',
        label: 'Timestamp',
        type: 'number',
        path: ['timestamp'],
        category: 'system',
        description: 'Unix timestamp in milliseconds'
      }
    );

    return sources;
  }, [currentApp, tables, loggedInUser, currentUser]);

  const handleModeChange = (mode: 'static' | 'dynamic') => {
    setBindingMode(mode);
    onChange({
      ...value,
      type: mode,
      expression: mode === 'static' ? undefined : expression
    });
  };

  const handleExpressionChange = (expr: string) => {
    setExpression(expr);
    onChange({
      ...value,
      type: 'dynamic',
      expression: expr
    });
  };

  const handleStaticValueChange = (val: any) => {
    onChange({
      type: 'static',
      value: val
    });
  };

  const handleDataSourceSelect = (path: string[]) => {
    const expr = `{{${path.join('.')}}}`;
    setExpression(expr);
    handleExpressionChange(expr);
  };

  return (
    <div className="space-y-4">
      {/* Property Name Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{property.label}</h4>
        {property.description && (
          <span className="text-xs text-gray-500">{property.description}</span>
        )}
      </div>
      
      {/* Static/Dynamic Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            bindingMode === 'static'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleModeChange('static')}
        >
          Static Value
        </button>
        <button
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            bindingMode === 'dynamic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleModeChange('dynamic')}
        >
          Dynamic Binding
        </button>
      </div>

      {bindingMode === 'static' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {property.label}
          </label>
          {renderStaticInput(property, value.value, handleStaticValueChange)}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bindable Properties Header */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              <Code className="inline w-4 h-4 mr-1" />
              Bindable Properties
            </h3>
            <p className="text-xs text-gray-500">
              Bind {property.label} to dynamic data
            </p>
          </div>

          {/* Click to bind / Expression input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {property.label}
            </label>
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">The text to display</div>
              <ExpressionInput
                value={expression}
                onChange={handleExpressionChange}
                placeholder="Click to bind..."
                dataSources={dataSources}
                propertyType={property.type}
              />
            </div>
          </div>

          {/* Binding Expression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Binding Expression
            </label>
            <textarea
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={3}
              placeholder="e.g., state.user.name or api.products[0].title"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use dot notation to access nested properties. Arrays can be accessed with brackets.
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              <Database className="inline w-4 h-4 mr-1" />
              Data Sources
            </h3>
            <DataSourceExplorer
              dataSources={dataSources}
              onSelect={handleDataSourceSelect}
              selectedPath={selectedPath}
              propertyType={property.type}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to render static input based on property type
function renderStaticInput(
  property: BindableProperty,
  value: any,
  onChange: (value: any) => void
): React.ReactNode {
  switch (property.type) {
    case 'string':
    case 'email':
    case 'url':
      return (
        <input
          type={property.type === 'email' ? 'email' : property.type === 'url' ? 'url' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter ${property.label.toLowerCase()}`}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enable {property.label}</span>
        </label>
      );

    case 'color':
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-20"
          />
          <input
            type="text"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      );

    case 'array':
      return (
        <textarea
          value={Array.isArray(value) ? value.join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n').filter(v => v.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter values, one per line"
        />
      );

    default:
      return (
        <textarea
          value={JSON.stringify(value, null, 2) || ''}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // Invalid JSON, ignore
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={4}
          placeholder="{}"
        />
      );
  }
}
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ComponentInstance, ComponentType } from '../types';
import { useBuilderStore } from '../stores/builder.store';
import { Trash2, Copy, Move } from 'lucide-react';
import { RepeaterComponent } from './RepeaterComponent';
import { FormComponent } from './FormComponent';
import { EnhancedInputComponent } from './EnhancedInputComponent';
import { NavigationComponent } from './NavigationComponent';

// Helper functions for default props and styles
const getDefaultProps = (type: ComponentType): Record<string, any> => {
  switch (type) {
    case 'text':
      return { text: 'Text content' };
    case 'button':
      return { label: 'Button' };
    case 'input':
      return { placeholder: 'Enter text...' };
    case 'image':
      return { src: 'https://via.placeholder.com/300x200', alt: 'Image' };
    case 'table':
      return { 
        columns: [
          { field: 'id', label: 'ID' },
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' }
        ],
        data: '', // Changed to empty string for magic text
        striped: true,
        hover: true
      };
    case 'list':
      return {
        items: ['Item 1', 'Item 2', 'Item 3'],
        ordered: false
      };
    case 'repeater':
      return {
        dataSource: '',
        maxItems: 100,
        spacing: 8,
        direction: 'vertical'
      };
    case 'form':
      return {
        submitAction: 'database',
        targetTable: null,
        submitButtonText: 'Submit',
        resetAfterSubmit: true,
        showResetButton: false
      };
    case 'navigation':
      return {
        type: 'menu',
        orientation: 'horizontal',
        showIcons: true,
        items: [
          { id: '1', label: 'Home', path: '/', icon: 'home' },
          { id: '2', label: 'About', path: '/about', icon: 'info' }
        ]
      };
    default:
      return {};
  }
};

const getDefaultStyle = (type: ComponentType): Record<string, any> => {
  switch (type) {
    case 'container':
      return { 
        padding: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        minHeight: '120px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(229, 231, 235, 0.5)'
      };
    case 'button':
      return {
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        transition: 'all 0.2s ease'
      };
    default:
      return {};
  }
};

interface ComponentRendererProps {
  component: ComponentInstance;
  parentId?: string;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const { selectedComponent, selectComponent, removeComponent, addComponentToPage, duplicateComponent, updateComponent } = useBuilderStore();
  const isSelected = selectedComponent?.id === component.id;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { ...component, isNew: false },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      if (item.isNew) {
        // Create new component instance with default props
        const newComponent: ComponentInstance = {
          id: `comp-${Date.now()}`,
          componentId: item.type,
          props: getDefaultProps(item.type),
          style: getDefaultStyle(item.type),
        };
        
        addComponentToPage(newComponent, component.id);
      }
    },
    canDrop: () => component.componentId === 'container' || component.componentId === 'form' || component.componentId === 'repeater',
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  const combinedRef = (el: HTMLDivElement) => {
    drag(el);
    drop(el);
  };

  const renderComponent = () => {
    const style: React.CSSProperties = {
      ...component.style,
      opacity: isDragging ? 0.5 : 1,
    } as React.CSSProperties;

    switch (component.componentId) {
      case 'text':
        const textType = component.props?.type || 'paragraph';
        const textContent = component.props?.text || 'Text';
        
        switch (textType) {
          case 'heading1':
            return <h1 style={style}>{textContent}</h1>;
          case 'heading2':
            return <h2 style={style}>{textContent}</h2>;
          case 'heading3':
            return <h3 style={style}>{textContent}</h3>;
          case 'caption':
            return <span style={style} className="text-sm text-gray-600">{textContent}</span>;
          default:
            return <p style={style}>{textContent}</p>;
        }
      
      case 'button':
        const variant = component.props?.variant || 'primary';
        const size = component.props?.size || 'medium';
        const disabled = component.props?.disabled || false;
        
        const variantClasses = {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          outline: 'border border-gray-300 hover:bg-gray-100',
          ghost: 'hover:bg-gray-100'
        };
        
        const sizeClasses = {
          small: 'px-3 py-1 text-sm',
          medium: 'px-4 py-2',
          large: 'px-6 py-3 text-lg'
        };
        
        return (
          <button 
            style={style}
            className={`rounded-md font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            {component.props?.label || 'Button'}
          </button>
        );
      
      case 'input':
        return (
          <EnhancedInputComponent
            component={component}
            isPreview={false}
          />
        );
      
      case 'image':
        return (
          <img
            src={component.props?.src || 'https://via.placeholder.com/300x200'}
            alt={component.props?.alt || 'Image'}
            style={style}
            className="max-w-full"
          />
        );
      
      case 'container':
        return (
          <div 
            data-component-type="container"
            style={style}
            className={`
              ${isOver && canDrop ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              transition-all duration-200
            `}
          >
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <ComponentRenderer key={child.id} component={child} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
                Drop components here
              </div>
            )}
          </div>
        );
        
      case 'form':
        return (
          <FormComponent
            component={component}
            isSelected={isSelected}
            onSelect={() => selectComponent(component)}
            onUpdate={(updates) => {
              updateComponent(component.id, updates);
            }}
            isPreview={false}
          />
        );
      
      case 'drop-zone':
        return (
          <div 
            data-component-type="container"
            style={style}
            className={`
              ${isOver && canDrop ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              transition-all duration-200
            `}
          >
            {component.children && component.children.length > 0 ? (
              <div className="space-y-2">
                {component.children.map((child) => (
                  <ComponentRenderer key={child.id} component={child} parentId={component.id} />
                ))}
              </div>
            ) : (
              <div className="min-h-[50px] flex items-center justify-center text-gray-400 text-sm">
                Drop components here
              </div>
            )}
          </div>
        );
        
      case 'table':
        const hasColumns = component.props?.columns && component.props.columns.length > 0;
        const hasData = Array.isArray(component.props?.data) && component.props.data.length > 0;
        
        if (!hasColumns) {
          return (
            <div style={style} className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-400">
                <p className="text-sm font-medium">Table Component</p>
                <p className="text-xs mt-1">
                  {component.props?.data ? 
                    'Add columns in the properties panel to display data' : 
                    'Set a data source and add columns to get started'
                  }
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <div style={style} className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {component.props.columns.map((col: any, index: number) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col.label || col.field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hasData ? (
                  component.props.data.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {component.props.columns.map((col: any, colIndex: number) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[col.field] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={component.props.columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                      {component.props?.data ? 'No data available' : 'Set a data source to display data'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
        
      case 'list':
        return (
          <div style={style}>
            {Array.isArray(component.props?.items) && component.props.items.length > 0 ? (
              <ul className={component.props?.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}>
                {component.props.items.map((item: any, index: number) => (
                  <li key={index} className="py-1">
                    {typeof item === 'object' ? item.label || item.text || JSON.stringify(item) : item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No items to display</p>
            )}
          </div>
        );
        
      case 'repeater':
        return (
          <div
            data-component-type="repeater"
            style={style}
            className={`
              ${isOver && canDrop ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              transition-all duration-200
            `}
          >
            <RepeaterComponent
              component={component}
              isSelected={isSelected}
              onSelect={() => selectComponent(component)}
              onUpdate={(updates) => {
                updateComponent(component.id, updates);
              }}
              isPreview={isPreview}
            />
          </div>
        );
        
      case 'navigation':
        return (
          <NavigationComponent
            component={component}
            isSelected={isSelected}
            onSelect={() => selectComponent(component)}
            isPreview={false}
          />
        );
      
      default:
        return (
          <div style={style} className="p-4 bg-gray-100 rounded">
            {component.componentId} Component
          </div>
        );
    }
  };

  return (
    <div
      ref={combinedRef}
      className={`
        relative group
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isDragging ? 'cursor-move' : 'cursor-pointer'}
        transition-all duration-200
      `}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component);
      }}
    >
      {renderComponent()}
      
      {/* Component toolbar */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Move"
          >
            <Move className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              removeComponent(component.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
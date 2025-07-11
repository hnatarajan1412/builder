import React from 'react';
import { useDrop } from 'react-dnd';
import { ComponentInstance } from '../types';
import { ComponentRenderer } from './ComponentRenderer';
import { databaseService } from '../services/database-compat.service';
import { MagicTextProcessor } from '../utils/magicTextProcessor';
import { useBuilderStore } from '../stores/builder.store';

interface RepeaterComponentProps {
  component: ComponentInstance;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<ComponentInstance>) => void;
  isPreview?: boolean;
}

export const RepeaterComponent: React.FC<RepeaterComponentProps> = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false
}) => {
  const { props = {}, bindings = {} } = component;
  const { addComponentToPage, currentApp } = useBuilderStore();
  
  // Get data source configuration
  const dataSource = props.dataSource; // Use props.dataSource which contains magic text
  const itemTemplate = component.children?.[0]; // First child is the template
  
  // Set up drop zone for accepting components
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      if (item.isNew) {
        // Create default props based on component type
        const getDefaultProps = (type: string) => {
          switch (type) {
            case 'text': return { text: '{{item.name}}' };
            case 'button': return { label: 'Click {{item.title}}' };
            case 'image': return { src: '{{item.imageUrl}}', alt: '{{item.name}}' };
            default: return {};
          }
        };
        
        // Create new component instance
        const newComponent: ComponentInstance = {
          id: `comp-${Date.now()}`,
          componentId: item.type,
          props: getDefaultProps(item.type),
          style: {},
        };
        
        addComponentToPage(newComponent, component.id);
      }
    },
    canDrop: () => true, // Always allow dropping components
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));
  
  // Fetch data based on data source
  const getData = () => {
    if (!dataSource || !currentApp) return [];
    
    try {
      // Check if dataSource is a string with magic text
      if (typeof dataSource === 'string') {
        // Process magic text to get the actual data
        const processedData = MagicTextProcessor.process(dataSource, {
          appId: currentApp.id
        });
        
        // If it's just a table name, fetch the data
        if (typeof processedData === 'string' && /^[a-zA-Z_]\w*$/.test(processedData)) {
          const result = databaseService.query(currentApp.id, processedData);
          return result.rows || [];
        }
        
        // If it's already an array, return it
        if (Array.isArray(processedData)) {
          return processedData;
        }
      }
      // Handle old binding format (object with type, tableName, etc.)
      else if (typeof dataSource === 'object' && dataSource.type === 'table') {
        const tableName = dataSource.tableName;
        if (tableName) {
          const result = databaseService.query(currentApp.id, tableName);
          return result.rows || [];
        }
      }
      // Handle static array
      else if (Array.isArray(dataSource)) {
        return dataSource;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching repeater data:', error);
      return [];
    }
  };
  
  const data = getData();
  const maxItems = props.maxItems || 100;
  const limitedData = data.slice(0, maxItems);
  
  // If no template, show placeholder
  if (!itemTemplate) {
    return (
      <div 
        ref={drop}
        className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] flex items-center justify-center ${
          isSelected ? 'border-blue-500 bg-blue-50' : ''
        } ${
          isOver && canDrop ? 'border-green-500 bg-green-50' : 'border-gray-300'
        }`}
        onClick={onSelect}
      >
        <div className="text-center text-gray-500">
          <p className="font-medium">Repeater Component</p>
          <p className="text-sm">Drop a component here to use as template</p>
          <p className="text-xs mt-1">Data source: {
            typeof dataSource === 'string' ? dataSource : 
            (dataSource?.tableName || 'Not configured')
          }</p>
          <p className="text-xs">Items: {data.length}</p>
        </div>
      </div>
    );
  }
  
  // In preview mode, just render the repeated items
  if (isPreview) {
    const getLayoutStyles = () => {
      const baseStyles: any = {
        display: 'flex',
        gap: `${props.spacing || 8}px`
      };
      
      if (props.direction === 'horizontal') {
        baseStyles.flexDirection = 'row';
        baseStyles.flexWrap = 'wrap';
      } else if (props.direction === 'grid') {
        baseStyles.display = 'grid';
        baseStyles.gridTemplateColumns = `repeat(${props.gridColumns || 3}, 1fr)`;
      } else {
        baseStyles.flexDirection = 'column';
      }
      
      return baseStyles;
    };
    
    return (
      <div className="repeater-container" style={style}>
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No data to display</p>
          </div>
        ) : (
          <div className="repeater-items" style={getLayoutStyles()}>
            {limitedData.map((item, index) => {
              const itemContext = {
                item,
                index,
                isFirst: index === 0,
                isLast: index === limitedData.length - 1,
                total: limitedData.length
              };
              
              // Clone the template with item-specific data
              const renderedTemplate = renderTemplateWithData(itemTemplate, itemContext);
              
              return (
                <div key={item.id || index} className="repeater-item">
                  <ComponentRenderer 
                    component={renderedTemplate} 
                    isPreview={true}
                  />
                </div>
              );
            })}
          </div>
        )}
        {data.length > maxItems && (
          <div className="text-center py-2 text-sm text-gray-500 border-t">
            Showing {maxItems} of {data.length} items
          </div>
        )}
      </div>
    );
  }
  
  // Builder mode - show template editor
  return (
    <div 
      className={`repeater-container ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {/* Repeater Header (only visible when selected) */}
      {isSelected && (
        <div className="repeater-header bg-blue-50 border border-blue-200 rounded-t-lg p-2 text-sm text-blue-700">
          <span className="font-medium">Repeater:</span> {data.length} items from {
            typeof dataSource === 'string' ? dataSource : 
            (dataSource?.tableName || 'data source')
          }
        </div>
      )}
      
      {/* Template Editor */}
      <div 
        ref={drop}
        className={`repeater-template-editor border-2 border-dashed rounded-lg p-2 mb-2 ${
          isOver && canDrop ? 'border-green-500 bg-green-50' : 'border-blue-300'
        }`}
      >
        <div className="text-xs text-blue-600 mb-1">Template (edit here):</div>
        {component.children && component.children.length > 0 ? (
          component.children.map((child) => (
            <ComponentRenderer key={child.id} component={child} parentId={component.id} />
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            Drop components here to design the template
          </div>
        )}
      </div>
      
      {/* Preview of repeated items */}
      <div className="repeater-preview opacity-75">
        <div className="text-xs text-gray-500 mb-1">Preview ({limitedData.length} items):</div>
        <div className="repeater-items" style={{ gap: `${props.spacing || 8}px`, display: 'flex', flexDirection: 'column' }}>
          {limitedData.slice(0, 3).map((item, index) => {
            // Create a context for this item
            const itemContext = {
              item,
              index,
              isFirst: index === 0,
              isLast: index === limitedData.length - 1,
              total: limitedData.length
            };
            
            // Clone the template with item-specific data
            const renderedTemplate = renderTemplateWithData(itemTemplate, itemContext);
            
            return (
              <div key={item.id || index} className="repeater-item">
                {renderComponentPreview(renderedTemplate)}
              </div>
            );
          })}
          {limitedData.length > 3 && (
            <div className="text-center text-xs text-gray-500 py-2">
              ... and {limitedData.length - 3} more items
            </div>
          )}
        </div>
      </div>
      
      {/* Show message if no data */}
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p>No data to display</p>
          <p className="text-sm">Check your data source configuration</p>
        </div>
      )}
      
      {/* Show truncation message if data was limited */}
      {data.length > maxItems && (
        <div className="text-center py-2 text-sm text-gray-500 border-t">
          Showing {maxItems} of {data.length} items
        </div>
      )}
    </div>
  );
};

// Helper function to render template with item data
function renderTemplateWithData(template: ComponentInstance, context: any): ComponentInstance {
  const processValue = (value: any): any => {
    if (typeof value === 'string' && value.includes('{{')) {
      // Process magic text with item context
      return MagicTextProcessor.process(value, {
        item: context.item,
        index: context.index
      });
    }
    return value;
  };
  
  const processProps = (props: Record<string, any>): Record<string, any> => {
    const processed: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      processed[key] = processValue(value);
    }
    return processed;
  };
  
  const processBindings = (bindings: Record<string, any>): Record<string, any> => {
    const processed: Record<string, any> = {};
    for (const [key, binding] of Object.entries(bindings)) {
      if (binding && typeof binding === 'object' && binding.expression) {
        processed[key] = {
          ...binding,
          value: processValue(binding.expression)
        };
      } else {
        processed[key] = binding;
      }
    }
    return processed;
  };
  
  // Process events with magic text
  const processEvents = (events: any[] = []) => {
    return events.map(event => ({
      ...event,
      action: {
        ...event.action,
        parameters: event.action.parameters ? 
          Object.entries(event.action.parameters).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: processValue(value)
          }), {}) : {}
      }
    }));
  };
  
  return {
    ...template,
    id: `${template.id}-${context.index}`, // Unique ID for each instance
    props: processProps(template.props || {}),
    bindings: processBindings(template.bindings || {}),
    events: processEvents(template.events),
    children: template.children?.map(child => renderTemplateWithData(child, context))
  };
}

// Helper function to render component preview without interactivity
function renderComponentPreview(component: ComponentInstance): JSX.Element {
  const style = component.style || {};
  const props = component.props || {};
  
  switch (component.componentId) {
    case 'text':
      const textType = props.type || 'paragraph';
      const textContent = props.text || 'Text';
      
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
      const variant = props.variant || 'primary';
      const variantClasses = {
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-gray-100 text-gray-900',
        outline: 'border border-gray-300',
        ghost: ''
      };
      return (
        <button 
          style={style}
          className={`px-4 py-2 rounded ${variantClasses[variant]}`}
          disabled
        >
          {props.label || 'Button'}
        </button>
      );
      
    case 'image':
      return (
        <img
          src={props.src || 'https://via.placeholder.com/300x200'}
          alt={props.alt || 'Image'}
          style={style}
          className="max-w-full"
        />
      );
      
    case 'input':
      return (
        <input
          type={props.type || 'text'}
          placeholder={props.placeholder || ''}
          value={props.value || props.defaultValue || ''}
          disabled
          style={style}
          className="border border-gray-300 rounded px-3 py-2"
        />
      );
      
    case 'container':
      return (
        <div style={style}>
          {component.children?.map((child, index) => (
            <div key={index}>{renderComponentPreview(child)}</div>
          ))}
        </div>
      );
      
    default:
      return (
        <div style={style} className="p-2 bg-gray-100 rounded">
          {component.componentId}
        </div>
      );
  }
}
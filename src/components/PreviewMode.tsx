import React from 'react';
import { X, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { useUserStore } from '../stores/user.store';
import { ComponentInstance, Table } from '../types';
import { hybridDatabaseService } from '../services/hybrid-database.service';
import { MagicTextProcessor } from '../utils/magicTextProcessor';
import { UserContextPanel } from './UserContextPanel';

interface PreviewModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ isOpen, onClose }) => {
  const { currentPage, currentApp, tables, pages, setCurrentPage } = useBuilderStore();
  const { loggedInUser, currentUser } = useUserStore();
  const [viewport, setViewport] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [pageState, setPageState] = React.useState<Record<string, any>>({});
  const [componentVisibility, setComponentVisibility] = React.useState<Record<string, boolean>>({});


  // Format field values based on type and formatting options
  const formatFieldValue = (value: any, binding: any): string => {
    if (value === null || value === undefined) return '';
    
    // Handle formatting options if provided
    if (binding.format) {
      switch (binding.format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: binding.currency || 'USD'
          }).format(Number(value));
        case 'percentage':
          return `${(Number(value) * 100).toFixed(binding.decimals || 0)}%`;
        case 'number':
          return Number(value).toFixed(binding.decimals || 0);
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'datetime':
          return new Date(value).toLocaleString();
        default:
          return String(value);
      }
    }
    
    return String(value);
  };

  if (!isOpen || !currentPage) return null;

  const viewportSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' }
  };

  const handleEvent = (event: any) => {
    console.log('Event triggered:', event);
    
    // Handle different action types - support both old and new formats
    const action = event.action || event.type;
    const parameters = event.parameters || event.config || {};
    
    switch (action) {
      case 'navigate':
        const target = parameters.target || parameters.pageId;
        if (parameters.url) {
          // Open external URL in new tab
          window.open(parameters.url, '_blank');
        } else if (target && currentApp) {
          // Navigate to internal page
          const targetPage = Object.values(pages).find(p => 
            p.appId === currentApp.id && (p.id === target || p.name === target || p.path === target)
          );
          if (targetPage) {
            setCurrentPage(targetPage);
          }
        }
        break;
        
      case 'updateState':
      case 'state':
        const path = parameters.statePath || parameters.stateKey;
        const value = parameters.value || parameters.stateValue;
        if (path) {
          // Handle dynamic values like event.target.value
          let actualValue = value;
          if (typeof value === 'string' && value.includes('event.target.value')) {
            // This would be passed from the actual event handler
            actualValue = parameters.eventValue || value;
          }
          setPageState(prev => ({
            ...prev,
            [path]: actualValue
          }));
        }
        break;
        
      case 'database':
        // In preview, we can simulate database operations
        const { operation, tableId } = parameters;
        if (operation && tableId && currentApp) {
          const table = tables[tableId];
          if (table) {
            switch (operation) {
              case 'create':
                console.log('Would create record in', table.name);
                // Could show a form modal here
                break;
              case 'update':
                console.log('Would update record in', table.name);
                break;
              case 'delete':
                console.log('Would delete record from', table.name);
                break;
              case 'query':
                console.log('Would query records from', table.name);
                break;
            }
          }
        }
        break;
        
      case 'visibility':
        const { visibilityAction, targetId } = parameters;
        if (targetId) {
          setComponentVisibility(prev => {
            const currentVisibility = prev[targetId] !== false; // Default to visible
            switch (visibilityAction) {
              case 'show':
                return { ...prev, [targetId]: true };
              case 'hide':
                return { ...prev, [targetId]: false };
              case 'toggle':
                return { ...prev, [targetId]: !currentVisibility };
              default:
                return prev;
            }
          });
        }
        break;
        
      case 'apiCall':
      case 'api':
        // In preview, make actual API calls or mock them
        const { endpoint, method = 'GET', headers, body } = parameters;
        if (endpoint) {
          // For demo, just log the API call
          console.log(`API ${method} ${endpoint}`, { headers, body });
          // Could actually fetch here if needed
        }
        break;
        
      case 'showAlert':
        alert(parameters.message || 'Alert triggered!');
        break;
        
      case 'custom':
        // In preview, we could safely evaluate custom code
        console.log('Custom action code:', parameters.code);
        // For safety, we don't eval arbitrary code in preview
        break;
    }
  };

  const renderComponent = (component: ComponentInstance, context?: any): JSX.Element => {
    // Check component visibility
    const isHidden = componentVisibility[component.id] === false;
    if (isHidden) {
      return <React.Fragment key={component.id} />;
    }
    
    const style = {
      ...component.style,
      ...(component.responsiveStyles?.[viewport] || {})
    };

    // Apply data bindings
    let props = { ...component.props };
    if (component.bindings) {
      Object.entries(component.bindings).forEach(([prop, binding]: [string, any]) => {
        // Handle data binding from DataBindingPanel
        if (binding.type === 'field' && binding.tableId && binding.fieldName) {
          const table = tables[binding.tableId];
          if (table && currentApp) {
            if (binding.mode === 'list') {
              const data = hybridDatabaseService.getAllDataSync(currentApp.id, table.name);
              props[prop] = data;
            } else if (binding.mode === 'single' && context?.currentItem) {
              props[prop] = formatFieldValue(context.currentItem[binding.fieldName], binding);
            } else {
              const data = hybridDatabaseService.getAllDataSync(currentApp.id, table.name);
              if (data.length > 0) {
                props[prop] = formatFieldValue(data[0][binding.fieldName], binding);
              }
            }
          }
        } else if (binding.type === 'table' && binding.tableId) {
          const table = tables[binding.tableId];
          if (table && currentApp) {
            const data = hybridDatabaseService.getAllDataSync(currentApp.id, table.name);
            props[prop] = data;
          }
        }
        // Handle new binding format
        else if (binding.type === 'static') {
          props[prop] = binding.value;
        } else if (binding.type === 'dynamic' && binding.expression) {
          // Process the expression through MagicTextProcessor
          props[prop] = binding.expression; // Will be processed below
        }
        // Handle legacy binding format
        else if (binding.source === 'state' && binding.field) {
          props[prop] = pageState[binding.field] || props[prop];
        } else if (binding.type === 'table' && binding.source === 'database' && currentApp) {
          // Handle database table bindings - query real data
          const result = hybridDatabaseService.querySync(currentApp.id, binding.tableName);
          props[prop] = result.rows;
        } else if (binding.type === 'static' && binding.value !== undefined) {
          props[prop] = binding.value;
        }
      });
    }

    // Create context for Magic Text processing
    const magicTextContext = {
      user: loggedInUser || {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      },
      currentUser: currentUser || undefined,
      appId: currentApp?.id,
      pageState,
      tables: {},
      item: context?.currentItem,
      index: context?.currentIndex
    };

    // Process Magic Text in string properties
    const processedProps = { ...props };
    Object.entries(processedProps).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('{{')) {
        processedProps[key] = MagicTextProcessor.process(value, magicTextContext);
      }
    });

    // Create event handlers
    const eventHandlers: Record<string, (e?: any) => void> = {};
    component.events?.forEach(event => {
      // Map event names to React event names
      const eventName = event.event || event.trigger || event.name;
      const reactEventName = eventName.startsWith('on') ? eventName : `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
      
      eventHandlers[reactEventName] = (e?: any) => {
        // Prevent default for form events
        if (e && (eventName === 'onSubmit' || eventName === 'submit')) {
          e.preventDefault();
        }
        
        // Pass event values if needed
        const eventWithContext = { ...event };
        if (e?.target?.value !== undefined) {
          eventWithContext.parameters = {
            ...eventWithContext.parameters,
            eventValue: e.target.value
          };
        }
        
        handleEvent(eventWithContext);
      };
    });

    switch (component.componentId) {
      case 'text':
        const textType = processedProps.type || 'paragraph';
        const textContent = processedProps.text || 'Text';
        
        switch (textType) {
          case 'heading1':
            return <h1 key={component.id} style={style} {...eventHandlers}>{textContent}</h1>;
          case 'heading2':
            return <h2 key={component.id} style={style} {...eventHandlers}>{textContent}</h2>;
          case 'heading3':
            return <h3 key={component.id} style={style} {...eventHandlers}>{textContent}</h3>;
          case 'caption':
            return <span key={component.id} style={style} className="text-sm text-gray-600" {...eventHandlers}>{textContent}</span>;
          default:
            return <p key={component.id} style={style} {...eventHandlers}>{textContent}</p>;
        }
        
      case 'button':
        const variant = processedProps.variant || 'primary';
        const size = processedProps.size || 'medium';
        const disabled = processedProps.disabled || false;
        
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
            key={component.id}
            style={style}
            className={`rounded-md font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            {...eventHandlers}
          >
            {processedProps.label || 'Button'}
          </button>
        );
        
      case 'input':
        return (
          <input
            key={component.id}
            type={processedProps.type || 'text'}
            placeholder={processedProps.placeholder}
            value={processedProps.value || processedProps.defaultValue || ''}
            required={processedProps.required}
            disabled={processedProps.disabled}
            pattern={processedProps.pattern}
            minLength={processedProps.minLength}
            maxLength={processedProps.maxLength}
            onChange={(e) => {
              if (component.bindings?.value?.field) {
                setPageState(prev => ({
                  ...prev,
                  [component.bindings!.value!.field!]: e.target.value
                }));
              }
              if (eventHandlers.onChange) {
                eventHandlers.onChange();
              }
            }}
            style={style}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...eventHandlers}
          />
        );
        
      case 'image':
        return (
          <img
            key={component.id}
            src={processedProps.src || 'https://via.placeholder.com/300x200'}
            alt={processedProps.alt || 'Image'}
            style={style}
            {...eventHandlers}
          />
        );
        
      case 'container':
        return (
          <div key={component.id} style={style} {...eventHandlers}>
            {component.children?.map(child => renderComponent(child, context))}
          </div>
        );
        
      case 'form':
        return (
          <form key={component.id} style={style} {...eventHandlers}>
            {component.children?.map(child => renderComponent(child, context))}
          </form>
        );
        
      case 'table':
        // Handle table data source
        let tableData = [];
        if (processedProps.data) {
          if (Array.isArray(processedProps.data)) {
            tableData = processedProps.data;
          } else if (typeof processedProps.data === 'string') {
            // Process magic text
            const processed = MagicTextProcessor.process(processedProps.data, magicTextContext);
            
            // If it returns a table name, fetch the data
            if (typeof processed === 'string' && /^[a-zA-Z_]\w*$/.test(processed) && currentApp) {
              try {
                // Use synchronous fallback for preview mode
                const result = hybridDatabaseService.querySync(currentApp.id, processed);
                tableData = result.rows || [];
              } catch (e) {
                console.error('Error fetching table data:', e);
              }
            } else if (Array.isArray(processed)) {
              tableData = processed;
            }
          }
        }
        
        const columns = processedProps.columns || [];
        
        return (
          <div key={component.id} style={style} className="overflow-x-auto">
            {tableData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No data available</p>
                {!processedProps.data && (
                  <p className="text-sm mt-2">Set a data source in the properties panel</p>
                )}
              </div>
            ) : (
              <table className={`min-w-full divide-y divide-gray-200 ${
                processedProps.striped ? 'table-striped' : ''
              } ${processedProps.hover ? 'table-hover' : ''} ${
                processedProps.bordered ? 'border' : ''
              }`} {...eventHandlers}>
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col: any, index: number) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.label || col.field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row: any, rowIndex: number) => (
                    <tr 
                      key={rowIndex} 
                      onClick={() => eventHandlers.onClick && eventHandlers.onClick({ row, rowIndex })} 
                      className={`${eventHandlers.onClick ? "cursor-pointer hover:bg-gray-50" : ""} ${
                        processedProps.striped && rowIndex % 2 === 1 ? "bg-gray-50" : ""
                      }`}
                    >
                      {columns.map((col: any, colIndex: number) => {
                        let cellValue = row[col.field] || '-';
                        
                        // Apply formatting if specified
                        if (col.format && cellValue !== '-') {
                          const formattedValue = MagicTextProcessor.process(
                            `{{value|${col.format}}}`,
                            { value: cellValue }
                          );
                          cellValue = formattedValue;
                        }
                        
                        return (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
        
      case 'list':
        // Handle data source
        let items = processedProps.items || [];
        if (processedProps.dataSource) {
          const dataSourceValue = MagicTextProcessor.process(processedProps.dataSource, magicTextContext);
          if (Array.isArray(dataSourceValue)) {
            items = dataSourceValue;
          } else if (typeof dataSourceValue === 'string' && /^[a-zA-Z_]\w*$/.test(dataSourceValue) && currentApp) {
            // If it's a table name, fetch the data
            try {
              const result = hybridDatabaseService.querySync(currentApp.id, dataSourceValue);
              items = result.rows || [];
            } catch (e) {
              console.error('Error fetching list data:', e);
            }
          }
        }
        
        const displayField = processedProps.displayField;
        
        return (
          <div key={component.id} style={style}>
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No items to display</p>
            ) : (
              <ul className={processedProps.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}>
                {items.map((item: any, index: number) => (
                  <li key={index} className="py-1">
                    {typeof item === 'object' 
                      ? (displayField ? item[displayField] : (item.label || item.text || item.name || JSON.stringify(item)))
                      : item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        
      case 'repeater':
        // Handle data source
        let dataSource = [];
        if (processedProps.dataSource) {
          // First check if it's already processed array data
          if (Array.isArray(processedProps.dataSource)) {
            dataSource = processedProps.dataSource;
          } else if (typeof processedProps.dataSource === 'string') {
            // Process magic text
            const processed = MagicTextProcessor.process(processedProps.dataSource, magicTextContext);
            
            // If it returns a table name, fetch the data
            if (typeof processed === 'string' && /^[a-zA-Z_]\w*$/.test(processed) && currentApp) {
              try {
                const result = hybridDatabaseService.querySync(currentApp.id, processed);
                dataSource = result.rows || [];
              } catch (e) {
                console.error('Error fetching repeater data:', e);
              }
            } else if (Array.isArray(processed)) {
              dataSource = processed;
            }
          }
        }
        
        const maxItems = processedProps.maxItems || 100;
        const spacing = processedProps.spacing || 8;
        const direction = processedProps.direction || 'vertical';
        const gridColumns = processedProps.gridColumns || 3;
        const itemsToShow = dataSource.slice(0, maxItems);
        
        // Determine layout classes
        let containerClasses = '';
        let itemClasses = '';
        
        if (direction === 'horizontal') {
          containerClasses = 'flex flex-wrap';
          itemClasses = `mr-${spacing / 4}`;
        } else if (direction === 'grid') {
          containerClasses = `grid gap-${spacing / 4}`;
          style.gridTemplateColumns = `repeat(${gridColumns}, minmax(0, 1fr))`;
        } else {
          containerClasses = '';
          itemClasses = `mb-${spacing / 4}`;
        }
        
        return (
          <div key={component.id} style={style} className={containerClasses}>
            {itemsToShow.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg col-span-full">
                No data to display
              </div>
            ) : (
              itemsToShow.map((item: any, index: number) => (
                <div key={index} className={`repeater-item ${itemClasses}`}>
                  {component.children?.map(child => 
                    renderComponent(child, { currentItem: item, currentIndex: index, ...context })
                  )}
                </div>
              ))
            )}
          </div>
        );
        
      default:
        return (
          <div key={component.id} style={style}>
            {component.componentId} Component
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Preview Mode</h2>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded ${viewport === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded ${viewport === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded ${viewport === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Preview Area with User Context Panel */}
        <div className="flex-1 flex">
          {/* Main Preview Area */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            <div 
              className="bg-white mx-auto shadow-lg transition-all duration-300"
              style={{
                width: viewportSizes[viewport].width,
                height: viewport === 'desktop' ? '100%' : viewportSizes[viewport].height,
                maxWidth: '100%'
              }}
            >
              <div className="p-6">
                {currentPage.components.map(component => renderComponent(component))}
              </div>
            </div>
          </div>
          
          {/* User Context Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <UserContextPanel />
          </div>
        </div>
        
        {/* State Debug Panel */}
        {Object.keys(pageState).length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Page State</h3>
            <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-auto max-h-24">
              {JSON.stringify(pageState, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
    </div>
  );
};
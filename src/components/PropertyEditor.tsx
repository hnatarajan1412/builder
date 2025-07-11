import React from 'react';
import { ComponentInstance } from '../types';
import { useBuilderStore } from '../stores/builder.store';
import { MagicTextEditor } from './MagicTextEditor';
import { TableColumnManager } from './TableColumnManager';

interface PropertyEditorProps {
  component: ComponentInstance;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ component }) => {
  const { updateComponentProps, currentPage } = useBuilderStore();

  const handlePropChange = (propName: string, value: any) => {
    updateComponentProps(component.id, { [propName]: value });
  };
  
  // Check if component is inside a repeater
  const isInRepeater = () => {
    if (!currentPage) return false;
    
    const findParentRepeater = (components: any[], targetId: string): boolean => {
      for (const comp of components) {
        if (comp.componentId === 'repeater' && comp.children) {
          // Check if target is a child of this repeater
          const isChild = findInChildren(comp.children, targetId);
          if (isChild) return true;
        }
        if (comp.children) {
          if (findParentRepeater(comp.children, targetId)) return true;
        }
      }
      return false;
    };
    
    const findInChildren = (children: any[], targetId: string): boolean => {
      for (const child of children) {
        if (child.id === targetId) return true;
        if (child.children && findInChildren(child.children, targetId)) return true;
      }
      return false;
    };
    
    return findParentRepeater(currentPage.components, component.id);
  };
  
  const context = isInRepeater() ? 'repeater' : 'default';

  const renderPropertyFields = () => {
    switch (component.componentId) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <MagicTextEditor
                value={component.props?.text || ''}
                onChange={(value) => handlePropChange('text', value)}
                placeholder="Enter text or add dynamic content..."
                multiline={true}
                context={context}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Type
              </label>
              <select
                value={component.props?.type || 'paragraph'}
                onChange={(e) => handlePropChange('type', e.target.value)}
                className="property-input"
              >
                <option value="paragraph">Paragraph</option>
                <option value="heading1">Heading 1</option>
                <option value="heading2">Heading 2</option>
                <option value="heading3">Heading 3</option>
                <option value="caption">Caption</option>
              </select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="button-label" className="block text-sm font-medium text-gray-700 mb-1">
                Button Label
              </label>
              <MagicTextEditor
                value={component.props?.label || ''}
                onChange={(value) => handlePropChange('label', value)}
                placeholder="Enter button text or add dynamic content..."
                multiline={false}
                context={context}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Type
              </label>
              <select
                value={component.props?.variant || 'primary'}
                onChange={(e) => handlePropChange('variant', e.target.value)}
                className="property-input"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={component.props?.size || 'medium'}
                onChange={(e) => handlePropChange('size', e.target.value)}
                className="property-input"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.disabled || false}
                  onChange={(e) => handlePropChange('disabled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Disabled</span>
              </label>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <MagicTextEditor
                value={component.props?.placeholder || ''}
                onChange={(value) => handlePropChange('placeholder', value)}
                placeholder="Enter placeholder text or add dynamic content..."
                multiline={false}
                context={context}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={component.props?.type || 'text'}
                onChange={(e) => handlePropChange('type', e.target.value)}
                className="property-input"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="tel">Phone</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <MagicTextEditor
                value={component.props?.defaultValue || ''}
                onChange={(value) => handlePropChange('defaultValue', value)}
                placeholder="Enter default value or add dynamic content..."
                multiline={false}
                context={context}
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.required || false}
                  onChange={(e) => handlePropChange('required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.disabled || false}
                  onChange={(e) => handlePropChange('disabled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Disabled</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
              <input
                type="text"
                value={component.props?.pattern || ''}
                onChange={(e) => handlePropChange('pattern', e.target.value)}
                className="property-input"
                placeholder="Regex pattern"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                <input
                  type="number"
                  value={component.props?.minLength || ''}
                  onChange={(e) => handlePropChange('minLength', parseInt(e.target.value) || undefined)}
                  className="property-input"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                <input
                  type="number"
                  value={component.props?.maxLength || ''}
                  onChange={(e) => handlePropChange('maxLength', parseInt(e.target.value) || undefined)}
                  className="property-input"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Source
              </label>
              <MagicTextEditor
                value={component.props?.src || ''}
                onChange={(value) => handlePropChange('src', value)}
                placeholder="Enter image URL or add dynamic content..."
                multiline={false}
                context={context}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <MagicTextEditor
                value={component.props?.alt || ''}
                onChange={(value) => handlePropChange('alt', value)}
                placeholder="Enter alt text or add dynamic content..."
                multiline={false}
                context={context}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Fit
              </label>
              <select
                value={component.props?.objectFit || 'cover'}
                onChange={(e) => handlePropChange('objectFit', e.target.value)}
                className="property-input"
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
                <option value="scale-down">Scale Down</option>
              </select>
            </div>
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Type
              </label>
              <select
                value={component.props?.layout || 'vertical'}
                onChange={(e) => handlePropChange('layout', e.target.value)}
                className="property-input"
              >
                <option value="vertical">Vertical Stack</option>
                <option value="horizontal">Horizontal Stack</option>
                <option value="grid">Grid</option>
                <option value="wrap">Flex Wrap</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gap (px)
              </label>
              <input
                type="number"
                value={component.props?.gap || 16}
                onChange={(e) => handlePropChange('gap', parseInt(e.target.value) || 0)}
                className="property-input"
                min="0"
              />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <MagicTextEditor
                value={component.props?.data || ''}
                onChange={(value) => handlePropChange('data', value)}
                placeholder="Enter table name (e.g. {{products}}) or data expression..."
                multiline={false}
                dataType="collection"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{tableName}}'} to bind to a database table
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columns
              </label>
              <TableColumnManager
                dataSource={component.props?.data || ''}
                columns={component.props?.columns || []}
                onChange={(columns) => handlePropChange('columns', columns)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.striped || false}
                  onChange={(e) => handlePropChange('striped', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Striped Rows</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.hover || false}
                  onChange={(e) => handlePropChange('hover', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Hover Effect</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={component.props?.bordered || false}
                  onChange={(e) => handlePropChange('bordered', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Bordered</span>
              </label>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Type
              </label>
              <select
                value={component.props?.ordered ? 'ordered' : 'unordered'}
                onChange={(e) => handlePropChange('ordered', e.target.value === 'ordered')}
                className="property-input"
              >
                <option value="unordered">Bulleted List</option>
                <option value="ordered">Numbered List</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <MagicTextEditor
                value={component.props?.dataSource || ''}
                onChange={(value) => handlePropChange('dataSource', value)}
                placeholder="Enter table name (e.g. {{users}}) or static items..."
                multiline={false}
                dataType="collection"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{tableName}}'} for dynamic data or enter static items below
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Static Items (if not using data source)
              </label>
              <textarea
                value={component.props?.items?.join('\n') || ''}
                onChange={(e) => handlePropChange('items', e.target.value.split('\n').filter(item => item.trim()))}
                className="property-input min-h-[100px]"
                placeholder="Enter items, one per line..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Display Field
              </label>
              <input
                type="text"
                value={component.props?.displayField || ''}
                onChange={(e) => handlePropChange('displayField', e.target.value)}
                className="property-input"
                placeholder="Field to display (e.g. name, title)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for simple arrays or to display entire object
              </p>
            </div>
          </div>
        );

      case 'repeater':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <MagicTextEditor
                value={component.props?.dataSource || ''}
                onChange={(value) => handlePropChange('dataSource', value)}
                placeholder="Enter table name (e.g. {{products}}) or data expression..."
                multiline={false}
                dataType="collection"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{tableName}}'} to repeat over database records
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Direction
              </label>
              <select
                value={component.props?.direction || 'vertical'}
                onChange={(e) => handlePropChange('direction', e.target.value)}
                className="property-input"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            {component.props?.direction === 'grid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grid Columns
                </label>
                <input
                  type="number"
                  value={component.props?.gridColumns || 3}
                  onChange={(e) => handlePropChange('gridColumns', parseInt(e.target.value) || 3)}
                  className="property-input"
                  min="1"
                  max="12"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Spacing (px)
              </label>
              <input
                type="number"
                value={component.props?.spacing || 8}
                onChange={(e) => handlePropChange('spacing', parseInt(e.target.value) || 0)}
                className="property-input"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Items to Display
              </label>
              <input
                type="number"
                value={component.props?.maxItems || ''}
                onChange={(e) => handlePropChange('maxItems', e.target.value ? parseInt(e.target.value) : undefined)}
                className="property-input"
                placeholder="Show all items"
                min="1"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p className="font-medium text-blue-900 mb-1">Inside the repeater:</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Use {'{{item.fieldName}}'} to access current item fields</li>
                <li>• Use {'{{index}}'} to access the current item index</li>
                <li>• Drag components into the repeater to design the item template</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No properties available for this component type.
          </div>
        );
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Component Properties
      </h3>
      {renderPropertyFields()}
    </div>
  );
};
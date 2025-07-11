import React from 'react';
import { ComponentInstance } from '../types';
import { useBuilderStore } from '../stores/builder.store';
import { Palette, Square, Type, Layers, Move } from 'lucide-react';

interface StyleEditorProps {
  component: ComponentInstance;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ component }) => {
  const { updateComponentStyle } = useBuilderStore();

  const handleStyleChange = (property: string, value: any) => {
    updateComponentStyle(component.id, { [property]: value });
  };

  const currentStyle = component.style || {};

  return (
    <div className="space-y-6">
      {/* Layout Section */}
      <div className="sidebar-section">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Layers className="w-4 h-4" />
          Layout
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display</label>
            <select
              value={currentStyle.display || 'block'}
              onChange={(e) => handleStyleChange('display', e.target.value)}
              className="property-input"
            >
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="inline-block">Inline Block</option>
              <option value="grid">Grid</option>
              <option value="none">None</option>
            </select>
          </div>

          {currentStyle.display === 'flex' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                <select
                  value={currentStyle.flexDirection || 'row'}
                  onChange={(e) => handleStyleChange('flexDirection', e.target.value)}
                  className="property-input"
                >
                  <option value="row">Row</option>
                  <option value="column">Column</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justify Content</label>
                <select
                  value={currentStyle.justifyContent || 'flex-start'}
                  onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
                  className="property-input"
                >
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Align Items</label>
                <select
                  value={currentStyle.alignItems || 'stretch'}
                  onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                  className="property-input"
                >
                  <option value="stretch">Stretch</option>
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spacing Section */}
      <div className="sidebar-section">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Move className="w-4 h-4" />
          Spacing
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                placeholder="All"
                value={currentStyle.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="T"
                value={parseInt(currentStyle.paddingTop) || ''}
                onChange={(e) => handleStyleChange('paddingTop', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="R"
                value={parseInt(currentStyle.paddingRight) || ''}
                onChange={(e) => handleStyleChange('paddingRight', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="B"
                value={parseInt(currentStyle.paddingBottom) || ''}
                onChange={(e) => handleStyleChange('paddingBottom', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                placeholder="All"
                value={currentStyle.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="T"
                value={parseInt(currentStyle.marginTop) || ''}
                onChange={(e) => handleStyleChange('marginTop', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="R"
                value={parseInt(currentStyle.marginRight) || ''}
                onChange={(e) => handleStyleChange('marginRight', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
              <input
                type="number"
                placeholder="B"
                value={parseInt(currentStyle.marginBottom) || ''}
                onChange={(e) => handleStyleChange('marginBottom', e.target.value ? `${e.target.value}px` : '')}
                className="property-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Size Section */}
      <div className="sidebar-section">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Square className="w-4 h-4" />
          Size
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="text"
                placeholder="auto"
                value={currentStyle.width || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                className="property-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="text"
                placeholder="auto"
                value={currentStyle.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                className="property-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Width</label>
              <input
                type="text"
                placeholder="none"
                value={currentStyle.minWidth || ''}
                onChange={(e) => handleStyleChange('minWidth', e.target.value)}
                className="property-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Width</label>
              <input
                type="text"
                placeholder="none"
                value={currentStyle.maxWidth || ''}
                onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                className="property-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="sidebar-section">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Palette className="w-4 h-4" />
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentStyle.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={currentStyle.backgroundColor || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="property-input flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border</label>
            <input
              type="text"
              placeholder="1px solid #e5e7eb"
              value={currentStyle.border || ''}
              onChange={(e) => handleStyleChange('border', e.target.value)}
              className="property-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
            <input
              type="text"
              placeholder="0px"
              value={currentStyle.borderRadius || ''}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              className="property-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box Shadow</label>
            <input
              type="text"
              placeholder="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
              value={currentStyle.boxShadow || ''}
              onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
              className="property-input"
            />
          </div>
        </div>
      </div>

      {/* Typography Section */}
      {(component.componentId === 'text' || component.componentId === 'button') && (
        <div className="sidebar-section">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
            <Type className="w-4 h-4" />
            Typography
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="text"
                placeholder="16px"
                value={currentStyle.fontSize || ''}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className="property-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
              <select
                value={currentStyle.fontWeight || 'normal'}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="property-input"
              >
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={currentStyle.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentStyle.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="#000000"
                  className="property-input flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Align</label>
              <select
                value={currentStyle.textAlign || 'left'}
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="property-input"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line Height</label>
              <input
                type="text"
                placeholder="1.5"
                value={currentStyle.lineHeight || ''}
                onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                className="property-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Letter Spacing</label>
              <input
                type="text"
                placeholder="0px"
                value={currentStyle.letterSpacing || ''}
                onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                className="property-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Decoration</label>
              <select
                value={currentStyle.textDecoration || 'none'}
                onChange={(e) => handleStyleChange('textDecoration', e.target.value)}
                className="property-input"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="overline">Overline</option>
                <option value="line-through">Line Through</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Transform</label>
              <select
                value={currentStyle.textTransform || 'none'}
                onChange={(e) => handleStyleChange('textTransform', e.target.value)}
                className="property-input"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Overflow</label>
              <select
                value={currentStyle.textOverflow || 'visible'}
                onChange={(e) => handleStyleChange('textOverflow', e.target.value)}
                className="property-input"
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="clip">Clip</option>
                <option value="ellipsis">Ellipsis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">White Space</label>
              <select
                value={currentStyle.whiteSpace || 'normal'}
                onChange={(e) => handleStyleChange('whiteSpace', e.target.value)}
                className="property-input"
              >
                <option value="normal">Normal</option>
                <option value="nowrap">No Wrap</option>
                <option value="pre">Preserve</option>
                <option value="pre-wrap">Preserve Wrap</option>
                <option value="pre-line">Preserve Line</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
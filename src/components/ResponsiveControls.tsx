import React, { useState } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Eye, 
  EyeOff,
  Move,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  Rows,
  Settings,
  X
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentInstance } from '../types';

interface ResponsiveControlsProps {
  component: ComponentInstance;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

const breakpoints = [
  { name: 'mobile', icon: Smartphone, label: 'Mobile', width: '< 640px' },
  { name: 'tablet', icon: Tablet, label: 'Tablet', width: '640px - 1024px' },
  { name: 'desktop', icon: Monitor, label: 'Desktop', width: '> 1024px' }
];

export const ResponsiveControls: React.FC<ResponsiveControlsProps> = ({ component }) => {
  const { updateComponentResponsiveStyles } = useBuilderStore();
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const responsiveStyles = component.responsiveStyles || {};
  const currentStyles = responsiveStyles[activeBreakpoint] || {};
  
  const updateStyle = (property: string, value: any) => {
    const newStyles = {
      ...responsiveStyles,
      [activeBreakpoint]: {
        ...currentStyles,
        [property]: value
      }
    };
    updateComponentResponsiveStyles(component.id, newStyles);
  };
  
  const removeStyle = (property: string) => {
    const newBreakpointStyles = { ...currentStyles };
    delete newBreakpointStyles[property];
    
    const newStyles = {
      ...responsiveStyles,
      [activeBreakpoint]: newBreakpointStyles
    };
    updateComponentResponsiveStyles(component.id, newStyles);
  };
  
  const toggleVisibility = () => {
    const currentDisplay = currentStyles.display;
    updateStyle('display', currentDisplay === 'none' ? undefined : 'none');
  };
  
  return (
    <div className="space-y-4">
      {/* Breakpoint Selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Responsive Design</h3>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {breakpoints.map((bp) => (
            <button
              key={bp.name}
              onClick={() => setActiveBreakpoint(bp.name as Breakpoint)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeBreakpoint === bp.name
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={bp.width}
            >
              <bp.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{bp.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Breakpoint Info */}
      <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          Editing for <strong>{activeBreakpoint}</strong> ({breakpoints.find(b => b.name === activeBreakpoint)?.width})
        </p>
      </div>
      
      {/* Visibility Toggle */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Visibility</span>
          <button
            onClick={toggleVisibility}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-all ${
              currentStyles.display === 'none'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-green-50 border-green-300 text-green-700'
            }`}
          >
            {currentStyles.display === 'none' ? (
              <>
                <EyeOff className="w-3 h-3" />
                Hidden
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Visible
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Layout Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">Layout</h4>
        
        {/* Width */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentStyles.width || ''}
              onChange={(e) => updateStyle('width', e.target.value)}
              placeholder="auto"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg"
            />
            <select
              value={currentStyles.width?.includes('%') ? '%' : currentStyles.width?.includes('px') ? 'px' : 'auto'}
              onChange={(e) => {
                const unit = e.target.value;
                if (unit === 'auto') {
                  removeStyle('width');
                } else {
                  const numValue = parseInt(currentStyles.width) || 100;
                  updateStyle('width', `${numValue}${unit}`);
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="auto">Auto</option>
              <option value="%">%</option>
              <option value="px">px</option>
            </select>
          </div>
        </div>
        
        {/* Max Width */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Max Width</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentStyles.maxWidth || ''}
              onChange={(e) => updateStyle('maxWidth', e.target.value)}
              placeholder="none"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => removeStyle('maxWidth')}
              className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Flexbox Controls */}
      {(component.componentId === 'container' || component.componentId === 'form') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-700">Flexbox</h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
          
          {/* Direction */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Direction</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => updateStyle('flexDirection', 'row')}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded border transition-all ${
                  currentStyles.flexDirection === 'row'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Columns className="w-3 h-3" />
                Row
              </button>
              <button
                onClick={() => updateStyle('flexDirection', 'column')}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded border transition-all ${
                  currentStyles.flexDirection === 'column'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Rows className="w-3 h-3" />
                Column
              </button>
            </div>
          </div>
          
          {/* Justify */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Justify Content</label>
            <select
              value={currentStyles.justifyContent || 'start'}
              onChange={(e) => updateStyle('justifyContent', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>
          
          {/* Align Items */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Align Items</label>
            <select
              value={currentStyles.alignItems || 'stretch'}
              onChange={(e) => updateStyle('alignItems', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>
          
          {showAdvanced && (
            <>
              {/* Gap */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gap</label>
                <input
                  type="text"
                  value={currentStyles.gap || ''}
                  onChange={(e) => updateStyle('gap', e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              
              {/* Flex Wrap */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Flex Wrap</label>
                <select
                  value={currentStyles.flexWrap || 'nowrap'}
                  onChange={(e) => updateStyle('flexWrap', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="nowrap">No Wrap</option>
                  <option value="wrap">Wrap</option>
                  <option value="wrap-reverse">Wrap Reverse</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Spacing Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700">Spacing</h4>
        
        {/* Padding */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Padding</label>
          <div className="grid grid-cols-4 gap-1">
            <input
              type="text"
              value={currentStyles.paddingTop || ''}
              onChange={(e) => updateStyle('paddingTop', e.target.value)}
              placeholder="T"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.paddingRight || ''}
              onChange={(e) => updateStyle('paddingRight', e.target.value)}
              placeholder="R"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.paddingBottom || ''}
              onChange={(e) => updateStyle('paddingBottom', e.target.value)}
              placeholder="B"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.paddingLeft || ''}
              onChange={(e) => updateStyle('paddingLeft', e.target.value)}
              placeholder="L"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
          </div>
        </div>
        
        {/* Margin */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Margin</label>
          <div className="grid grid-cols-4 gap-1">
            <input
              type="text"
              value={currentStyles.marginTop || ''}
              onChange={(e) => updateStyle('marginTop', e.target.value)}
              placeholder="T"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.marginRight || ''}
              onChange={(e) => updateStyle('marginRight', e.target.value)}
              placeholder="R"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.marginBottom || ''}
              onChange={(e) => updateStyle('marginBottom', e.target.value)}
              placeholder="B"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
            <input
              type="text"
              value={currentStyles.marginLeft || ''}
              onChange={(e) => updateStyle('marginLeft', e.target.value)}
              placeholder="L"
              className="px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
          </div>
        </div>
      </div>
      
      {/* Text Alignment (for text components) */}
      {component.componentId === 'text' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => updateStyle('textAlign', 'left')}
              className={`flex items-center justify-center p-1.5 rounded border transition-all ${
                currentStyles.textAlign === 'left'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'center')}
              className={`flex items-center justify-center p-1.5 rounded border transition-all ${
                currentStyles.textAlign === 'center'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              onClick={() => updateStyle('textAlign', 'right')}
              className={`flex items-center justify-center p-1.5 rounded border transition-all ${
                currentStyles.textAlign === 'right'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Active Responsive Styles Summary */}
      {Object.keys(currentStyles).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            Active Styles ({activeBreakpoint})
          </h4>
          <div className="space-y-1">
            {Object.entries(currentStyles).map(([property, value]) => (
              <div key={property} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{property}:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-gray-900">{String(value)}</span>
                  <button
                    onClick={() => removeStyle(property)}
                    className="p-0.5 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
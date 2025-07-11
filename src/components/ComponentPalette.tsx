import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Square, 
  Image, 
  FileText, 
  Table2, 
  List,
  MousePointer2,
  ToggleLeft,
  Navigation,
  Columns,
  Grid3X3,
  FormInput,
  Repeat,
  Store,
  Plus
} from 'lucide-react';
import { ComponentType } from '../types';
import { ComponentMarketplace } from './ComponentMarketplace';

interface DraggableComponentProps {
  type: ComponentType;
  icon: React.ReactNode;
  label: string;
  description?: string;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ type, icon, label, description }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: () => {
      console.log('Dragging component:', type);
      return { type, isNew: true };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`component-tile group ${isDragging ? 'opacity-50' : ''}`}
      data-component-id={type}
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-500 group-hover:text-blue-600 transition-colors duration-200">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{label}</div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  const [showMarketplace, setShowMarketplace] = useState(false);
  const basicComponents = [
    { type: 'text' as ComponentType, icon: <Type className="w-4 h-4" />, label: 'Text', description: 'Static or dynamic text' },
    { type: 'button' as ComponentType, icon: <MousePointer2 className="w-4 h-4" />, label: 'Button', description: 'Clickable action' },
    { type: 'input' as ComponentType, icon: <FormInput className="w-4 h-4" />, label: 'Input', description: 'Text input field' },
    { type: 'image' as ComponentType, icon: <Image className="w-4 h-4" />, label: 'Image', description: 'Static or dynamic image' },
  ];

  const layoutComponents = [
    { type: 'container' as ComponentType, icon: <Square className="w-4 h-4" />, label: 'Container', description: 'Group elements' },
    { type: 'form' as ComponentType, icon: <FileText className="w-4 h-4" />, label: 'Form', description: 'Data collection' },
    { type: 'repeater' as ComponentType, icon: <Repeat className="w-4 h-4" />, label: 'Repeater', description: 'Dynamic list from data' },
    { type: 'table' as ComponentType, icon: <Table2 className="w-4 h-4" />, label: 'Table', description: 'Data display' },
  ];

  const advancedComponents = [
    { type: 'custom' as ComponentType, icon: <Grid3X3 className="w-4 h-4" />, label: 'Grid', description: 'Grid layout' },
    { type: 'custom' as ComponentType, icon: <Columns className="w-4 h-4" />, label: 'Columns', description: 'Column layout' },
    { type: 'navigation' as ComponentType, icon: <Navigation className="w-4 h-4" />, label: 'Navigation', description: 'Menu & routing' },
    { type: 'custom' as ComponentType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Toggle', description: 'On/off switch' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic</h3>
        <div className="grid grid-cols-2 gap-2">
          {basicComponents.map((comp) => (
            <DraggableComponent key={comp.type + comp.label} {...comp} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layout</h3>
        <div className="grid grid-cols-2 gap-2">
          {layoutComponents.map((comp) => (
            <DraggableComponent key={comp.type + comp.label} {...comp} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Advanced</h3>
        <div className="grid grid-cols-2 gap-2">
          {advancedComponents.map((comp) => (
            <DraggableComponent key={comp.type + comp.label} {...comp} />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Custom Components</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setShowMarketplace(true)}
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md text-sm"
          >
            <Store className="w-4 h-4" />
            Component Store
          </button>
          <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create Component
          </button>
        </div>
      </div>
      
      {/* Component Marketplace Modal */}
      <ComponentMarketplace 
        isOpen={showMarketplace} 
        onClose={() => setShowMarketplace(false)} 
      />
    </div>
  );
};
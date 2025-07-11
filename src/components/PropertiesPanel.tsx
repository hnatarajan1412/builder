import React from 'react';
import { X } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { PropertyPanel } from './PropertyPanel';

export const PropertiesPanel: React.FC = () => {
  const { selectedComponent, togglePropertiesPanel } = useBuilderStore();

  if (!selectedComponent) return null;

  return (
    <aside className="w-80 glass-panel border-l flex flex-col shadow-xl animate-slideIn">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-bold text-gray-900">Properties</h2>
        <button
          onClick={togglePropertiesPanel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <PropertyPanel component={selectedComponent} />
    </aside>
  );
};
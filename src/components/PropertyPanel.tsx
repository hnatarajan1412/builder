import React, { useState } from 'react';
import { ComponentInstance } from '../types';
import { PropertyEditor } from './PropertyEditor';
import { StyleEditor } from './StyleEditor';
import { EventsEditor } from './EventsEditor';
import { RepeaterPropertiesPanel } from './RepeaterPropertiesPanel';
import { FormPropertiesPanel } from './FormPropertiesPanel';
import { ResponsiveControls } from './ResponsiveControls';
import * as Tabs from '@radix-ui/react-tabs';
import { Settings, Palette, Zap, Smartphone } from 'lucide-react';

interface PropertyPanelProps {
  component: ComponentInstance;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ component }) => {
  const [activeTab, setActiveTab] = useState('props');

  return (
    <div className="h-full flex flex-col">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-gray-200">
          <Tabs.Trigger
            value="props"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            <Settings className="w-4 h-4" />
            Props
          </Tabs.Trigger>
          <Tabs.Trigger
            value="style"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            <Palette className="w-4 h-4" />
            Style
          </Tabs.Trigger>
          <Tabs.Trigger
            value="events"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            <Zap className="w-4 h-4" />
            Events
          </Tabs.Trigger>
          <Tabs.Trigger
            value="responsive"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            <Smartphone className="w-4 h-4" />
            Responsive
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="props" className="flex-1 overflow-y-auto p-4">
          {component.componentId === 'repeater' ? (
            <RepeaterPropertiesPanel componentId={component.id} />
          ) : component.componentId === 'form' ? (
            <FormPropertiesPanel componentId={component.id} />
          ) : (
            <PropertyEditor component={component} />
          )}
        </Tabs.Content>

        <Tabs.Content value="style" className="flex-1 overflow-y-auto p-4">
          <StyleEditor component={component} />
        </Tabs.Content>

        <Tabs.Content value="events" className="flex-1 overflow-y-auto p-4">
          <EventsEditor component={component} />
        </Tabs.Content>

        <Tabs.Content value="responsive" className="flex-1 overflow-y-auto p-4">
          <ResponsiveControls component={component} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
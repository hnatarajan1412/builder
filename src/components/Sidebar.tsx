import React from 'react';
import { 
  Layout, 
  Database,
  Layers
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentPalette } from './ComponentPalette';
import { PagesPanel } from './PagesPanel';
import { EnhancedDataPanel } from './EnhancedDataPanel';
import * as Tabs from '@radix-ui/react-tabs';

export const Sidebar: React.FC = () => {
  const { sidebarTab, setSidebarTab } = useBuilderStore();

  return (
    <aside className="w-80 glass-panel border-r flex flex-col shadow-xl">
      <Tabs.Root value={sidebarTab} onValueChange={(value: any) => setSidebarTab(value)}>
        <Tabs.List className="flex border-b border-gray-100 bg-gray-50/50">
          <Tabs.Trigger 
            value="components" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium tab data-[state=active]:tab-active transition-all duration-200"
          >
            <Layout className="w-4 h-4" />
            Components
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="pages" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium tab data-[state=active]:tab-active transition-all duration-200"
          >
            <Layers className="w-4 h-4" />
            Pages
          </Tabs.Trigger>
          
          <Tabs.Trigger 
            value="data" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium tab data-[state=active]:tab-active transition-all duration-200"
          >
            <Database className="w-4 h-4" />
            Data
          </Tabs.Trigger>
        </Tabs.List>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <Tabs.Content value="components" className="p-6 animate-fadeIn">
            <ComponentPalette />
          </Tabs.Content>
          
          <Tabs.Content value="pages" className="p-6 animate-fadeIn">
            <PagesPanel />
          </Tabs.Content>
          
          <Tabs.Content value="data" className="h-full animate-fadeIn">
            <EnhancedDataPanel />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </aside>
  );
};
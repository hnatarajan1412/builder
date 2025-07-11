import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppHeader } from './components/AppHeader';
import { EnhancedSidePanel } from './components/EnhancedSidePanel';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AppSelector } from './components/AppSelector';
import { useBuilderStore } from './stores/builder.store';
import { useHistoryStore } from './stores/history.store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  const store = useBuilderStore();
  const { propertiesPanel, selectedComponent, currentApp, apps } = store;
  const [showAppSelector, setShowAppSelector] = useState(false);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  
  useEffect(() => {
    // Clear history on mount
    useHistoryStore.getState().clearHistory();
    
    // Check if we have any apps, if not show app selector
    if (apps.length === 0) {
      setShowAppSelector(true);
    } else if (!currentApp && apps.length > 0) {
      // If we have apps but none selected, select the first one
      store.loadApp(apps[0].id);
    }
  }, [apps, currentApp]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
        <AppHeader onOpenAppSelector={() => setShowAppSelector(true)} />
        
        <div className="flex-1 flex overflow-hidden relative">
          {/* Dynamic Side Panel */}
          <EnhancedSidePanel />
          
          {/* Main Canvas */}
          <div className="flex-1 flex flex-col">
            {currentApp ? (
              <Canvas />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center card p-8 max-w-md animate-fadeIn">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No app selected</h2>
                    <p className="text-gray-600">Create a new app or select an existing one to get started</p>
                  </div>
                  <button
                    onClick={() => setShowAppSelector(true)}
                    className="btn btn-primary"
                  >
                    Select or Create App
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Properties Panel */}
          {propertiesPanel && selectedComponent && (
            <PropertiesPanel />
          )}
        </div>
        
        {/* App Selector Modal */}
        {showAppSelector && (
          <AppSelector onClose={() => setShowAppSelector(false)} />
        )}
      </div>
    </DndProvider>
  );
};
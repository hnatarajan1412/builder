import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentPalette } from './ComponentPalette';
import { PagesPanel } from './PagesPanel';
import { TableDataViewer } from './TableDataViewer';
import { EnhancedDataPanel } from './EnhancedDataPanel';

export const EnhancedSidePanel: React.FC = () => {
  const { 
    sidePanelMode, 
    setSidePanelMode
  } = useBuilderStore();
  
  const [width, setWidth] = useState(320); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [autoSize, setAutoSize] = useState(true); // Enable auto-sizing by default
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-adjust width based on content
  useEffect(() => {
    if (!autoSize || !contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentWidth = entry.target.scrollWidth;
        // Add some padding to the content width
        const desiredWidth = Math.min(Math.max(contentWidth + 40, 320), 800);
        setWidth(desiredWidth);
      }
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoSize, sidePanelMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 800) {
        setWidth(newWidth);
        setAutoSize(false); // Disable auto-sizing when manually resizing
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Re-enable auto-sizing when panel mode changes
  useEffect(() => {
    setAutoSize(true);
  }, [sidePanelMode]);

  if (!sidePanelMode) return null;

  const renderContent = () => {
    switch (sidePanelMode) {
      case 'components':
        return (
          <div className="p-4">
            <ComponentPalette />
          </div>
        );
        
      case 'database':
        return <EnhancedDataPanel />;
        
      case 'table-data':
        return <TableDataViewer />;
        
      case 'pages':
        return (
          <div className="p-4">
            <PagesPanel />
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <p className="text-sm text-gray-600">App settings and configuration</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <aside 
        ref={panelRef}
        style={{ 
          width: `${width}px`,
          transition: isResizing ? 'none' : 'width 0.3s ease-out'
        }}
        className="bg-white border-r border-gray-200 flex flex-col shadow-lg animate-slideIn relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {sidePanelMode === 'components' && 'Components'}
            {sidePanelMode === 'database' && 'Database'}
            {sidePanelMode === 'table-data' && 'Table Data'}
            {sidePanelMode === 'pages' && 'Pages'}
            {sidePanelMode === 'settings' && 'Settings'}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoSize(!autoSize)}
              className={`p-1.5 rounded-lg transition-colors ${
                autoSize ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={autoSize ? 'Auto-sizing enabled' : 'Auto-sizing disabled'}
            >
              {autoSize ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSidePanelMode(null)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
        
        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-100 transition-colors group"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="absolute inset-y-0 right-0 w-0.5 bg-gray-200 group-hover:bg-blue-400 transition-colors" />
          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </aside>
      
      {/* Overlay during resize */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-ew-resize" />
      )}
    </>
  );
};
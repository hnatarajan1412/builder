import React, { useState } from 'react';
import { 
  Plus,
  Database,
  Layers,
  Settings,
  Eye,
  Play,
  Save,
  Download,
  ChevronDown,
  FileText,
  Palette,
  X
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { UndoRedoControls } from './UndoRedoControls';
import { PreviewMode } from './PreviewMode';

interface AppHeaderProps {
  onOpenAppSelector: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAppSelector }) => {
  const { currentApp, currentPage, setSidePanelMode, sidePanelMode } = useBuilderStore();
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleIconClick = (mode: 'components' | 'database' | 'pages' | 'settings') => {
    // Toggle panel - if clicking same icon, close panel
    if (sidePanelMode === mode) {
      setSidePanelMode(null);
    } else {
      setSidePanelMode(mode);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-1">
          {/* App Logo */}
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-white" />
          </div>
          
          {/* App Name */}
          <button 
            onClick={onOpenAppSelector}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900">{currentApp?.name || 'Select App'}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Center Icons */}
        <div className="flex items-center">
          {/* Icon Navigation */}
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 mr-6">
            <button
              onClick={() => handleIconClick('components')}
              className={`p-2 rounded-md transition-all ${
                sidePanelMode === 'components' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Components"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleIconClick('database')}
              className={`p-2 rounded-md transition-all ${
                sidePanelMode === 'database' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Database"
            >
              <Database className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleIconClick('pages')}
              className={`p-2 rounded-md transition-all ${
                sidePanelMode === 'pages' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Pages"
            >
              <Layers className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleIconClick('settings')}
              className={`p-2 rounded-md transition-all ${
                sidePanelMode === 'settings' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="mr-6">
            <UndoRedoControls />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            onClick={() => setShowPreview(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" />
            Publish
          </button>
          
          {/* Debug: Clear data */}
          <button 
            onClick={() => {
              if (window.confirm('Clear all data and start fresh?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors ml-2"
            title="Clear all data"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </header>
      
      <PreviewMode isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </>
  );
};
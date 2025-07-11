import React, { useEffect } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { useHistoryStore } from '../stores/history.store';

export const UndoRedoControls: React.FC = () => {
  const { undo, redo } = useBuilderStore();
  const canUndo = useHistoryStore((state) => state.canUndo());
  const canRedo = useHistoryStore((state) => state.canRedo());
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (useHistoryStore.getState().canUndo()) {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (useHistoryStore.getState().canRedo()) {
          redo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (useHistoryStore.getState().canRedo()) {
          redo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
  
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`
          p-2 rounded-md transition-all
          ${canUndo 
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title={`Undo (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Z)`}
      >
        <Undo2 className="w-5 h-5" />
      </button>
      
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`
          p-2 rounded-md transition-all
          ${canRedo 
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title={`Redo (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Shift+Z)`}
      >
        <Redo2 className="w-5 h-5" />
      </button>
    </div>
  );
};
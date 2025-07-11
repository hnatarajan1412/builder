import { useEffect } from 'react';
import { useBuilderStore } from '../stores/builder.store';

export const useKeyboardShortcuts = () => {
  const { 
    selectedComponent, 
    duplicateComponent, 
    removeComponent,
    undo,
    redo 
  } = useBuilderStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't trigger shortcuts when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + D - Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedComponent) {
          duplicateComponent(selectedComponent.id);
        }
      }
      
      // Delete/Backspace - Delete component
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponent) {
        e.preventDefault();
        removeComponent(selectedComponent.id);
      }
      
      // Escape - Deselect
      if (e.key === 'Escape') {
        useBuilderStore.getState().selectComponent(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, duplicateComponent, removeComponent, undo, redo]);
};
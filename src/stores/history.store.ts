import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Page } from '../types';

interface HistoryEntry {
  page: Page;
  timestamp: number;
}

interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
  maxHistorySize: number;
  
  // Actions
  pushHistory: (page: Page) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set, get) => ({
      past: [],
      present: null,
      future: [],
      maxHistorySize: 50,
      
      pushHistory: (page) => {
        const { past, present, maxHistorySize } = get();
        const newEntry: HistoryEntry = {
          page: JSON.parse(JSON.stringify(page)), // Deep clone
          timestamp: Date.now()
        };
        
        const newPast = present ? [...past, present] : past;
        
        // Limit history size
        const trimmedPast = newPast.length > maxHistorySize 
          ? newPast.slice(newPast.length - maxHistorySize)
          : newPast;
        
        set({
          past: trimmedPast,
          present: newEntry,
          future: [] // Clear future when new action is performed
        });
      },
      
      undo: () => {
        const { past, present } = get();
        if (past.length === 0) return null;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        
        set({
          past: newPast,
          present: previous,
          future: present ? [present, ...get().future] : get().future
        });
        
        return previous;
      },
      
      redo: () => {
        const { future, present } = get();
        if (future.length === 0) return null;
        
        const next = future[0];
        const newFuture = future.slice(1);
        
        set({
          past: present ? [...get().past, present] : get().past,
          present: next,
          future: newFuture
        });
        
        return next;
      },
      
      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,
      
      clearHistory: () => {
        set({
          past: [],
          present: null,
          future: []
        });
      }
    })
  )
);
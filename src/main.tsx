import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Expose services for testing
import { useBuilderStore } from './stores/builder.store';
import { hybridDatabaseService } from './services/hybrid-database.service';
import { databaseService } from './services/database-compat.service';
import { MagicTextProcessor } from './utils/magicTextProcessor';

// Initialize hybrid database service
hybridDatabaseService.initialize().then(() => {
  console.log('🚀 Hybrid Database Service initialized');
});

// Make services available globally for E2E tests
if (typeof window !== 'undefined') {
  (window as any).useBuilderStore = useBuilderStore;
  (window as any).hybridDatabaseService = hybridDatabaseService;
  (window as any).databaseService = databaseService; // For backward compatibility
  (window as any).MagicTextProcessor = MagicTextProcessor;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
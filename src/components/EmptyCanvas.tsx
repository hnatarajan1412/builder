import React from 'react';
import { Layout, Plus } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';

export const EmptyCanvas: React.FC = () => {
  const { currentApp, createPage, setCurrentPage, setSidebarTab } = useBuilderStore();
  
  const handleCreatePage = async () => {
    if (!currentApp) {
      // If no app exists, create a default one first
      return;
    }
    
    // Create a default page
    const newPage = await createPage({
      appId: currentApp.id,
      name: 'Home',
      path: '/',
      components: []
    });
    
    setCurrentPage(newPage);
    setSidebarTab('components');
  };
  
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Layout className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Page Selected</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {currentApp 
            ? "Select a page from the sidebar or create a new one to start building your interface"
            : "No app loaded. Please create or select an app first."
          }
        </p>
        {currentApp && (
          <button 
            onClick={handleCreatePage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Page
          </button>
        )}
      </div>
    </div>
  );
};
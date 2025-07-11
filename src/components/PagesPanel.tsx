import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import * as Dialog from '@radix-ui/react-dialog';

export const PagesPanel: React.FC = () => {
  const { currentApp, currentPage, pages, createPage, updatePage, deletePage, setCurrentPage } = useBuilderStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPath, setEditPath] = useState('');

  // New page form state
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');

  if (!currentApp) {
    return (
      <div className="empty-state py-8">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No app selected</p>
      </div>
    );
  }

  const appPages = Object.values(pages).filter(page => page.appId === currentApp.id);

  const handleCreatePage = async () => {
    if (!newPageName || !newPagePath) return;
    
    const page = await createPage({
      appId: currentApp.id,
      name: newPageName,
      path: newPagePath,
      components: []
    });
    
    setCurrentPage(page);
    setIsCreating(false);
    setNewPageName('');
    setNewPagePath('');
  };

  const handleUpdatePage = async (pageId: string) => {
    if (!editName || !editPath) return;
    
    await updatePage(pageId, {
      name: editName,
      path: editPath
    });
    
    setEditingId(null);
  };

  const handleDeletePage = async (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      await deletePage(pageId);
      if (currentPage?.id === pageId) {
        setCurrentPage(null);
      }
    }
  };

  const startEditing = (page: any) => {
    setEditingId(page.id);
    setEditName(page.name);
    setEditPath(page.path);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">Pages</h3>
        <Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
          <Dialog.Trigger asChild>
            <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200">
              <Plus className="w-3 h-3" />
              Add
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="modal-backdrop" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 modal-content p-5 w-96 animate-scaleIn">
              <Dialog.Title className="text-base font-semibold mb-3">Create New Page</Dialog.Title>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="page-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Page Name
                  </label>
                  <input
                    id="page-name"
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="About Us"
                    className="property-input"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="page-path" className="block text-sm font-medium text-gray-700 mb-1">
                    Path
                  </label>
                  <input
                    id="page-path"
                    type="text"
                    value={newPagePath}
                    onChange={(e) => setNewPagePath(e.target.value)}
                    placeholder="/about"
                    className="property-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Dialog.Close asChild>
                  <button className="btn btn-ghost text-sm">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleCreatePage}
                  disabled={!newPageName || !newPagePath}
                  className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="flex-1 overflow-y-auto">
        {appPages.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
            <p className="text-xs text-gray-500">No pages yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Click "Add" to create one</p>
          </div>
        ) : (
          <div className="space-y-1">
            {appPages.map((page) => (
              <div
                key={page.id}
                className={`
                  group px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all duration-200
                  ${currentPage?.id === page.id 
                    ? 'border-blue-400 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => setCurrentPage(page)}
              >
                {editingId === page.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="text"
                      value={editPath}
                      onChange={(e) => setEditPath(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdatePage(page.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{page.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{page.path}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(page);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {page.components && page.components.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {page.components.length} component{page.components.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
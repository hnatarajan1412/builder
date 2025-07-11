import React, { useState } from 'react';
import { X, Plus, Folder, Calendar } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import * as Dialog from '@radix-ui/react-dialog';

interface AppSelectorProps {
  onClose: () => void;
}

export const AppSelector: React.FC<AppSelectorProps> = ({ onClose }) => {
  const { apps, currentApp, createApp, loadApp, deleteApp } = useBuilderStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDescription, setNewAppDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApp = async () => {
    if (!newAppName.trim()) return;
    
    setIsCreating(true);
    try {
      const app = await createApp({
        name: newAppName,
        description: newAppDescription,
        pages: [],
        components: [],
        tables: []
      });
      
      // Load the newly created app
      await loadApp(app.id);
      
      // Reset form and close
      setNewAppName('');
      setNewAppDescription('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Failed to create app:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectApp = async (appId: string) => {
    await loadApp(appId);
    onClose();
  };

  const handleDeleteApp = async (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this app?')) {
      await deleteApp(appId);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop animate-fadeIn" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] modal-content overflow-hidden animate-scaleIn">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Apps
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {!showCreateForm ? (
              <>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-3 text-gray-600 hover:text-blue-600 group"
                >
                  <Plus className="w-5 h-5" />
                  Create New App
                </button>

                <div className="space-y-2">
                  {apps.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No apps yet. Create your first app!
                    </p>
                  ) : (
                    apps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleSelectApp(app.id)}
                        className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          currentApp?.id === app.id
                            ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Folder className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{app.name}</h3>
                              {app.description && (
                                <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(app.id.split('-')[1] || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteApp(app.id, e)}
                            className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 hover:opacity-100 transition-all duration-200"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New App</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="Enter app name"
                    className="property-input w-full"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newAppDescription}
                    onChange={(e) => setNewAppDescription(e.target.value)}
                    placeholder="Enter app description"
                    rows={3}
                    className="property-input w-full"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateApp}
                    disabled={!newAppName.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create App'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewAppName('');
                      setNewAppDescription('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
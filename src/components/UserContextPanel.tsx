import React, { useState } from 'react';
import { User, UserPlus, LogIn, LogOut, Settings } from 'lucide-react';
import { useUserStore } from '../stores/user.store';
import * as Dialog from '@radix-ui/react-dialog';

export const UserContextPanel: React.FC = () => {
  const {
    loggedInUser,
    currentUser,
    userSettings,
    setCurrentUser,
    addMockUser,
    removeMockUser,
    mockLogin,
    mockLogout,
  } = useUserStore();
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
  });

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: `user-${Date.now()}`,
        ...newUser,
      };
      addMockUser(user);
      setNewUser({ name: '', email: '', role: 'user' });
      setShowAddUser(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4" />
          User Context
        </h3>
        <Dialog.Root open={showAddUser} onOpenChange={setShowAddUser}>
          <Dialog.Trigger asChild>
            <button
              className="p-1 hover:bg-gray-100 rounded"
              title="Add mock user"
            >
              <UserPlus className="w-4 h-4 text-gray-600" />
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96 z-50">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Add Mock User
              </Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Add User
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      
      {/* Logged-in User Info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 mb-1">Logged-in User (Developer)</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{loggedInUser?.name}</div>
            <div className="text-xs text-gray-500">{loggedInUser?.email}</div>
          </div>
        </div>
      </div>
      
      {/* Current User Context */}
      <div className="space-y-3">
        <div className="text-xs text-gray-500">Current User Context</div>
        
        {currentUser ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500">{currentUser.email}</div>
                  <div className="text-xs text-gray-400">Role: {currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={mockLogout}
                className="p-2 hover:bg-gray-200 rounded"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No user logged in</div>
        )}
        
        {/* Mock Users List */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Available Test Users</div>
          {userSettings.mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => mockLogin(user.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </div>
              {currentUser?.id === user.id ? (
                <div className="text-xs text-green-600">Active</div>
              ) : (
                <LogIn className="w-3 h-3 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Message */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Switch between users to test how your app behaves for different user contexts.
          Use <code className="bg-gray-100 px-1 rounded">{'{{user.*}}'}</code> for logged-in user
          and <code className="bg-gray-100 px-1 rounded">{'{{currentUser.*}}'}</code> for the active context.
        </p>
      </div>
    </div>
  );
};
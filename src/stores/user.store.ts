import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

interface UserStore {
  // Logged-in user (the builder/developer)
  loggedInUser: User | null;
  
  // Current user context (for preview/runtime)
  currentUser: User | null;
  
  // User-related settings
  userSettings: {
    enableUserContext: boolean;
    mockUsers: User[];
  };
  
  // Actions
  setLoggedInUser: (user: User | null) => void;
  setCurrentUser: (user: User | null) => void;
  updateUserSettings: (settings: Partial<UserStore['userSettings']>) => void;
  addMockUser: (user: User) => void;
  removeMockUser: (userId: string) => void;
  
  // Mock authentication for testing
  mockLogin: (userId: string) => void;
  mockLogout: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        loggedInUser: {
          id: 'dev-user-1',
          name: 'App Developer',
          email: 'developer@example.com',
          role: 'developer',
        },
        
        currentUser: null,
        
        userSettings: {
          enableUserContext: true,
          mockUsers: [
            {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin',
            },
            {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user',
            },
            {
              id: 'user-3',
              name: 'Bob Johnson',
              email: 'bob@example.com',
              role: 'manager',
            },
          ],
        },
        
        setLoggedInUser: (user) => set({ loggedInUser: user }),
        
        setCurrentUser: (user) => set({ currentUser: user }),
        
        updateUserSettings: (settings) =>
          set((state) => ({
            userSettings: { ...state.userSettings, ...settings },
          })),
        
        addMockUser: (user) =>
          set((state) => ({
            userSettings: {
              ...state.userSettings,
              mockUsers: [...state.userSettings.mockUsers, user],
            },
          })),
        
        removeMockUser: (userId) =>
          set((state) => ({
            userSettings: {
              ...state.userSettings,
              mockUsers: state.userSettings.mockUsers.filter((u) => u.id !== userId),
            },
          })),
        
        mockLogin: (userId) => {
          const { userSettings } = get();
          const user = userSettings.mockUsers.find((u) => u.id === userId);
          if (user) {
            set({ currentUser: user });
          }
        },
        
        mockLogout: () => set({ currentUser: null }),
      }),
      {
        name: 'user-storage',
      }
    )
  )
);
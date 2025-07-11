import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// App-level state that persists across page navigation
interface AppState {
  // User session data
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  
  // Global app variables
  variables: Record<string, any>;
  
  // Navigation state
  currentRoute: string;
  navigationHistory: string[];
  
  // UI state
  loading: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'auto';
  
  // Data cache
  cache: Record<string, any>;
  
  // Form state (for multi-step forms)
  formState: Record<string, any>;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

interface AppStateActions {
  // User actions
  setCurrentUser: (user: AppState['currentUser']) => void;
  clearCurrentUser: () => void;
  
  // Variable management
  setVariable: (key: string, value: any) => void;
  getVariable: (key: string) => any;
  clearVariable: (key: string) => void;
  clearAllVariables: () => void;
  
  // Navigation
  navigate: (route: string) => void;
  goBack: () => void;
  goForward: () => void;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setTheme: (theme: AppState['theme']) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Cache management
  setCache: (key: string, value: any) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  
  // Form state
  setFormState: (formId: string, state: any) => void;
  getFormState: (formId: string) => any;
  clearFormState: (formId?: string) => void;
  
  // Utilities
  reset: () => void;
}

type AppStateStore = AppState & AppStateActions;

const initialState: AppState = {
  currentUser: null,
  variables: {},
  currentRoute: '/',
  navigationHistory: ['/'],
  loading: false,
  notifications: [],
  theme: 'light',
  cache: {},
  formState: {}
};

export const useAppStateStore = create<AppStateStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // User actions
        setCurrentUser: (user) => {
          set({ currentUser: user }, false, 'setCurrentUser');
        },
        
        clearCurrentUser: () => {
          set({ currentUser: null }, false, 'clearCurrentUser');
        },
        
        // Variable management
        setVariable: (key, value) => {
          set(
            (state) => ({
              variables: { ...state.variables, [key]: value }
            }),
            false,
            `setVariable:${key}`
          );
        },
        
        getVariable: (key) => {
          return get().variables[key];
        },
        
        clearVariable: (key) => {
          set(
            (state) => {
              const newVariables = { ...state.variables };
              delete newVariables[key];
              return { variables: newVariables };
            },
            false,
            `clearVariable:${key}`
          );
        },
        
        clearAllVariables: () => {
          set({ variables: {} }, false, 'clearAllVariables');
        },
        
        // Navigation
        navigate: (route) => {
          set(
            (state) => {
              const newHistory = [...state.navigationHistory];
              if (newHistory[newHistory.length - 1] !== route) {
                newHistory.push(route);
              }
              return {
                currentRoute: route,
                navigationHistory: newHistory
              };
            },
            false,
            `navigate:${route}`
          );
        },
        
        goBack: () => {
          const { navigationHistory, currentRoute } = get();
          const currentIndex = navigationHistory.indexOf(currentRoute);
          if (currentIndex > 0) {
            const previousRoute = navigationHistory[currentIndex - 1];
            set({ currentRoute: previousRoute }, false, 'goBack');
          }
        },
        
        goForward: () => {
          const { navigationHistory, currentRoute } = get();
          const currentIndex = navigationHistory.indexOf(currentRoute);
          if (currentIndex < navigationHistory.length - 1) {
            const nextRoute = navigationHistory[currentIndex + 1];
            set({ currentRoute: nextRoute }, false, 'goForward');
          }
        },
        
        // UI state
        setLoading: (loading) => {
          set({ loading }, false, 'setLoading');
        },
        
        setTheme: (theme) => {
          set({ theme }, false, 'setTheme');
        },
        
        // Notifications
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
          };
          
          set(
            (state) => ({
              notifications: [...state.notifications, newNotification]
            }),
            false,
            'addNotification'
          );
          
          // Auto-remove notification after duration
          if (notification.duration) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, notification.duration);
          }
        },
        
        removeNotification: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }),
            false,
            'removeNotification'
          );
        },
        
        clearNotifications: () => {
          set({ notifications: [] }, false, 'clearNotifications');
        },
        
        // Cache management
        setCache: (key, value) => {
          set(
            (state) => ({
              cache: { ...state.cache, [key]: value }
            }),
            false,
            `setCache:${key}`
          );
        },
        
        getCache: (key) => {
          return get().cache[key];
        },
        
        clearCache: (key) => {
          if (key) {
            set(
              (state) => {
                const newCache = { ...state.cache };
                delete newCache[key];
                return { cache: newCache };
              },
              false,
              `clearCache:${key}`
            );
          } else {
            set({ cache: {} }, false, 'clearAllCache');
          }
        },
        
        // Form state
        setFormState: (formId, state) => {
          set(
            (prevState) => ({
              formState: { ...prevState.formState, [formId]: state }
            }),
            false,
            `setFormState:${formId}`
          );
        },
        
        getFormState: (formId) => {
          return get().formState[formId];
        },
        
        clearFormState: (formId) => {
          if (formId) {
            set(
              (state) => {
                const newFormState = { ...state.formState };
                delete newFormState[formId];
                return { formState: newFormState };
              },
              false,
              `clearFormState:${formId}`
            );
          } else {
            set({ formState: {} }, false, 'clearAllFormState');
          }
        },
        
        // Utilities
        reset: () => {
          set(initialState, false, 'reset');
        }
      }),
      {
        name: 'app-state-storage',
        partialize: (state) => ({
          // Only persist certain parts of the state
          currentUser: state.currentUser,
          variables: state.variables,
          theme: state.theme,
          cache: state.cache
          // Don't persist navigationHistory, notifications, loading, or formState
        })
      }
    ),
    {
      name: 'app-state-store'
    }
  )
);

// Helper hooks for common use cases
export const useCurrentUser = () => {
  return useAppStateStore((state) => state.currentUser);
};

export const useAppVariable = (key: string) => {
  const variable = useAppStateStore((state) => state.variables[key]);
  const setVariable = useAppStateStore((state) => state.setVariable);
  const clearVariable = useAppStateStore((state) => state.clearVariable);
  
  return {
    value: variable,
    setValue: (value: any) => setVariable(key, value),
    clear: () => clearVariable(key)
  };
};

export const useNavigation = () => {
  const currentRoute = useAppStateStore((state) => state.currentRoute);
  const navigate = useAppStateStore((state) => state.navigate);
  const goBack = useAppStateStore((state) => state.goBack);
  const goForward = useAppStateStore((state) => state.goForward);
  const history = useAppStateStore((state) => state.navigationHistory);
  
  return {
    currentRoute,
    navigate,
    goBack,
    goForward,
    history,
    canGoBack: history.indexOf(currentRoute) > 0,
    canGoForward: history.indexOf(currentRoute) < history.length - 1
  };
};

export const useNotifications = () => {
  const notifications = useAppStateStore((state) => state.notifications);
  const addNotification = useAppStateStore((state) => state.addNotification);
  const removeNotification = useAppStateStore((state) => state.removeNotification);
  const clearNotifications = useAppStateStore((state) => state.clearNotifications);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // Convenience methods
    showSuccess: (title: string, message: string, duration = 5000) => 
      addNotification({ type: 'success', title, message, duration }),
    showError: (title: string, message: string, duration = 0) => 
      addNotification({ type: 'error', title, message, duration }),
    showWarning: (title: string, message: string, duration = 7000) => 
      addNotification({ type: 'warning', title, message, duration }),
    showInfo: (title: string, message: string, duration = 5000) => 
      addNotification({ type: 'info', title, message, duration })
  };
};
import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  ArrowRight,
  Database,
  Navigation,
  Mail,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Code2
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentInstance } from '../types';

interface ActionEditorProps {
  component: ComponentInstance;
}

interface Action {
  id: string;
  type: 'navigate' | 'database' | 'state' | 'api' | 'visibility' | 'custom';
  trigger: string;
  config: any;
}

const actionTypes = [
  { value: 'navigate', label: 'Navigate', icon: Navigation },
  { value: 'database', label: 'Database', icon: Database },
  { value: 'state', label: 'Update State', icon: RefreshCw },
  { value: 'visibility', label: 'Show/Hide', icon: Eye },
  { value: 'api', label: 'API Call', icon: Upload },
  { value: 'custom', label: 'Custom Code', icon: Code2 }
];

const triggers = {
  button: ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseLeave'],
  input: ['onChange', 'onFocus', 'onBlur', 'onKeyPress'],
  form: ['onSubmit', 'onReset', 'onValidate'],
  container: ['onClick', 'onMouseEnter', 'onMouseLeave'],
  text: ['onClick', 'onDoubleClick'],
  image: ['onClick', 'onLoad', 'onError']
};

export const ActionEditor: React.FC<ActionEditorProps> = ({ component }) => {
  const { 
    updateComponentEvents,
    tables,
    currentApp,
    pages
  } = useBuilderStore();
  
  const [actions, setActions] = useState<Action[]>(component.events || []);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  
  const componentTriggers = triggers[component.componentId as keyof typeof triggers] || ['onClick'];
  const appTables = currentApp ? Object.values(tables).filter(t => t.appId === currentApp.id) : [];
  const appPages = currentApp ? Object.values(pages).filter(p => p.appId === currentApp.id) : [];
  
  const addAction = () => {
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: 'navigate',
      trigger: componentTriggers[0],
      config: {}
    };
    
    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    updateComponentEvents(component.id, updatedActions);
    setExpandedAction(newAction.id);
  };
  
  const updateAction = (actionId: string, updates: Partial<Action>) => {
    const updatedActions = actions.map(action =>
      action.id === actionId ? { ...action, ...updates } : action
    );
    setActions(updatedActions);
    updateComponentEvents(component.id, updatedActions);
  };
  
  const removeAction = (actionId: string) => {
    const updatedActions = actions.filter(action => action.id !== actionId);
    setActions(updatedActions);
    updateComponentEvents(component.id, updatedActions);
  };
  
  const renderActionConfig = (action: Action) => {
    switch (action.type) {
      case 'navigate':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Navigate To
              </label>
              <select
                value={action.config.pageId || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, pageId: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select page...</option>
                {appPages.map(page => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
                <option value="_external">External URL</option>
              </select>
            </div>
            
            {action.config.pageId === '_external' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={action.config.url || ''}
                  onChange={(e) => updateAction(action.id, { 
                    config: { ...action.config, url: e.target.value }
                  })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        );
        
      case 'database':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={action.config.operation || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, operation: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select operation...</option>
                <option value="create">Create Record</option>
                <option value="update">Update Record</option>
                <option value="delete">Delete Record</option>
                <option value="query">Query Records</option>
              </select>
            </div>
            
            {action.config.operation && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Table
                </label>
                <select
                  value={action.config.tableId || ''}
                  onChange={(e) => updateAction(action.id, { 
                    config: { ...action.config, tableId: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select table...</option>
                  {appTables.map(table => (
                    <option key={table.id} value={table.id}>{table.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
        
      case 'visibility':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={action.config.visibilityAction || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, visibilityAction: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select action...</option>
                <option value="show">Show Component</option>
                <option value="hide">Hide Component</option>
                <option value="toggle">Toggle Visibility</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Target Component
              </label>
              <input
                type="text"
                value={action.config.targetId || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, targetId: e.target.value }
                })}
                placeholder="Component ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );
        
      case 'state':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State Variable
              </label>
              <input
                type="text"
                value={action.config.stateKey || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, stateKey: e.target.value }
                })}
                placeholder="e.g., userName, isLoggedIn"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                New Value
              </label>
              <input
                type="text"
                value={action.config.stateValue || ''}
                onChange={(e) => updateAction(action.id, { 
                  config: { ...action.config, stateValue: e.target.value }
                })}
                placeholder="Value or expression"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
            Configure {action.type} action
          </div>
        );
    }
  };
  
  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(t => t.value === type);
    return actionType ? <actionType.icon className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
        <button
          onClick={addAction}
          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Action
        </button>
      </div>
      
      {actions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">No actions configured</p>
          <button
            onClick={addAction}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add First Action
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="px-3 py-2 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedAction(
                  expandedAction === action.id ? null : action.id
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {getActionIcon(action.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {action.trigger}
                    </div>
                    <div className="text-xs text-gray-500">
                      {actionTypes.find(t => t.value === action.type)?.label}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedAction === action.id ? 'rotate-90' : ''
                  }`} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAction(action.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {expandedAction === action.id && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Trigger Event
                      </label>
                      <select
                        value={action.trigger}
                        onChange={(e) => updateAction(action.id, { trigger: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {componentTriggers.map(trigger => (
                          <option key={trigger} value={trigger}>{trigger}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Action Type
                      </label>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(action.id, { 
                          type: e.target.value as Action['type'],
                          config: {}
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {actionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {renderActionConfig(action)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Action Help */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Available Actions:</p>
            <ul className="space-y-0.5 ml-4">
              <li>• Navigate between pages or to external URLs</li>
              <li>• Create, update, or delete database records</li>
              <li>• Show, hide, or toggle component visibility</li>
              <li>• Update app state variables</li>
              <li>• Make API calls to external services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
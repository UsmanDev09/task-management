import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CustomField } from '../types/task';

// Only keep view states that are actually used
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

interface ViewState {
  sortConfig: SortConfig;
  filters: Record<string, string | boolean | string[]>;
  itemsPerPage?: number;
  currentPage?: number;
}

interface TaskState {
  // Data with history
  history: {
    past: Task[][];
    present: Task[];
    future: Task[][];
  };
  customFields: CustomField[];
  
  // UI State - only keep what's used
  isCustomFieldsModalOpen: boolean;
  showDeleteConfirm: boolean;
  selectedView: 'Table' | 'Kanban';
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTasks: (taskIds: string[]) => void;
  bulkUpdateStatus: (taskIds: string[], newStatus: Task['status']) => void;
  
  // Custom Fields actions
  addCustomField: (field: CustomField) => void;
  removeCustomField: (fieldId: string) => void;
  
  // UI Actions
  setIsCustomFieldsModalOpen: (isOpen: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setSelectedView: (view: 'Table' | 'Kanban') => void;
  
  // View states
  viewStates: {
    Table: ViewState;
    Kanban: ViewState;
  };
  updateViewState: (view: 'Table' | 'Kanban', updates: Partial<ViewState>) => void;
}

// Default states
const DEFAULT_VIEW_STATE: ViewState = {
  sortConfig: { key: 'title', direction: 'asc' },
  filters: {},
  itemsPerPage: 10,
  currentPage: 1
};

const DEFAULT_KANBAN_STATE: ViewState = {
  sortConfig: { key: 'order', direction: 'asc' },
  filters: {}
};

// Helper function to insert a new state into history
const insertIntoHistory = (state: TaskState['history'], newPresent: Task[]): TaskState['history'] => ({
  past: [...state.past, state.present],
  present: newPresent,
  future: []
});

const MAX_HISTORY_LENGTH = 50;

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // Initial state
      history: {
        past: [],
        present: [],
        future: []
      },
      customFields: [],
      isCustomFieldsModalOpen: false,
      showDeleteConfirm: false,
      selectedView: 'Table',
      viewStates: {
        Table: DEFAULT_VIEW_STATE,
        Kanban: DEFAULT_KANBAN_STATE
      },

      // History actions
      undo: () => set((state) => {
        const { past, present, future } = state.history;
        if (past.length === 0) return state;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        return {
          history: {
            past: newPast,
            present: previous,
            future: [present, ...future]
          }
        };
      }),
      
      redo: () => set((state) => {
        const { past, present, future } = state.history;
        if (future.length === 0) return state;
        
        const next = future[0];
        const newFuture = future.slice(1);
        
        return {
          history: {
            past: [...past, present],
            present: next,
            future: newFuture
          }
        };
      }),
      
      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,

      // Task actions
      addTask: (task) => set((state) => ({
        history: insertIntoHistory(state.history, [...state.history.present, task])
      })),

      updateTask: (taskId, updatedTask) => set((state) => ({
        history: insertIntoHistory(
          state.history,
          state.history.present.map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        )
      })),

      deleteTasks: (taskIds) => set((state) => ({
        history: insertIntoHistory(
          state.history,
          state.history.present.filter((task) => !taskIds.includes(task.id))
        ),
        showDeleteConfirm: false
      })),

      bulkUpdateStatus: (taskIds, newStatus) => set((state) => ({
        history: insertIntoHistory(
          state.history,
          state.history.present.map((task) =>
            taskIds.includes(task.id) ? { ...task, status: newStatus } : task
          )
        )
      })),

      // Custom Fields actions
      addCustomField: (field) => set((state) => ({
        customFields: [...state.customFields, field]
      })),
      
      removeCustomField: (fieldId) => set((state) => {
        const newPresent = state.history.present.map(task => {
          if (task.customFields) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [fieldId]: removed, ...remainingFields } = task.customFields;
            return { ...task, customFields: remainingFields };
          }
          return task;
        });
        
        return {
          customFields: state.customFields.filter(field => field.id !== fieldId),
          history: insertIntoHistory(state.history, newPresent)
        };
      }),

      // UI actions
      setIsCustomFieldsModalOpen: (isOpen) => set({ isCustomFieldsModalOpen: isOpen }),
      setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
      setSelectedView: (view) => set({ selectedView: view }),

      // View state updates
      updateViewState: (view, updates) => set((state) => ({
        viewStates: {
          ...state.viewStates,
          [view]: {
            ...(state.viewStates[view] || 
              (view === 'Table' ? DEFAULT_VIEW_STATE : DEFAULT_KANBAN_STATE)),
            ...updates
          }
        }
      })),
    }),
    {
      name: 'task-management-store',
      partialize: (state) => ({
        history: {
          past: state.history.past.slice(-MAX_HISTORY_LENGTH),
          present: state.history.present,
          future: state.history.future
        },
        customFields: state.customFields,
        viewStates: state.viewStates
      }),
    }
  )
);

// Helper functions
export const getTasks = () => useTaskStore.getState().history.present;
export const getCanUndo = () => useTaskStore.getState().canUndo();
export const getCanRedo = () => useTaskStore.getState().canRedo();
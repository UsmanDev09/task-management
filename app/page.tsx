'use client'

import { useEffect, useState } from "react";
import { Task } from "./types/task";
import { v4 as uuidv4 } from 'uuid';
import { Trash } from "lucide-react";
import { useTaskStore } from './store/useTaskStore';
import { Filters } from "./components/Filters";
import { Table } from "./components/Table";
import { Pagination } from "./components/Pagination";
import { Kanban } from "./components/Kanban";
import { CustomFieldsDrawer } from "./components/CustomFieldDrawer";

export default function TaskManagement() {
  const statusOptions = ['To Do', 'In Progress', 'Done'];

  // Add hydration safety check
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Local UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // Filtering and sorting state
  const [filters, setFilters] = useState<Record<string, string | boolean | string[]>>({
    title: '',
    priority: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task | string;
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });


  // Get state and actions from the store
  const {
    history,
    customFields,
    isCustomFieldsModalOpen,
    showDeleteConfirm,
    selectedView,
    // History actions
    undo,
    redo,
    canUndo,
    canRedo,
    // Task actions
    addTask,
    deleteTasks,
    bulkUpdateStatus,
    addCustomField,
    removeCustomField,
    updateTask,
    setIsCustomFieldsModalOpen,
    setShowDeleteConfirm,
    setSelectedView,
  } = useTaskStore();

  // Get the current tasks from the present state
  const tasks = history.present;
  
  // Handler functions
  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === currentItems.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(currentItems.map(task => task.id)));
    }
  };

  const handleBulkStatusUpdate = (newStatus: Task['status']) => {
    if (newStatus && selectedTasks.size > 0) {
      bulkUpdateStatus(Array.from(selectedTasks), newStatus);
    }
  };

  const handleUndo = () => {
    if (canUndo()) {
      undo();
      // Clear selected tasks when undoing to avoid potential issues
      setSelectedTasks(new Set());
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      redo();
      // Clear selected tasks when redoing to avoid potential issues
      setSelectedTasks(new Set());
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Standard filters
    const titleMatch = typeof filters.title === 'string' 
      ? task.title.toLowerCase().includes(filters.title.toLowerCase())
      : true;
    const priorityMatch = !filters.priority || task.priority === filters.priority;
    const statusMatch = !filters.status || task.status === filters.status;
    
    // Process custom field filters
    const customFieldMatches = customFields.every(field => {
      const filterKey = `custom_${field.id}`;
      const filterValue = filters[filterKey];
      
      // Skip if no filter is applied for this field
      if (!filterValue) return true;
      
      const fieldValue = task.customFields?.[field.id];
      
      // Handle checkbox (boolean) fields
      if (field.type === 'checkbox') {
        return filterValue === 'true' ? Boolean(fieldValue) : !Boolean(fieldValue);
      }
      
      // Handle text/number fields with filled/empty options
      if (filterValue === 'filled') {
        return fieldValue !== undefined && fieldValue !== '';
      } else if (filterValue === 'empty') {
        return fieldValue === undefined || fieldValue === '';
      }
      
      return true;
    });
    
    return titleMatch && priorityMatch && statusMatch && customFieldMatches;
  });

  // Sort tasks based on sortConfig
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue, bValue;
    
    // Handle sorting by custom fields
    if (sortConfig.key.startsWith('customFields.')) {
      const fieldId = sortConfig.key.split('.')[1];
      aValue = a.customFields?.[fieldId] ?? '';
      bValue = b.customFields?.[fieldId] ?? '';
    } else {
      // Standard fields
      aValue = a[sortConfig.key as keyof Task] ?? '';
      bValue = b[sortConfig.key as keyof Task] ?? '';
    }
    
    return (sortConfig.direction === 'asc' ? 1 : -1) * 
           (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
  });

  // Pagination
  const totalFilteredItems = sortedTasks.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);

  const handleQuickAddTask = (taskData: Partial<Task>) => {
    const taskWithId: Task = {
      id: uuidv4(),
      title: taskData.title || '',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'To Do',
      customFields: {}
    };
    
    addTask(taskWithId);
  };

  // Early return while hydrating
  if (!isClient) {
    return null;
  }

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      {/* View selector and Undo/Redo controls */}
      
      <div className="flex justify-between mb-4">

      </div>

      <Filters 
        filters={filters} 
        setFilters={setFilters}
        customFields={customFields}
        setIsCustomFieldsModalOpen={setState => setIsCustomFieldsModalOpen(typeof setState === 'function' ? setState(isCustomFieldsModalOpen) : setState)}
        selectedView={selectedView}
        setSelectedView={view => setSelectedView(view as 'Table' | 'Kanban')}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />
      {selectedView === "Table" ? (
        <>

          {selectedTasks.size > 0 && (
            <div className="mb-4 p-4 bg-background text-gray-400 border border-[var(--table-border)] rounded-md flex gap-2 items-center">
              <span className="text-sm text-gray-200">{selectedTasks.size} items selected</span>
              <select
                onChange={(e) => handleBulkStatusUpdate(e.target.value as Task['status'])}
                className="px-3 py-1 bg-background border border-[var(--table-border)] text-sm"
                defaultValue=""
              >
                <option value="">Update Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-gray-200 hover:bg-red-700 text-sm"
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
    
          <Table 
            customFields={customFields}
            setSortConfig={setSortConfig}
            sortConfig={sortConfig}
            setSelectedTasks={setSelectedTasks} 
            selectedTasks={selectedTasks} 
            currentItems={currentItems} 
            handleSelectAll={handleSelectAll}
            onAddTask={handleQuickAddTask}
            onUpdateTask={handleUpdateTask}
          />
    
          <Pagination 
            itemsPerPage={itemsPerPage} 
            setItemsPerPage={setItemsPerPage} 
            setCurrentPage={setCurrentPage} 
            currentPage={currentPage} 
            totalPages={totalPages} 
          />
        </>
      ) : (
        <Kanban tasks={tasks} />
      )}
      
      {/* Update the CustomFieldsEditor to CustomFieldsDrawer */}
      <CustomFieldsDrawer
        customFields={customFields}
        onAddField={addCustomField}
        onRemoveField={removeCustomField}
        isOpen={isCustomFieldsModalOpen}
        onClose={() => setIsCustomFieldsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete {selectedTasks.size} selected task(s)? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTasks(Array.from(selectedTasks));
                  setSelectedTasks(new Set());
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
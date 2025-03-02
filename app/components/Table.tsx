import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { CustomField, Task } from "../types/task";
import { useState, useRef, useEffect, useCallback } from "react";

interface TableProps {
    customFields: CustomField[];
    setSortConfig: (config: { key: string; direction: 'asc' | 'desc'; }) => void;
    sortConfig: { key: string; direction: 'asc' | 'desc'; };
    setSelectedTasks: (callback: (prev: Set<string>) => Set<string>) => void;
    selectedTasks: Set<string>;
    currentItems: Task[];
    handleSelectAll: () => void;
    onAddTask: (task: Partial<Task>) => void; // New prop for adding tasks
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void; // Add this prop
}

const isPriority = (value: string): value is Task['priority'] => {
  return ['High', 'Medium', 'Low'].includes(value);
};

const isStatus = (value: string): value is Task['status'] => {
  return ['To Do', 'In Progress', 'Done'].includes(value);
};

export function Table({
    customFields,
    setSortConfig,
    sortConfig,
    setSelectedTasks,
    selectedTasks,
    currentItems,
    handleSelectAll,
    onAddTask,
    onUpdateTask
}: TableProps) {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        priority: 'Medium',
        status: 'To Do'
    });
    const [activeDropdown, setActiveDropdown] = useState<{
        taskId: string | 'new';
        field: 'priority' | 'status';
    } | null>(null);
    const [editingCell, setEditingCell] = useState<{
        taskId: string;
        field: 'title' | 'priority' | 'status';
    } | null>(null);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Priority and Status options
    const priorityOptions = ['High', 'Medium', 'Low'];
    const statusOptions = ['To Do', 'In Progress', 'Done'];

    useEffect(() => {
        if (isAddingTask) {
            titleInputRef.current?.focus();
        }
    }, [isAddingTask]);

    // Update the click outside handler

     const handleAddNewTask = useCallback(() => {
        if (newTask.title?.trim() || newTask.priority || newTask.status) {
            onAddTask({
                ...newTask,
                title: newTask.title?.trim() || 'Untitled Task'
            });
            setNewTask({ title: '', priority: 'Medium', status: 'To Do' });
        }
        setIsAddingTask(false);
    }, [newTask, onAddTask]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
            
            // Add this new check for clicking outside while adding a task
            if (isAddingTask && 
                titleInputRef.current && 
                !titleInputRef.current.contains(event.target as Node)) {
                handleAddNewTask();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAddingTask, handleAddNewTask]); // Add handleAddNewTask to dependencies

    // Move handleAddNewTask inside useCallback to prevent infinite loops
    // Add dependencies for useCallback

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddNewTask();
        } else if (e.key === 'Escape') {
            setIsAddingTask(false);
            setNewTask({ title: '', priority: 'Medium', status: 'To Do' });
        }
    };


    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
          case 'high':
            return 'text-red-600';
          case 'medium':
            return 'text-yellow-600';
          case 'low':
            return 'text-green-600';
          default:
            return 'text-gray-600';
        }
    };
    
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case 'to do':
            return 'bg-gray-100 text-gray-800';
          case 'in progress':
            return 'bg-blue-100 text-blue-800';
          case 'done':
            return 'bg-green-100 text-green-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
    };


    const handleSort = (key: string) => {
        setSortConfig({
          key,
          direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
      };

    const handleTaskSelection = (taskId: string) => {
        setSelectedTasks(prev => {
          const newSet = new Set(prev);
          if (newSet.has(taskId)) {
            newSet.delete(taskId);
          } else {
            newSet.add(taskId);
          }
          return newSet;
        });
    };

    const renderCustomFieldValue = (task: Task, field: CustomField) => {
        if (!task.customFields || task.customFields[field.id] === undefined) {
          return renderEmptyField(field.type);
        }
        
        const value = task.customFields[field.id];
        
        switch (field.type) {
          case 'text':
            return <span>{value as string}</span>;
          case 'number':
            return <span>{value as number}</span>;
          case 'checkbox':
            return (
              <input 
                type="checkbox" 
                checked={value as boolean} 
                readOnly 
                className="w-4 h-4" 
              />
            );
          default:
            return <span>—</span>;
        }
      };

      const renderEmptyField = (type: string) => {
        switch (type) {
          case 'text':
            return <span className="text-gray-400">—</span>;
          case 'number':
            return <span className="text-gray-400">—</span>;
          case 'checkbox':
            return <input type="checkbox" disabled className="w-4 h-4" />;
          default:
            return <span className="text-gray-400">—</span>;
        }
      };

    const handleCellEdit = (taskId: string, field: 'title' | 'priority' | 'status', value: string) => {
        onUpdateTask(taskId, { [field]: value });
        setEditingCell(null);
    };

    const renderTaskCell = (task: Task, field: 'title' | 'priority' | 'status') => {
        const isEditing = editingCell?.taskId === task.id && editingCell?.field === field;

        switch (field) {
            case 'title':
                return isEditing ? (
                    <input
                        type="text"
                        defaultValue={task.title}
                        autoFocus
                        className="w-full border-none bg-transparent px-2 py-1 focus:outline-none"
                        onBlur={(e) => handleCellEdit(task.id, 'title', e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCellEdit(task.id, 'title', e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                                setEditingCell(null);
                            }
                        }}
                    />
                ) : (
                    <div
                        onClick={() => setEditingCell({ taskId: task.id, field: 'title' })}
                        className="cursor-text hover:bg-gray-800 px-2 py-1 rounded"
                    >
                        {task.title}
                    </div>
                );

            case 'priority':
                return (
                    <div className="relative">
                        <button
                            onClick={() => setActiveDropdown({ taskId: task.id, field: 'priority' })}
                            className={`${getPriorityColor(task.priority)} hover:opacity-80`}
                        >
                            {task.priority}
                        </button>
                        {activeDropdown?.taskId === task.id && activeDropdown?.field === 'priority' && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-10 mt-1 w-40 bg-background border-[var(--table-border)] border"
                            >
                                {priorityOptions.map((option) => (
                                    <button
                                        key={option}
                                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                            getPriorityColor(option)
                                        }`}
                                        onClick={() => {
                                            if (isPriority(option)) {
                                                handleCellEdit(task.id, 'priority', option);
                                                setActiveDropdown(null);
                                            }
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'status':
                return (
                    <div className="relative">
                        <button
                            onClick={() => setActiveDropdown({ taskId: task.id, field: 'status' })}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getStatusColor(task.status)
                            }`}
                        >
                            {task.status}
                        </button>
                        {activeDropdown?.taskId === task.id && activeDropdown?.field === 'status' && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-10 mt-1 w-40 bg-background border-[var(--table-border)] border"
                            >
                                {statusOptions.map((option) => (
                                    <button
                                        key={option}
                                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100`}
                                        onClick={() => {
                                            if (isStatus(option)) {
                                                handleCellEdit(task.id, 'status', option);
                                                setActiveDropdown(null);
                                            }
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="border-t border-b border-[var(--table-border)] overflow-x-auto">
            <table className="w-full bg-foreground text-sm text-left">
                <thead className="text-white">
                    <tr>
                        <th className="px-6 py-3 font-semibold border-b border-[var(--table-border)]">
                            <input
                              type="checkbox"
                              checked={selectedTasks.size === currentItems.length && currentItems.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 rounded border-gray-300 bg-foreground border border-[var(--table-border)] appearance-none opacity-0 hover:opacity-100 checked:opacity-100 checked:bg-green-600"
                              />
                        </th>
                        {/* Standard columns */}
                        {['ID', 'Title', 'Priority', 'Status'].map((header) => (
                            <th
                              key={header}
                              className="px-6 py-3 font-semibold border-b border-[var(--table-border)] cursor-pointer select-none"
                              onClick={() => handleSort(header.toLowerCase())}
                            >
                                <div className="flex items-center gap-2">
                                    {header}
                                    <div className="flex flex-col">
                                      <ChevronUp className={`w-3 h-3 ${sortConfig.key === header.toLowerCase() && sortConfig.direction === 'asc' ? 'text-blue-600' : ''}`} />
                                      <ChevronDown className={`w-3 h-3 ${sortConfig.key === header.toLowerCase() && sortConfig.direction === 'desc' ? 'text-blue-600' : ''}`} />
                                    </div>
                                </div>
                            </th>
                        ))}
                        
                        {/* Custom field columns */}
                        {customFields.map((field) => (
                            <th
                                key={field.id}
                                className="px-6 py-3 font-semibold border-b border-[var(--table-border)] cursor-pointer select-none"
                                onClick={() => handleSort(`customFields.${field.id}`)}
                            >
                                <div className="flex items-center gap-2">
                                    {field.name}
                                    <div className="flex flex-col">
                                        <ChevronUp className={`w-3 h-3 ${sortConfig.key === `customFields.${field.id}` && sortConfig.direction === 'asc' ? 'text-blue-600' : ''}`} />
                                        <ChevronDown className={`w-3 h-3 ${sortConfig.key === `customFields.${field.id}` && sortConfig.direction === 'desc' ? 'text-blue-600' : ''}`} />
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                  {/* Existing Tasks with inline editing */}
                  <AnimatePresence>
                    {currentItems.map((task: Task) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group text-white border-b border-[var(--table-border)]"
                      >
                        <td className="px-6 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => handleTaskSelection(task.id)}
                            className="w-4 h-4 rounded border-gray-300 bg-foreground border border-[var(--table-border)] appearance-none opacity-0 group-hover:opacity-100 checked:opacity-100 checked:bg-green-600"
                          />
                        </td>
                        <td className="px-6 py-3">{task.id}</td>
                        <td className="px-6 py-3">
                          {renderTaskCell(task, 'title')}
                        </td>
                        <td className="px-6 py-3">
                          {renderTaskCell(task, 'priority')}
                        </td>
                        <td className="px-6 py-3">
                          {renderTaskCell(task, 'status')}
                        </td>
                        
                        {/* Custom field cells */}
                        {customFields.map((field) => (
                          <td key={field.id} className="px-6 py-3">
                            {renderCustomFieldValue(task, field)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {isAddingTask && (
                      <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                      >
                          <td className="px-6 py-3">
                              <input type="checkbox" disabled className="w-4 h-4 text-white border-gray-300" />
                          </td>
                          <td className="px-6 py-3">—</td>
                          <td className="px-6 py-3">
                              <input
                                  ref={titleInputRef}
                                  type="text"
                                  value={newTask.title}
                                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                  onKeyDown={handleKeyPress}
                                  className="w-full text-white bg-transparent border-none focus:outline-none" // Added focus:outline-none to remove focus styles
                                  placeholder="Enter task title"
                              />
                          </td>
                          <td className="px-6 py-3 relative">
                              <button
                                  onClick={() => setActiveDropdown({ taskId: 'new', field: 'priority' })}
                                  className={`${getPriorityColor(newTask.priority || 'Medium')} hover:opacity-80`}
                              >
                                  {newTask.priority || 'Medium'}
                              </button>
                              {activeDropdown?.taskId === 'new' && activeDropdown.field === 'priority' && (
                                  <div
                                      ref={dropdownRef}
                                      className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg border"
                                  >
                                      {priorityOptions.map((option) => (
                                          <button
                                              key={option}
                                              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                                  getPriorityColor(option)
                                              }`}
                                              onClick={() => {
                                                  if (isPriority(option)) {
                                                      setNewTask({ ...newTask, priority: option });
                                                      setActiveDropdown(null);
                                                  }
                                              }}
                                          >
                                              {option}
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </td>
                          <td className="px-6 py-3 relative">
                              <button
                                  onClick={() => setActiveDropdown({ taskId: 'new', field: 'status' })}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      getStatusColor(newTask.status || 'To Do')
                                  }`}
                              >
                                  {newTask.status || 'To Do'}
                              </button>
                              {activeDropdown?.taskId === 'new' && activeDropdown.field === 'status' && (
                                  <div
                                      ref={dropdownRef}
                                      className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg border"
                                  >
                                      {statusOptions.map((option) => (
                                          <button
                                              key={option}
                                              className={`block w-full text-left px-4 py-2 hover:bg-gray-100`}
                                              onClick={() => {
                                                  if (isStatus(option)) {
                                                      setNewTask({ ...newTask, status: option });
                                                      setActiveDropdown(null);
                                                  }
                                              }}
                                          >
                                              {option}
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </td>
                          {customFields.map((field) => (
                              <td key={field.id} className="px-6 py-4">
                                  —
                              </td>
                          ))}
                      </motion.tr>
                  )}
                </tbody>
            </table>

            {/* Add Task Button */}
            {!isAddingTask && (
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-white hover:bg-gray-700 w-full"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
        </div>
    );
}
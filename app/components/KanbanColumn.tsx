import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "../types/task";
import { KanbanCard } from "./KanbanCard";
import { Plus, X } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onQuickAdd: (task: Partial<Task>) => void;
}

export function KanbanColumn({ title, tasks, onQuickAdd }: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("To Do");
  
  const { setNodeRef } = useDroppable({
    id: title,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onQuickAdd({
        title: newTaskTitle.trim(),
        priority: title as Task["priority"],
        status: newTaskStatus,
      });
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      
      default:
        return 'bg-background border-gray-400';
    }
  };

  return (
    <div 
      className={`border p-4 flex flex-col h-[calc(100vh-12rem)] ${getPriorityColor(title)}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-white">{title}</h2>
        <span className="text-sm text-white">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 min-h-[100px]"
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {isAddingTask && (
          <form onSubmit={handleSubmit} className="p-3 bg-white rounded-lg shadow space-y-3">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="flex-1 border-none focus:ring-0 p-0 text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value as Task["status"])}
              className="w-full text-sm border rounded-md"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>

      {!isAddingTask && (
        <button
          onClick={() => setIsAddingTask(true)}
          className="mt-4 flex items-center justify-center w-full py-2 rounded-md text-gray-400 hover:bg-[#282a2c] hover:border-gray-400 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      )}
    </div>
  );
}
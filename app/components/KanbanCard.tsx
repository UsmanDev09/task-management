import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types/task";

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanCard({ task, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task?.id });

  // Only apply dnd-kit transforms during active dragging
  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : {};

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-white bg-red-600';
      case 'medium':
        return 'text-white bg-yellow-600';
      case 'low':
        return 'text-white bg-green-600';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-[#282a2c]  shadow p-4 cursor-grab
        ${isDragging ? 'opacity-50' : ''}
        hover:shadow-md transition-shadow
      `}
      role="article"
      aria-label={`Task: ${task.title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <h3 className="font-medium text-white mb-2">{task?.title}</h3>
      <div className="flex items-center gap-2">
        <span 
          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task?.priority)}`}
          role="status"
          aria-label={`Priority: ${task.priority}`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}
import { KanbanCard } from "./KanbanCard";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    sortableKeyboardCoordinates,
    arrayMove,
} from "@dnd-kit/sortable"
import { useState } from "react";
import { Task } from "../types/task";
import { KanbanColumn } from "./KanbanColumn";
import { useTaskStore } from "../store/useTaskStore";

interface KanbanProps {
    tasks: Task[];
}

const priorityColumns = ['High', 'Medium', 'Low'];

export function Kanban({tasks}: KanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const store = useTaskStore();
    
    // Only keep sortConfig
    const { sortConfig = { key: 'order', direction: 'asc' } } = store.viewStates?.Kanban || {};

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getColumnTasks = (priority: string) => {
        // Filter by priority and sort
        return tasks
            .filter(task => task.priority === priority)
            .sort((a, b) => {
                // Handle different sort keys
                switch (sortConfig.key) {
                    case 'order':
                        const orderA = a.order ?? Infinity;
                        const orderB = b.order ?? Infinity;
                        return orderA - orderB;
                    
                    case 'title':
                        return a.title.localeCompare(b.title);
                    
                    case 'status':
                        return a.status.localeCompare(b.status);
                    
                    default:
                        // For any other fields
                        const valueA = a[sortConfig.key as keyof Task];
                        const valueB = b[sortConfig.key as keyof Task];
                        
                        if (typeof valueA === 'string' && typeof valueB === 'string') {
                            return valueA.localeCompare(valueB);
                        }
                        
                        return (valueA ?? '') < (valueB ?? '') ? -1 : 1;
                }
            });
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeTask = tasks.find(task => task.id === active.id);
        const overId = over.id;

        if (!activeTask) return;

        // If dropping over a task
        const overTask = tasks.find(task => task.id === overId);
        if (overTask) {
            if (activeTask.priority === overTask.priority) {
                // Same column reordering - update task order
                const columnTasks = getColumnTasks(activeTask.priority)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); // Sort by order explicitly
                const oldIndex = columnTasks.findIndex(task => task.id === active.id);
                const newIndex = columnTasks.findIndex(task => task.id === over.id);
                
                if (oldIndex !== newIndex) {
                    const newOrder = arrayMove(columnTasks, oldIndex, newIndex);
                    // Update each task with a new order field
                    newOrder.forEach((task, index) => {
                        store.updateTask(task.id, { order: index });
                    });
                }
            } else {
                // Moving to different column
                const columnTasks = getColumnTasks(overTask.priority)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); // Sort by order explicitly
                const newIndex = columnTasks.findIndex(task => task.id === over.id);
                
                store.updateTask(activeTask.id, { 
                    priority: overTask.priority,
                    order: newIndex
                });

                // Reorder tasks in the target column
                const updatedColumnTasks = [
                    ...columnTasks.slice(0, newIndex),
                    activeTask,
                    ...columnTasks.slice(newIndex)
                ];
                updatedColumnTasks.forEach((task, index) => {
                    if (task.id !== activeTask.id) {
                        store.updateTask(task.id, { order: index });
                    }
                });
            }
        } else {
            // Dropping directly on a column
            const newPriority = overId as Task["priority"];
            if (newPriority !== activeTask.priority) {
                const columnTasks = getColumnTasks(newPriority)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); // Sort by order explicitly
                
                store.updateTask(activeTask.id, { 
                    priority: newPriority,
                    order: columnTasks.length
                });
            }
        }

        setActiveId(null);
    };

    const handleQuickAdd = (priority: Task["priority"]) => {
        return (taskData: Partial<Task>) => {
            const newTask: Task = {
                id: Date.now().toString(),
                title: taskData.title || '',
                priority: priority,
                status: taskData.status || 'To Do',
                customFields: {},
                order: getColumnTasks(priority).length // Add order field
            };
            store.addTask(newTask);
        };
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {priorityColumns.map(priority => (
                        <KanbanColumn
                            key={priority}
                            title={priority}
                            tasks={getColumnTasks(priority)}
                            onQuickAdd={handleQuickAdd(priority as Task["priority"])}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <KanbanCard
                            task={tasks.find(task => task.id === activeId)!}
                            isDragging={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
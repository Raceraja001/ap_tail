import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority } from '../../core/project/types';
import { useUpdateTaskStatus } from '../../core/project/hooks';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  className?: string;
}

/**
 * Kanban Board Component
 * 
 * Interactive drag-and-drop task management board.
 * Implements modern UX patterns with optimistic updates.
 */
// Sortable Task Item Component
const SortableTaskItem: React.FC<{
  task: Task;
  onTaskClick?: (task: Task) => void;
  getPriorityColor: (priority: TaskPriority) => string;
}> = ({ task, onTaskClick, getPriorityColor }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(task.priority)} border-l-4`}
    >
      <TaskCard
        task={task}
        onClick={() => onTaskClick?.(task)}
      />
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  className = '',
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateTaskStatus = useUpdateTaskStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Define columns
  const columns = [
    {
      id: TaskStatus.TODO,
      title: 'To Do',
      color: 'bg-gray-100 dark:bg-gray-800',
      headerColor: 'bg-gray-200 dark:bg-gray-700',
      count: tasks.filter(t => t.status === TaskStatus.TODO).length,
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: 'In Progress',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      headerColor: 'bg-blue-100 dark:bg-blue-900/40',
      count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    },
    {
      id: TaskStatus.IN_REVIEW,
      title: 'In Review',
      color: 'bg-yellow-50 dark:bg-yellow-900/20',
      headerColor: 'bg-yellow-100 dark:bg-yellow-900/40',
      count: tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length,
    },
    {
      id: TaskStatus.DONE,
      title: 'Done',
      color: 'bg-green-50 dark:bg-green-900/20',
      headerColor: 'bg-green-100 dark:bg-green-900/40',
      count: tasks.filter(t => t.status === TaskStatus.DONE).length,
    },
    {
      id: TaskStatus.BLOCKED,
      title: 'Blocked',
      color: 'bg-red-50 dark:bg-red-900/20',
      headerColor: 'bg-red-100 dark:bg-red-900/40',
      count: tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    },
  ];

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Sort tasks by position
  Object.keys(tasksByStatus).forEach(status => {
    tasksByStatus[status as TaskStatus].sort((a, b) => a.position - b.position);
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Find the task being moved
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) {
      return;
    }

    // Update task status
    updateTaskStatus.mutate({ id: taskId, status: newStatus });

    // Call optional update handler
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { status: newStatus });
    }
  }, [tasks, updateTaskStatus, onTaskUpdate]);

  const getPriorityColor = (priority: TaskPriority) => {
    const colorMap = {
      [TaskPriority.LOW]: 'border-l-gray-400',
      [TaskPriority.MEDIUM]: 'border-l-blue-400',
      [TaskPriority.HIGH]: 'border-l-orange-400',
      [TaskPriority.URGENT]: 'border-l-red-400',
    };
    return colorMap[priority];
  };

  return (
    <div className={`h-full ${className}`}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 h-full overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                {/* Column Header */}
                <div className={`${column.headerColor} rounded-t-lg px-4 py-3 border-b border-gray-200 dark:border-gray-600`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h3>
                    <span className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                      {column.count}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <SortableContext
                  items={columnTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id={column.id}
                    className={`${column.color} rounded-b-lg min-h-96 p-4 space-y-3`}
                  >
                    {columnTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}

                    {/* Add Task Button */}
                    <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium">Add Task</span>
                      </div>
                    </button>
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 shadow-lg">
              <TaskCard
                task={activeTask}
                className={`${getPriorityColor(activeTask.priority)} border-l-4`}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

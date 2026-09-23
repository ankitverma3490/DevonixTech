import React from 'react';
import { ITask, TaskStatus } from '../../types/index.js';
import { KanbanColumn } from './KanbanColumn.js';

export interface KanbanBoardProps {
  tasks: ITask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: (status: TaskStatus) => void;
  onEditTask?: (task: ITask) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'todo', title: 'To Do' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'review', title: 'In Review' },
    { status: 'completed', title: 'Completed' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={colTasks}
            onStatusChange={onStatusChange}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        );
      })}
    </div>
  );
};

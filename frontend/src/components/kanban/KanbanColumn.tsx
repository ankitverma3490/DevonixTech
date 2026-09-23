import React from 'react';
import { Plus } from 'lucide-react';
import { ITask, TaskStatus } from '../../types/index.js';
import { KanbanCard } from './KanbanCard.js';

export interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: ITask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: (status: TaskStatus) => void;
  onEditTask?: (task: ITask) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onStatusChange,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const columnHeaderStyles: Record<TaskStatus, { dot: string; bg: string }> = {
    todo: { dot: 'bg-slate-400', bg: 'border-slate-800' },
    in_progress: { dot: 'bg-indigo-400', bg: 'border-indigo-500/20' },
    review: { dot: 'bg-amber-400', bg: 'border-amber-500/20' },
    completed: { dot: 'bg-emerald-400', bg: 'border-emerald-500/20' },
  };

  const style = columnHeaderStyles[status] || { dot: 'bg-slate-400', bg: 'border-slate-800' };

  return (
    <div className="flex flex-col rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 min-w-[280px] w-full max-w-xs flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={() => onAddTask(status)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={`Add task in ${title}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[150px] max-h-[600px] pr-1">
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center rounded-xl border border-dashed border-slate-800/80 text-[11px] text-slate-400">
            No tasks in {title.toLowerCase()}
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

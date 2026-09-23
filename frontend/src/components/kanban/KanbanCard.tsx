import React from 'react';
import { Calendar, User, Clock, MoreHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import { ITask, TaskStatus } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { formatDate } from '../../utils/formatters.js';

export interface KanbanCardProps {
  task: ITask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: ITask) => void;
  onDelete?: (taskId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const nextStatuses: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in_progress',
    in_progress: 'review',
    review: 'completed',
    completed: null,
  };

  const prevStatuses: Record<TaskStatus, TaskStatus | null> = {
    todo: null,
    in_progress: 'todo',
    review: 'in_progress',
    completed: 'review',
  };

  const next = nextStatuses[task.status];
  const prev = prevStatuses[task.status];

  const assignedUser = typeof task.assignedTo === 'object' ? task.assignedTo : null;

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-md hover:border-indigo-500/40 transition-all duration-150 group">
      {/* Priority and Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="priority" status={task.priority} size="sm">
          {task.priority}
        </Badge>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {prev && (
            <button
              onClick={() => onStatusChange(task._id, prev)}
              title={`Move to ${prev.replace('_', ' ')}`}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
          {next && (
            <button
              onClick={() => onStatusChange(task._id, next)}
              title={`Move to ${next.replace('_', ' ')}`}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-100 leading-snug">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer info: assignee and due date */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          {assignedUser ? (
            <div className="flex items-center gap-1.5 truncate" title={assignedUser.name}>
              <img
                src={
                  assignedUser.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedUser.name}`
                }
                alt={assignedUser.name}
                className="w-4 h-4 rounded-full bg-slate-800 object-cover shrink-0"
              />
              <span className="truncate text-slate-300 font-medium">{assignedUser.name}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

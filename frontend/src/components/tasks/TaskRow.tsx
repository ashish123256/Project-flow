import { useState } from 'react';
import {
  CheckCircle2, Circle, Clock, Pencil, Trash2, AlertCircle,
} from 'lucide-react';
import { cn, formatDate, getTaskStatusBadge, getTaskStatusLabel, isDueSoon, isOverdue } from '@/utils/helpers';
import type { Task, TaskStatus } from '@/types';

interface TaskRowProps {
  task: Task;
  onEdit:         (task: Task) => void;
  onDelete:       (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  isUpdating?:    boolean;
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo:         'in-progress',
  'in-progress': 'done',
  done:          'todo',
};

export function TaskRow({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating,
}: TaskRowProps) {
  const [hovered, setHovered] = useState(false);

  const overdue  = isOverdue(task.dueDate)  && task.status !== 'done';
  const dueSoon  = isDueSoon(task.dueDate)  && task.status !== 'done';

  const StatusIcon =
    task.status === 'done'
      ? CheckCircle2
      : task.status === 'in-progress'
      ? Clock
      : Circle;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3.5 rounded-xl',
        'border border-transparent hover:border-gray-100 hover:bg-gray-50/60',
        'transition-all duration-150 animate-fade-in',
        task.status === 'done' && 'opacity-60',
        isUpdating && 'opacity-50 pointer-events-none',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Status toggle button */}
      <button
        onClick={() => onStatusChange(task, nextStatus[task.status])}
        className={cn(
          'mt-0.5 shrink-0 rounded-full transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
          task.status === 'done'
            ? 'text-emerald-500 hover:text-emerald-600'
            : task.status === 'in-progress'
            ? 'text-amber-500 hover:text-amber-600'
            : 'text-gray-300 hover:text-brand-400',
        )}
        title={`Mark as ${nextStatus[task.status]}`}
      >
        <StatusIcon className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-gray-800 leading-snug',
            task.status === 'done' && 'line-through text-gray-400',
          )}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
          <span className={getTaskStatusBadge(task.status)}>
            {getTaskStatusLabel(task.status)}
          </span>

          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                overdue  ? 'text-red-500' :
                dueSoon  ? 'text-amber-500' :
                           'text-gray-400',
              )}
            >
              {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {overdue ? 'Overdue · ' : dueSoon ? 'Due soon · ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div
        className={cn(
          'flex items-center gap-1 shrink-0 transition-opacity duration-150',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

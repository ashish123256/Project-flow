import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import type { TaskStatus, ProjectStatus } from '@/types';

// ── Class name utility ────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────────────────────
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function isDueSoon(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  try {
    const d = new Date(date);
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return d <= threeDays && !isPast(d);
  } catch {
    return false;
  }
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  try {
    return isPast(new Date(date));
  } catch {
    return false;
  }
}

// ── Badge classes ─────────────────────────────────────────────────────────────
export function getProjectStatusBadge(status: ProjectStatus): string {
  return status === 'active' ? 'badge-active' : 'badge-completed';
}

export function getTaskStatusBadge(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo:         'badge-todo',
    'in-progress': 'badge-progress',
    done:          'badge-done',
  };
  return map[status];
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo:         'To Do',
    'in-progress': 'In Progress',
    done:          'Done',
  };
  return map[status];
}

// ── Truncate ──────────────────────────────────────────────────────────────────
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ── Initials ──────────────────────────────────────────────────────────────────
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn, formatRelative, getProjectStatusBadge, truncate } from '@/utils/helpers';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onEdit:   (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate   = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef    = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const StatusIcon = project.status === 'completed' ? CheckCircle2 : Circle;

  return (
    <article
      className="card-hover p-5 flex flex-col gap-3 group animate-fade-in"
      onClick={() => navigate(`/projects/${project.id || project._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <StatusIcon
            className={cn(
              'h-4 w-4 mt-0.5 shrink-0',
              project.status === 'completed' ? 'text-emerald-500' : 'text-gray-300',
            )}
          />
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {project.title}
          </h3>
        </div>

        {/* Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className={cn(
              'p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all',
              'opacity-0 group-hover:opacity-100',
              menuOpen && 'opacity-100',
            )}
            aria-label="Project options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-modal border border-gray-100 z-20 py-1 animate-scale-in">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pl-6">
          {truncate(project.description, 120)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto pl-6">
        <span className={getProjectStatusBadge(project.status)}>
          {project.status === 'active' ? 'Active' : 'Completed'}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          {formatRelative(project.createdAt)}
        </span>
      </div>
    </article>
  );
}

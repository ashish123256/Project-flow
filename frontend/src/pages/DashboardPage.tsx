import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckCircle2, Layers, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/common/Button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatCardSkeleton, ProjectCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useProjects,
  useProjectStats,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useQueries';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { cn } from '@/utils/helpers';
import type { Project } from '@/types';
import type { ProjectFormData } from '@/utils/validation';

function StatCard({ label, value, icon, color, bg }: {
  label: string; value: number | string;
  icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user     = useAppSelector(selectCurrentUser);
  const userId   = user?.id ?? '';

  const [showCreate,      setShowCreate]      = useState(false);
  const [editingProject,  setEditingProject]  = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { data: statsData,    isLoading: statsLoading    } = useProjectStats(userId);
  const { data: projectsData, isLoading: projectsLoading } = useProjects(userId, {
    page: 1, limit: 6, sortBy: 'createdAt', sortOrder: 'desc',
  });

  const createProject = useCreateProject(userId);
  const updateProject = useUpdateProject(userId);
  const deleteProject = useDeleteProject(userId);

  const handleCreate = (data: ProjectFormData) =>
    createProject.mutate(data, { onSuccess: () => setShowCreate(false) });

 const handleUpdate = (data: ProjectFormData) => {
  if (!editingProject) return;
  const projectId = editingProject.id ?? editingProject._id?.toString();
  if (!projectId) return;
  updateProject.mutate(
    { projectId, payload: data },
    { onSuccess: () => setEditingProject(null) }
  );
};

const handleDelete = () => {
  if (!deletingProject) return;
  const projectId = deletingProject.id ?? deletingProject._id?.toString();
  if (!projectId) return;
  deleteProject.mutate(projectId, {
    onSuccess: () => setDeletingProject(null),
  });
};

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      <Navbar
        title="Dashboard"
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            New Project
          </Button>
        }
      />

      <main className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-48 opacity-10">
            <div className="absolute right-4 top-4 h-32 w-32 rounded-full border-4 border-white" />
            <div className="absolute right-16 bottom-2 h-20 w-20 rounded-full border-4 border-white" />
          </div>
          <p className="text-brand-100 text-sm font-medium">{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
          <h2 className="text-xl font-bold mt-1">Here's what's happening today</h2>
          <p className="text-brand-200 text-sm mt-1">Track your projects and stay on top of tasks</p>
        </div>

        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Total Projects" value={statsData?.total ?? 0}
                  icon={<Layers className="h-5 w-5" />} color="text-brand-600" bg="bg-brand-50" />
                <StatCard label="Active" value={statsData?.active ?? 0}
                  icon={<TrendingUp className="h-5 w-5" />} color="text-emerald-600" bg="bg-emerald-50" />
                <StatCard label="Completed" value={statsData?.completed ?? 0}
                  icon={<CheckCircle2 className="h-5 w-5" />} color="text-gray-500" bg="bg-gray-100" />
              </>
            )}
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Projects</h2>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              onClick={() => navigate('/projects')}>
              View all
            </Button>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : !projectsData?.projects.length ? (
            <div className="card">
              <EmptyState
                icon={<FolderKanban className="h-8 w-8" />}
                title="No projects yet"
                description="Create your first project to start tracking tasks."
                action={{ label: '+ New Project', onClick: () => setShowCreate(true) }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsData.projects.map((p) => (
                <ProjectCard key={p.id || p._id} project={p}
                  onEdit={setEditingProject} onDelete={setDeletingProject} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ProjectForm isOpen={showCreate} onClose={() => setShowCreate(false)}
        onSubmit={handleCreate} isLoading={createProject.isPending} />
      <ProjectForm isOpen={!!editingProject} onClose={() => setEditingProject(null)}
        onSubmit={handleUpdate} isLoading={updateProject.isPending} project={editingProject} />
      <ConfirmDialog isOpen={!!deletingProject} onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete} isLoading={deleteProject.isPending}
        title="Delete Project"
        description={`Delete "${deletingProject?.title}"? All tasks will be permanently removed.`} />
    </div>
  );
}
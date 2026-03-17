import { useState } from 'react';
import { Search, Plus, FolderKanban, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/common/Button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ProjectCardSkeleton } from '@/components/common/Skeleton';
import { cn } from '@/utils/helpers';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useQueries';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import type { Project, ProjectStatus } from '@/types';
import type { ProjectFormData } from '@/utils/validation';

const STATUS_TABS: { label: string; value: ProjectStatus | '' }[] = [
  { label: 'All',       value: ''          },
  { label: 'Active',    value: 'active'    },
  { label: 'Completed', value: 'completed' },
];

export function ProjectsPage() {
  const user = useAppSelector(selectCurrentUser);

  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState<ProjectStatus | ''>('');
  const [page,      setPage]      = useState(1);
  const [showCreate,      setShowCreate]      = useState(false);
  const [editingProject,  setEditingProject]  = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const queryParams = {
    page,
    limit: 9,
    search: search || undefined,
    status: status || undefined,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  };

  const { data, isLoading, isFetching } = useProjects(user?.id || '', queryParams);


  const createProject = useCreateProject(user?.id || '');
  const updateProject = useUpdateProject(user?.id || '');
  const deleteProject = useDeleteProject(user?.id || '');

  const handleCreate = (formData: ProjectFormData) => {
    createProject.mutate(formData, {
      onSuccess: () => {
        setShowCreate(false);
        setPage(1);
      },
    });
  };

 
  const handleUpdate = (formData: ProjectFormData) => {
    if (!editingProject) return;

    const projectId =
      editingProject.id ?? editingProject._id?.toString();

    if (!projectId) return;

    updateProject.mutate(
      {
        projectId,
        payload: formData,
      },
      {
        onSuccess: () => setEditingProject(null),
      }
    );
  };

 
  const handleDelete = () => {
    if (!deletingProject) return;

    const projectId =
      deletingProject.id ?? deletingProject._id?.toString();

    if (!projectId) return;

    deleteProject.mutate(projectId, {
      onSuccess: () => {
        setDeletingProject(null);
        setPage(1);
      },
    });
  };

  // Reset page when filter/search changes
  const handleStatusChange = (val: ProjectStatus | '') => {
    setStatus(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const { projects = [], pagination } = data ?? {};
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="page">
      <Navbar
        title="Projects"
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
          >
            New Project
          </Button>
        }
      />

      <main className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input pl-9 h-10"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
                  status === tab.value
                    ? 'bg-white text-gray-900 shadow-soft'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        {!isLoading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {pagination?.total
                ? `${pagination.total} project${pagination.total !== 1 ? 's' : ''} found`
                : 'No projects found'}
            </p>
            {isFetching && (
              <span className="text-xs text-brand-500 font-medium animate-pulse">
                Refreshing…
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : !projects.length ? (
          <div className="card">
            <EmptyState
              icon={<FolderKanban className="h-8 w-8" />}
              title={search ? 'No matching projects' : 'No projects yet'}
              description={
                search
                  ? `No projects match "${search}". Try a different search term.`
                  : 'Create your first project to get started!'
              }
              action={
                !search
                  ? { label: '+ New Project', onClick: () => setShowCreate(true) }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id || p._id}
                project={p}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination?.hasPrevPage || isFetching}
            >
              ← Prev
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-sm font-medium transition-all',
                    p === page
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination?.hasNextPage || isFetching}
            >
              Next →
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectForm
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isLoading={createProject.isPending}
      />
      <ProjectForm
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleUpdate}
        isLoading={updateProject.isPending}
        project={editingProject}
      />
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
        title="Delete Project"
        description={`Delete "${deletingProject?.title}"? All tasks will be permanently removed.`}
      />
    </div>
  );
}

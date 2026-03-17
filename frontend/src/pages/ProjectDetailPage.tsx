import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, CheckCircle2, Clock, Circle,
  Pencil, Trash2, ListTodo,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/common/Button';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { TaskRowSkeleton, Skeleton } from '@/components/common/Skeleton';
import { cn, formatDate, getProjectStatusBadge } from '@/utils/helpers';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/hooks/useQueries';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import type { Task, TaskStatus } from '@/types';
import type { TaskFormData } from '@/utils/validation';
import type { ProjectFormData } from '@/utils/validation';

const STATUS_FILTERS: { label: string; value: TaskStatus | ''; icon: React.ReactNode }[] = [
  { label: 'All',         value: '',            icon: <ListTodo className="h-3.5 w-3.5" />     },
  { label: 'To Do',       value: 'todo',        icon: <Circle className="h-3.5 w-3.5" />       },
  { label: 'In Progress', value: 'in-progress', icon: <Clock className="h-3.5 w-3.5" />        },
  { label: 'Done',        value: 'done',        icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user   = useAppSelector(selectCurrentUser);
  const userId = user?.id ?? '';

  const [taskFilter,      setTaskFilter]      = useState<TaskStatus | ''>('');
  const [showTaskForm,    setShowTaskForm]    = useState(false);
  const [editingTask,     setEditingTask]     = useState<Task | null>(null);
  const [deletingTask,    setDeletingTask]    = useState<Task | null>(null);
  const [editingProject,  setEditingProject]  = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Queries
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id!, {
    status: taskFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });

  // Mutations
  const updateProject = useUpdateProject(userId);
  const deleteProject = useDeleteProject(userId);
  const createTask    = useCreateTask(id!);
  const updateTask    = useUpdateTask(id!);
  const deleteTask    = useDeleteTask(id!);

  // Handlers
 const handleProjectUpdate = (data: ProjectFormData) => {
  const projectId = id ?? project?.id ?? project?._id?.toString();
  if (!projectId) return;
  updateProject.mutate(
    { projectId, payload: data },
    { onSuccess: () => setEditingProject(false) }
  );
};

  const handleProjectDelete = () => {
    deleteProject.mutate(id!, {
      onSuccess: () => navigate('/projects', { replace: true }),
    });
  };

  const handleTaskCreate = (data: TaskFormData) => {
    createTask.mutate(data, { onSuccess: () => setShowTaskForm(false) });
  };

  const handleTaskUpdate = (data: TaskFormData) => {
    if (!editingTask) return;
    updateTask.mutate(
      { taskId: editingTask.id || editingTask._id!, payload: data },
      { onSuccess: () => setEditingTask(null) },
    );
  };

  const handleTaskDelete = () => {
    if (!deletingTask) return;
    deleteTask.mutate(deletingTask.id || deletingTask._id!, {
      onSuccess: () => setDeletingTask(null),
    });
  };

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    updateTask.mutate({ taskId: task.id || task._id!, payload: { status } });
  };

  const { tasks = [], counts } = tasksData ?? {};

  return (
    <div className="page">
      <Navbar
        title={projectLoading ? 'Loading…' : (project?.title ?? 'Project')}
        actions={
          !projectLoading && project ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => setEditingProject(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDeletingProject(true)}
              >
                Delete
              </Button>
            </div>
          ) : undefined
        }
      />

      <main className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Project header card */}
        <div className="card p-6">
          {projectLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : project ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 flex-1">{project.title}</h2>
                <span className={getProjectStatusBadge(project.status)}>
                  {project.status === 'active' ? 'Active' : 'Completed'}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
              )}

              <p className="text-xs text-gray-400">
                Created {formatDate(project.createdAt)}
              </p>

              {/* Task counts bar */}
              {counts && counts.total > 0 && (
                <div className="flex gap-4 pt-2 border-t border-gray-50">
                  {[
                    { label: 'To Do',       val: counts.todo,           color: 'text-gray-500'    },
                    { label: 'In Progress', val: counts['in-progress'], color: 'text-amber-600'   },
                    { label: 'Done',        val: counts.done,           color: 'text-emerald-600' },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <span className={cn('text-sm font-bold', c.color)}>{c.val}</span>
                      <span className="text-xs text-gray-400">{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Tasks section */}
        <div className="card overflow-hidden">
          {/* Tasks header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowTaskForm(true)}
            >
              Add Task
            </Button>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-gray-50 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTaskFilter(f.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  taskFilter === f.value
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                )}
              >
                {f.icon} {f.label}
                {f.value === '' && counts?.total !== undefined && (
                  <span className="ml-1 bg-gray-200 text-gray-600 rounded-full px-1.5 py-0 text-[10px] font-bold">
                    {counts.total}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="divide-y divide-gray-50 px-1 py-1">
            {tasksLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TaskRowSkeleton key={i} />)
            ) : !tasks.length ? (
              <EmptyState
                icon={<ListTodo className="h-8 w-8" />}
                title={taskFilter ? 'No tasks with this status' : 'No tasks yet'}
                description={
                  taskFilter
                    ? 'Try a different filter or add a new task.'
                    : 'Add your first task to start tracking work.'
                }
                action={
                  !taskFilter
                    ? { label: '+ Add Task', onClick: () => setShowTaskForm(true) }
                    : undefined
                }
              />
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id || task._id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                  onStatusChange={handleStatusChange}
                  isUpdating={updateTask.isPending}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleTaskCreate}
        isLoading={createTask.isPending}
      />
      <TaskForm
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleTaskUpdate}
        isLoading={updateTask.isPending}
        task={editingTask}
      />
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleTaskDelete}
        isLoading={deleteTask.isPending}
        title="Delete Task"
        description={`Delete "${deletingTask?.title}"? This action cannot be undone.`}
      />
      <ProjectForm
        isOpen={editingProject}
        onClose={() => setEditingProject(false)}
        onSubmit={handleProjectUpdate}
        isLoading={updateProject.isPending}
        project={project ?? null}
      />
      <ConfirmDialog
        isOpen={deletingProject}
        onClose={() => setDeletingProject(false)}
        onConfirm={handleProjectDelete}
        isLoading={deleteProject.isPending}
        title="Delete Project"
        description={`Delete "${project?.title}"? All associated tasks will be permanently removed.`}
      />
    </div>
  );
}
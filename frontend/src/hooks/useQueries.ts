import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectsApi } from '@/api/projects.api';
import { tasksApi } from '@/api/tasks.api';
import { queryKeys } from '@/api/query-keys';
import { getErrorMessage } from '@/api/axios';
import type {
  ProjectQueryParams,
  TaskQueryParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '@/types';

// ── Projects ──────────────────────────────────────────────────────────────────
export function useProjects(userId: string, params?: ProjectQueryParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(userId, params),
    queryFn: () => projectsApi.getAll(params),
    enabled: !!userId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getOne(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useProjectStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.projects.stats(userId),
    queryFn: projectsApi.getStats,
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useCreateProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsApi.create(payload),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.projects.stats(userId) });
      const prevStats = qc.getQueryData(queryKeys.projects.stats(userId));
      qc.setQueryData(queryKeys.projects.stats(userId), (old: any) =>
        old ? { ...old, total: old.total + 1, active: old.active + 1 } : old
      );
      return { prevStats };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevStats) {
        qc.setQueryData(queryKeys.projects.stats(userId), ctx.prevStats);
      }
      toast.error(getErrorMessage(err));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      qc.invalidateQueries({
        queryKey: queryKeys.projects.stats(userId),
        refetchType: 'all',
      });
      toast.success('Project created!');
    },
  });
}

export function useUpdateProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpdateProjectPayload }) =>
      projectsApi.update(projectId, payload),
    onMutate: async ({ projectId, payload }) => {
      await qc.cancelQueries({ queryKey: queryKeys.projects.stats(userId) });
      const prevStats = qc.getQueryData(queryKeys.projects.stats(userId));
      qc.setQueryData(queryKeys.projects.stats(userId), (old: any) => {
        if (!old || !payload.status) return old;
        const prevProject = qc.getQueryData<any>(queryKeys.projects.detail(projectId));
        const prevStatus = prevProject?.status;
        if (!prevStatus || prevStatus === payload.status) return old;
        const updated = { ...old };
        if (prevStatus === 'active') updated.active = Math.max(0, updated.active - 1);
        if (prevStatus === 'completed') updated.completed = Math.max(0, updated.completed - 1);
        if (payload.status === 'active') updated.active = updated.active + 1;
        if (payload.status === 'completed') updated.completed = updated.completed + 1;
        return updated;
      });
      return { prevStats, projectId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevStats) {
        qc.setQueryData(queryKeys.projects.stats(userId), ctx.prevStats);
      }
      toast.error(getErrorMessage(err));
    },
    onSuccess: (updated, { projectId }) => {
      qc.setQueryData(queryKeys.projects.detail(projectId), updated);
      qc.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      qc.invalidateQueries({
        queryKey: queryKeys.projects.stats(userId),
        refetchType: 'all',
      });
      toast.success('Project updated!');
    },
  });
}

export function useDeleteProject(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.projects.stats(userId) });
      const prevStats = qc.getQueryData(queryKeys.projects.stats(userId));
      qc.setQueryData(queryKeys.projects.stats(userId), (old: any) =>
        old ? { ...old, total: Math.max(0, old.total - 1) } : old
      );
      return { prevStats };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevStats) {
        qc.setQueryData(queryKeys.projects.stats(userId), ctx.prevStats);
      }
      toast.error(getErrorMessage(err));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      qc.invalidateQueries({
        queryKey: queryKeys.projects.stats(userId),
        refetchType: 'all',
      });
      toast.success('Project deleted');
    },
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export function useTasks(projectId: string, params?: TaskQueryParams) {
  return useQuery({
    queryKey: queryKeys.tasks.list(projectId, params),
    queryFn: () => tasksApi.getAll(projectId, params),
    enabled: !!projectId,
    staleTime: 20_000,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      tasksApi.create(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(projectId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(projectId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
      toast.success('Task deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
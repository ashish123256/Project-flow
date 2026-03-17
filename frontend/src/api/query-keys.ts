import type { ProjectQueryParams, TaskQueryParams } from '@/types';

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Projects
  projects: {
    all:    ()                           => ['projects'] as const,
    lists:  ()                           => ['projects', 'list'] as const,
    list:   (userId: string, params?: ProjectQueryParams) => ['projects', 'list', userId, params] as const,
    detail: (id: string)                 => ['projects', 'detail', id] as const,
    stats:  (userId: string)             => ['projects', 'stats', userId] as const,
  },

  // Tasks
  tasks: {
    all:    (projectId: string)                          => ['tasks', projectId] as const,
    list:   (projectId: string, params?: TaskQueryParams) => ['tasks', projectId, 'list', params] as const,
    detail: (projectId: string, taskId: string)          => ['tasks', projectId, 'detail', taskId] as const,
  },
} as const;

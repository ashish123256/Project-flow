import api from './axios';
import type {
  ApiResponse,
  Task,
  TasksResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskQueryParams,
} from '@/types';

export const tasksApi = {
  getAll: async (
    projectId: string,
    params?: TaskQueryParams,
  ): Promise<TasksResponse> => {
    const { data } = await api.get<ApiResponse<TasksResponse>>(
      `/projects/${projectId}/tasks`,
      { params },
    );
    return data.data;
  },

  getOne: async (projectId: string, taskId: string): Promise<Task> => {
    const { data } = await api.get<ApiResponse<Task>>(
      `/projects/${projectId}/tasks/${taskId}`,
    );
    return data.data;
  },

  create: async (
    projectId: string,
    payload: CreateTaskPayload,
  ): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>(
      `/projects/${projectId}/tasks`,
      payload,
    );
    return data.data;
  },

  update: async (
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(
      `/projects/${projectId}/tasks/${taskId}`,
      payload,
    );
    return data.data;
  },

  delete: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};

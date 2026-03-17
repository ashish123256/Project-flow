import api from './axios';
import type {
  ApiResponse,
  Project,
  ProjectsResponse,
  ProjectStats,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectQueryParams,
} from '@/types';

export const projectsApi = {
  getAll: async (params?: ProjectQueryParams): Promise<ProjectsResponse> => {
    const { data } = await api.get<ApiResponse<ProjectsResponse>>('/projects', {
      params,
    });
    return data.data;
  },

  getOne: async (id: string): Promise<Project> => {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data.data;
  },

  getStats: async (): Promise<ProjectStats> => {
    const { data } = await api.get<ApiResponse<ProjectStats>>('/projects/stats');
    return data.data;
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> => {
    const { data } = await api.put<ApiResponse<Project>>(
      `/projects/${id}`,
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

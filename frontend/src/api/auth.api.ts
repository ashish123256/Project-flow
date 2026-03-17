import api from './axios';
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authApi = {
  // Cookie is set by the server — we only get back user info (no token in response body)
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  // Calls backend to clear the httpOnly cookie
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};

import axios, { AxiosError } from 'axios';
import { store } from '@/store';
import { clearCredentials, selectToken } from '@/store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true, // send httpOnly cookie (works in production)
});

// Request interceptor — attach Bearer token from Redux
// This is the fallback for dev (Vite proxy doesn't forward Set-Cookie properly)
// In production the httpOnly cookie is sent automatically via withCredentials
api.interceptors.request.use((config) => {
  const token = selectToken(store.getState());
// AFTER — strict validation before attaching
if (token && typeof token === 'string' && token.length > 10) {
  config.headers.Authorization = `Bearer ${token}`;
} else {
  delete config.headers.Authorization; // ← removes stale header completely
}
  return config;
});

// Response interceptor — 401 means token/cookie both invalid → log out
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      // Don't redirect if already on login or register page
      const isAuthPage = ['/login', '/register'].includes(window.location.pathname);
      if (!isAuthPage) {
        store.dispatch(clearCredentials());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    if (data?.errors && Array.isArray(data.errors)) return data.errors.join(', ');
    return data?.message || error.message || 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

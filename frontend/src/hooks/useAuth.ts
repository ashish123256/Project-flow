import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth.api';
import { setCredentials, clearCredentials, selectIsAuthenticated } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/api/query-keys';
import { getErrorMessage } from '@/api/axios';
import type { LoginPayload, RegisterPayload } from '@/types';

export function useRegister() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ user, token }) => {
      // Store both user AND token in Redux (token used as Bearer header fallback)
      dispatch(setCredentials({ user, token }));
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/dashboard', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useLogin() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ user, token }) => {
      // 1. Store user + token in Redux FIRST
      dispatch(setCredentials({ user, token }));
      // 2. Then navigate — ProtectedRoute will pass through
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useLogout() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  return async () => {
    try {
      await authApi.logout(); // tells server to clear httpOnly cookie
    } catch {
      // clear local state even if server call fails
    } finally {
      dispatch(clearCredentials());
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    }
  };
}

export function useMe() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

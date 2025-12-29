import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, getCurrentUser } from '../api/authApi';
import type { LoginRequest } from '../types/Auth';

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (loginData: LoginRequest) => login(loginData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
  });
};
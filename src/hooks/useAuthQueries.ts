import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, getCurrentUser, register } from '../api/authApi';

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      register(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      login(username, password),
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deleteUser } from '../api/userApi';
import type { UserCreate, UserUpdateRequest } from '../types/User';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData: UserUpdateRequest) => updateUser(updateData),
    onSuccess: () => {
      // Invalidate current user and users list
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
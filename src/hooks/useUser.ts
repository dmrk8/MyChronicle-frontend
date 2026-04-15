import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser, updateUsername, changePassword } from '../api/userApi';
import type { UpdatePassword, UpdateUsername } from '../types/User';

export const useUpdateUsername = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernameData: UpdateUsername) => updateUsername(usernameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passwordData: UpdatePassword) => changePassword(passwordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
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
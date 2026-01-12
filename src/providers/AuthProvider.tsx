import React from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';
import { useCurrentUser, useLogin, useLogout } from '../hooks/useAuthQueries';
import { type LoginRequest } from '../types/Auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
    await refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

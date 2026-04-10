import React from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';
import { useCurrentUser, useLogin, useLogout } from '../hooks/useAuthQueries';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
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

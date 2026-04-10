import backendApi from './backendApi';
import type { User } from '../types/User';

export const register = async (username: string, password: string): Promise<string> => {
  const response = await backendApi.post('/auth/register', {
    username,
    password,
  });
  return response.data;
};

export const login = async (username: string, password: string): Promise<string> => {
  const response = await backendApi.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await backendApi.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await backendApi.get('/auth/me');
  return response.data;
};
import backendApi from './backendApi';
import type { LoginRequest, UserInfo } from '../types/Auth';

export const login = async (loginData: LoginRequest) => {
  const response = await backendApi.post('/auth/login', loginData);
  return response.data;
};

export const logout = async () => {
  const response = await backendApi.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<UserInfo> => {
  const response = await backendApi.get('/auth/me');
  return response.data;
};
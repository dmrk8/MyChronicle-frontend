import backendApi from './backendApi';
import type { User, UserCreate, UserUpdateRequest } from '../types/User';

export const createUser = async (userData: UserCreate): Promise<User> => {
  const response = await backendApi.post('/users/', userData);
  return response.data;
};

export const updateUser = async (updateData: UserUpdateRequest): Promise<User> => {
  const response = await backendApi.patch('/users/', updateData);
  return response.data;
};

export const deleteUser = async (): Promise<void> => {
  const response = await backendApi.delete('/users/');
  return response.data;
};
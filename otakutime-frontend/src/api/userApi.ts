import backendApi from './backendApi';
import type { UserCreate, UserUpdateRequest, UserResponse } from '../types/User';

export const createUser = async (userData: UserCreate): Promise<UserResponse> => {
  const response = await backendApi.post('/users/', userData);
  return response.data;
};

export const updateUser = async (updateData: UserUpdateRequest): Promise<UserResponse> => {
  const response = await backendApi.patch('/users/', updateData);
  return response.data;
};

export const deleteUser = async (): Promise<UserResponse> => {
  const response = await backendApi.delete('/users/');
  return response.data;
};
import backendApi from './backendApi';
import type {  UpdatePassword, UpdateUsername } from '../types/User';


export const deleteUser = async (): Promise<void> => {
  await backendApi.delete('/users/');
};

export const updateUsername = async (username: UpdateUsername): Promise<void> => {
  await backendApi.patch('/users/username', username);
};

export const changePassword = async (passwordData: UpdatePassword): Promise<void> => {
  await backendApi.patch('/users/password', passwordData);
};
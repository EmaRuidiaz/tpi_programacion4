import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { UserCreate, UserPublic } from '../types';

export async function registerUser(data: UserCreate): Promise<UserPublic> {
  const response = await axiosInstance.post<UserPublic>('/auth/register', data);
  return response.data;
}

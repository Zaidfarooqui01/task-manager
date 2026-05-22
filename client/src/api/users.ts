import api from './axios';
import type { ApiResponse, User } from '../types';

export const usersApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },
};

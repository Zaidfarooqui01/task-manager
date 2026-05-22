import api from './axios';
import type { ApiResponse, User } from '../types';

export const authApi = {
  signup: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};

import api from './axios';
import type { ApiResponse, Task } from '../types';

export const tasksApi = {
  getAll: async (params?: { projectId?: string; status?: string; assignedToId?: string }) => {
    const res = await api.get<ApiResponse<Task[]>>('/tasks', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId: string;
    assignedToId?: string;
  }) => {
    const res = await api.post<ApiResponse<Task>>('/tasks', data);
    return res.data;
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      assignedToId?: string | null;
    }
  ) => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/tasks/${id}`);
    return res.data;
  },
};

import api from './axios';
import type { ApiResponse, Project } from '../types';

export const projectsApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Project[]>>('/projects');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },

  create: async (data: { name: string; description?: string }) => {
    const res = await api.post<ApiResponse<Project>>('/projects', data);
    return res.data;
  },

  update: async (id: string, data: { name?: string; description?: string }) => {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/projects/${id}`);
    return res.data;
  },

  addMember: async (projectId: string, userId: string) => {
    const res = await api.post<ApiResponse>(`/projects/${projectId}/members`, { userId });
    return res.data;
  },

  removeMember: async (projectId: string, userId: string) => {
    const res = await api.delete<ApiResponse>(`/projects/${projectId}/members/${userId}`);
    return res.data;
  },
};

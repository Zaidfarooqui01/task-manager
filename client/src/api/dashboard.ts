import api from './axios';
import type { ApiResponse, DashboardSummary } from '../types';

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data;
  },
};

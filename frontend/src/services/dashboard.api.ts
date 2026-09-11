import { apiClient } from './api.client';
import { ApiSuccessResponse } from '../types/api.types';
import { DashboardOverview } from '../types/dashboard.types';

export const dashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    const res = await apiClient.get<ApiSuccessResponse<DashboardOverview>>('/dashboard/overview');
    return res.data.data;
  },
};

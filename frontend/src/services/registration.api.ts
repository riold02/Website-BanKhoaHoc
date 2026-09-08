import { apiClient } from './api.client';
import { Registration } from '../types/enrollment.types';
import { ApiSuccessResponse } from '../types/api.types';

export const registrationApi = {
  async getRegistrations(params?: {
    status?: string;
    periodId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ registrations: Registration[]; meta: any }> {
    const res = await apiClient.get<ApiSuccessResponse<Registration[]>>('/registrations', { params });
    return { registrations: res.data.data, meta: res.data.meta };
  },

  async getRegistrationById(id: string): Promise<Registration> {
    const res = await apiClient.get<ApiSuccessResponse<Registration>>(`/registrations/${id}`);
    return res.data.data;
  },

  async createRegistration(payload: { periodId: string; note?: string }): Promise<Registration> {
    const res = await apiClient.post<ApiSuccessResponse<Registration>>('/registrations', payload);
    return res.data.data;
  },

  async reviewRegistration(
    id: string,
    payload: { status: 'APPROVED' | 'REJECTED'; note?: string }
  ): Promise<Registration> {
    const res = await apiClient.patch<ApiSuccessResponse<Registration>>(`/registrations/${id}/review`, payload);
    return res.data.data;
  },

  async cancelRegistration(id: string): Promise<Registration> {
    const res = await apiClient.patch<ApiSuccessResponse<Registration>>(`/registrations/${id}/cancel`, {});
    return res.data.data;
  },
};

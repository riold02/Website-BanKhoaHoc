import { apiClient } from './api.client';
import { EnrollmentPeriod } from '../types/enrollment.types';
import { ApiSuccessResponse } from '../types/api.types';

export const enrollmentPeriodApi = {
  async getPeriods(params?: {
    courseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ periods: EnrollmentPeriod[]; meta: any }> {
    const res = await apiClient.get<ApiSuccessResponse<EnrollmentPeriod[]>>('/enrollment-periods', { params });
    return { periods: res.data.data, meta: res.data.meta };
  },

  async getPeriodById(id: string): Promise<EnrollmentPeriod> {
    const res = await apiClient.get<ApiSuccessResponse<EnrollmentPeriod>>(`/enrollment-periods/${id}`);
    return res.data.data;
  },

  async createPeriod(payload: {
    courseId: string;
    periodCode: string;
    name: string;
    startRegistration: string;
    endRegistration: string;
    expectedStartDate?: string | null;
    tuitionFee: number;
    maxCapacity: number;
  }): Promise<EnrollmentPeriod> {
    const res = await apiClient.post<ApiSuccessResponse<EnrollmentPeriod>>('/enrollment-periods', payload);
    return res.data.data;
  },

  async updatePeriod(
    id: string,
    payload: {
      name?: string;
      startRegistration?: string;
      endRegistration?: string;
      expectedStartDate?: string | null;
      tuitionFee?: number;
      maxCapacity?: number;
    }
  ): Promise<EnrollmentPeriod> {
    const res = await apiClient.put<ApiSuccessResponse<EnrollmentPeriod>>(`/enrollment-periods/${id}`, payload);
    return res.data.data;
  },

  async updatePeriodStatus(id: string, status: string): Promise<EnrollmentPeriod> {
    const res = await apiClient.patch<ApiSuccessResponse<EnrollmentPeriod>>(`/enrollment-periods/${id}/status`, {
      status,
    });
    return res.data.data;
  },
};

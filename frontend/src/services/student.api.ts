import { apiClient } from './api.client';
import { Student } from '../types/enrollment.types';
import { ApiSuccessResponse } from '../types/api.types';

export const studentApi = {
  async getStudents(params?: { search?: string; page?: number; limit?: number }): Promise<{
    students: Student[];
    meta: any;
  }> {
    const res = await apiClient.get<ApiSuccessResponse<Student[]>>('/students', { params });
    return { students: res.data.data, meta: res.data.meta };
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await apiClient.get<ApiSuccessResponse<Student>>(`/students/${id}`);
    return res.data.data;
  },

  async getMyProfile(): Promise<Student> {
    const res = await apiClient.get<ApiSuccessResponse<Student>>('/students/me');
    return res.data.data;
  },

  async updateStudent(
    id: string,
    payload: {
      idCardNumber?: string | null;
      birthDate?: string | null;
      gender?: string | null;
      educationLevel?: string | null;
    }
  ): Promise<Student> {
    const res = await apiClient.put<ApiSuccessResponse<Student>>(`/students/${id}`, payload);
    return res.data.data;
  },
};

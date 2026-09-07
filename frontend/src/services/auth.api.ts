import { apiClient } from './api.client';
import { LoginResponse, User } from '../types/auth.types';
import { ApiSuccessResponse } from '../types/api.types';

export const authApi = {
  async login(payload: { usernameOrEmail: string; password: string }): Promise<LoginResponse> {
    const res = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: any): Promise<LoginResponse> {
    const res = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/register', payload);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiSuccessResponse<User>>('/auth/me');
    return res.data.data;
  },

  async updateProfile(payload: { fullName?: string; phone?: string; address?: string }): Promise<any> {
    const res = await apiClient.put<ApiSuccessResponse<any>>('/auth/profile', payload);
    return res.data.data;
  },

  async listUsers(params?: { page?: number; limit?: number; search?: string; roleId?: number; isActive?: boolean }): Promise<{ users: User[]; meta: any }> {
    const res = await apiClient.get<ApiSuccessResponse<User[]>>('/users', { params });
    return {
      users: res.data.data,
      meta: res.data.meta,
    };
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const res = await apiClient.patch<ApiSuccessResponse<User>>(`/users/${id}/status`, { isActive });
    return res.data.data;
  },
};

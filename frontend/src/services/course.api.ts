import { apiClient } from './api.client';
import { Course, Category } from '../types/course.types';
import { ApiSuccessResponse } from '../types/api.types';

export const courseApi = {
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<{ courses: Course[]; meta: any }> {
    const res = await apiClient.get<ApiSuccessResponse<Course[]>>('/courses', { params });
    return {
      courses: res.data.data,
      meta: res.data.meta,
    };
  },

  async getCourseById(id: string): Promise<Course> {
    const res = await apiClient.get<ApiSuccessResponse<Course>>(`/courses/${id}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiSuccessResponse<Category[]>>('/courses/categories');
    return res.data.data;
  },

  async createCourse(payload: {
    courseCode: string;
    title: string;
    description?: string;
    totalHours: number;
    standardPrice: number;
    categoryId?: string | null;
    isActive?: boolean;
  }): Promise<Course> {
    const res = await apiClient.post<ApiSuccessResponse<Course>>('/courses', payload);
    return res.data.data;
  },

  async updateCourse(
    id: string,
    payload: {
      courseCode?: string;
      title?: string;
      description?: string;
      totalHours?: number;
      standardPrice?: number;
      categoryId?: string | null;
      isActive?: boolean;
    }
  ): Promise<Course> {
    const res = await apiClient.put<ApiSuccessResponse<Course>>(`/courses/${id}`, payload);
    return res.data.data;
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiSuccessResponse<{ message: string }>>(`/courses/${id}`);
    return res.data.data;
  },
};

import { apiClient } from "./api.client";
import { Student } from "../types/enrollment.types";
import { ApiSuccessResponse } from "../types/api.types";
import {
  StudentAttendanceItem,
  StudentGradeItem,
  StudentScheduleItem,
} from "../types/learning.types";

export const studentApi = {
  async getStudents(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    students: Student[];
    meta: any;
  }> {
    const res = await apiClient.get<ApiSuccessResponse<Student[]>>(
      "/students",
      { params },
    );
    return { students: res.data.data, meta: res.data.meta };
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await apiClient.get<ApiSuccessResponse<Student>>(
      `/students/${id}`,
    );
    return res.data.data;
  },

  async getMyProfile(): Promise<Student> {
    const res =
      await apiClient.get<ApiSuccessResponse<Student>>("/students/me");
    return res.data.data;
  },

  async getMySchedule(): Promise<StudentScheduleItem[]> {
    const res = await apiClient.get<ApiSuccessResponse<StudentScheduleItem[]>>(
      "/students/me/schedule",
    );
    return res.data.data;
  },

  async getMyAttendance(): Promise<StudentAttendanceItem[]> {
    const res = await apiClient.get<
      ApiSuccessResponse<StudentAttendanceItem[]>
    >("/students/me/attendance");
    return res.data.data;
  },

  async getMyGrades(): Promise<StudentGradeItem[]> {
    const res = await apiClient.get<ApiSuccessResponse<StudentGradeItem[]>>(
      "/students/me/grades",
    );
    return res.data.data;
  },

  async updateStudent(
    id: string,
    payload: {
      idCardNumber?: string | null;
      birthDate?: string | null;
      gender?: string | null;
      educationLevel?: string | null;
    },
  ): Promise<Student> {
    const res = await apiClient.put<ApiSuccessResponse<Student>>(
      `/students/${id}`,
      payload,
    );
    return res.data.data;
  },
};

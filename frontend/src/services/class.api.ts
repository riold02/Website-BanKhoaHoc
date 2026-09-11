import { apiClient } from "./api.client";
import { ApiSuccessResponse } from "../types/api.types";
import {
  AttendanceStatus,
  ClassSession,
  Gradebook,
  ManagedClass,
} from "../types/class.types";

export const classApi = {
  async getClasses(params?: { periodId?: string }): Promise<ManagedClass[]> {
    const response = await apiClient.get<ApiSuccessResponse<ManagedClass[]>>(
      "/classes",
      { params },
    );
    return response.data.data;
  },

  async createClass(payload: {
    periodId: string;
    classCode: string;
    name: string;
    room?: string | null;
    scheduleDescription?: string | null;
    maxStudents?: number;
    startDate?: string | null;
    endDate?: string | null;
  }): Promise<ManagedClass> {
    const response = await apiClient.post<ApiSuccessResponse<ManagedClass>>(
      "/classes",
      payload,
    );
    return response.data.data;
  },

  async getClassById(id: string): Promise<ManagedClass> {
    const response = await apiClient.get<ApiSuccessResponse<ManagedClass>>(
      `/classes/${id}`,
    );
    return response.data.data;
  },

  async getSessions(id: string): Promise<ClassSession[]> {
    const response = await apiClient.get<ApiSuccessResponse<ClassSession[]>>(
      `/classes/${id}/sessions`,
    );
    return response.data.data;
  },

  async generateSessions(
    id: string,
    payload: {
      weekdays: number[];
      sessionCount: number;
      startDate?: string;
      topicPrefix?: string | null;
    },
  ): Promise<ClassSession[]> {
    const response = await apiClient.post<ApiSuccessResponse<ClassSession[]>>(
      `/classes/${id}/sessions/generate`,
      payload,
    );
    return response.data.data;
  },

  async allocateStudents(
    id: string,
    registrationIds: string[],
  ): Promise<ManagedClass> {
    const response = await apiClient.post<ApiSuccessResponse<ManagedClass>>(
      `/classes/${id}/allocate`,
      { registrationIds },
    );
    return response.data.data;
  },

  async removeStudent(
    classId: string,
    enrollmentId: string,
  ): Promise<ManagedClass> {
    const response = await apiClient.delete<ApiSuccessResponse<ManagedClass>>(
      `/classes/${classId}/enrollments/${enrollmentId}`,
    );
    return response.data.data;
  },

  async deleteClass(id: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<{ id: string }>>(
      `/classes/${id}`,
    );
  },

  async saveAttendance(
    classId: string,
    sessionId: string,
    attendances: Array<{
      enrollmentId: string;
      status: AttendanceStatus;
      note?: string | null;
    }>,
  ): Promise<ClassSession["attendances"]> {
    const response = await apiClient.put<
      ApiSuccessResponse<NonNullable<ClassSession["attendances"]>>
    >(`/classes/${classId}/sessions/${sessionId}/attendance`, { attendances });
    return response.data.data;
  },

  async getGradebook(id: string): Promise<Gradebook> {
    const response = await apiClient.get<ApiSuccessResponse<Gradebook>>(
      `/classes/${id}/gradebook`,
    );
    return response.data.data;
  },

  async configureGradeComponents(
    id: string,
    components: Array<{ id?: string; name: string; weight: number }>,
  ): Promise<Gradebook["gradeComponents"]> {
    const response = await apiClient.put<
      ApiSuccessResponse<Gradebook["gradeComponents"]>
    >(`/classes/${id}/grade-components`, { components });
    return response.data.data;
  },

  async saveGrades(
    classId: string,
    enrollmentId: string,
    grades: Array<{
      componentId: string;
      score: number;
      feedback?: string | null;
    }>,
  ) {
    const response = await apiClient.put<ApiSuccessResponse<unknown>>(
      `/classes/${classId}/enrollments/${enrollmentId}/grades`,
      { grades },
    );
    return response.data.data;
  },
};

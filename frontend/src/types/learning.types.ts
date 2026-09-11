import { AttendanceStatus, ClassSession } from "./class.types";

export interface StudentCourseClass {
  id: string;
  classCode: string;
  name: string;
  room?: string | null;
  scheduleDescription?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  period: {
    course: { id: string; courseCode: string; title: string };
  };
  sessions: ClassSession[];
}

export interface StudentScheduleItem {
  enrollmentId: string;
  enrollmentStatus: "ACTIVE" | "COMPLETED";
  class: StudentCourseClass;
}

export interface StudentAttendanceItem {
  enrollmentId: string;
  class: Pick<StudentCourseClass, "id" | "classCode" | "name" | "period">;
  sessions: Array<{
    sessionId: string;
    sessionNumber: number;
    sessionDate: string;
    topic?: string | null;
    sessionStatus: "SCHEDULED" | "COMPLETED";
    attendance?: { status: AttendanceStatus; note?: string | null } | null;
  }>;
  summary: {
    totalSessions: number;
    recordedSessions: number;
    absenceCount: number;
    absenceRate: number;
  };
}

export interface StudentGradeItem {
  enrollmentId: string;
  enrollmentStatus: "ACTIVE" | "COMPLETED";
  finalScore?: number | null;
  academicResult?: "PASS" | "FAIL" | "DISTINCTION" | null;
  class: Pick<StudentCourseClass, "id" | "classCode" | "name" | "period">;
  grades: Array<{
    componentId: string;
    name: string;
    weight: number;
    score?: number | null;
    feedback?: string | null;
  }>;
}

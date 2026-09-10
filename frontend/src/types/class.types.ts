export type ClassStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface ClassCourse {
  id: string;
  courseCode: string;
  title: string;
}

export interface ClassSession {
  id: string;
  sessionNumber: number;
  sessionDate: string;
  topic?: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  attendances?: Array<{
    id: string;
    enrollmentId: string;
    sessionId: string;
    status: AttendanceStatus;
    note?: string | null;
  }>;
}

export interface ClassEnrollment {
  id: string;
  studentId: string;
  status: "ACTIVE" | "DROPPED" | "COMPLETED";
  enrolledAt: string;
  finalScore?: number | null;
  academicResult?: string | null;
  student: {
    id: string;
    studentCode: string;
    user: {
      profile?: { fullName: string } | null;
      email: string;
    };
  };
  attendances?: Array<{
    id: string;
    status: AttendanceStatus;
    sessionId: string;
  }>;
}

export interface ManagedClass {
  id: string;
  periodId: string;
  classCode: string;
  name: string;
  room?: string | null;
  scheduleDescription?: string | null;
  maxStudents: number;
  status: ClassStatus;
  teacherId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  period: {
    id: string;
    periodCode: string;
    name: string;
    course: ClassCourse;
  };
  enrollments: ClassEnrollment[];
  sessions?: ClassSession[];
}

export interface AllocationCandidate {
  id: string;
  registrationCode: string;
  studentId: string;
  registrationDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  student?: {
    studentCode: string;
    user: { email: string; profile?: { fullName: string } | null };
  };
  invoice?: {
    paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
    paidAmount: number;
    totalAmount: number;
  } | null;
}

export interface GradeComponent {
  id: string;
  name: string;
  weight: number;
}

export interface GradebookEnrollment extends Omit<ClassEnrollment, "student"> {
  student: {
    id: string;
    studentCode: string;
    user?: { profile?: { fullName: string } | null };
  };
  grades: Array<{
    id: string;
    componentId: string;
    score: number;
    feedback?: string | null;
  }>;
}

export interface Gradebook {
  id: string;
  classCode: string;
  name: string;
  maxStudents: number;
  status: ClassStatus;
  period: ManagedClass["period"];
  gradeComponents: GradeComponent[];
  enrollments: GradebookEnrollment[];
}

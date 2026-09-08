import { Category, Course, EnrollmentPeriodBasic } from './course.types';

export interface EnrollmentPeriod extends EnrollmentPeriodBasic {
  courseId: string;
  course?: {
    id: string;
    courseCode: string;
    title: string;
    category?: Category | null;
  };
  _count?: {
    registrations: number;
    classes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface StudentBasic {
  id: string;
  studentCode: string;
  idCardNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  educationLevel?: string | null;
  user: {
    id: string;
    email: string;
    username: string;
    isActive: boolean;
    profile?: {
      fullName: string;
      phone?: string | null;
      address?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface Registration {
  id: string;
  registrationCode: string;
  studentId: string;
  periodId: string;
  registrationDate: string;
  status: RegistrationStatus;
  note?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  student?: StudentBasic;
  period?: EnrollmentPeriod & {
    course?: { id: string; courseCode: string; title: string };
  };
  invoice?: {
    id: string;
    invoiceCode: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
  } | null;
}

export interface Student extends StudentBasic {
  createdAt: string;
  registrations?: Registration[];
  _count?: { registrations: number };
}

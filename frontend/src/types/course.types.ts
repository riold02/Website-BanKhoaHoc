export interface Category {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    courses: number;
  };
}

export interface EnrollmentPeriodBasic {
  id: string;
  periodCode: string;
  name: string;
  tuitionFee: number;
  startRegistration: string;
  endRegistration: string;
  expectedStartDate?: string | null;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  maxCapacity: number;
  currentEnrolled: number;
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  description?: string | null;
  totalHours: number;
  standardPrice: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
  periods?: EnrollmentPeriodBasic[];
}

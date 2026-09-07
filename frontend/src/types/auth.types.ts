export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export interface Profile {
  id: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  idCardNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  educationLevel?: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  roleId: number;
  isActive: boolean;
  role: {
    id: number;
    name: UserRole;
    description?: string;
  };
  profile?: Profile | null;
  student?: StudentProfile | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

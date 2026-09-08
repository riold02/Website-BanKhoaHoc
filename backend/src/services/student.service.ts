import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class StudentService {
  async listStudents(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { studentCode: { contains: query.search } },
        { idCardNumber: { contains: query.search } },
        { user: { profile: { fullName: { contains: query.search } } } },
        { user: { email: { contains: query.search } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: {
              profile: true,
              role: true,
            },
          },
          _count: { select: { registrations: true } },
        },
      }),
    ]);

    return {
      students,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStudentById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true, role: true } },
        registrations: {
          orderBy: { registrationDate: 'desc' },
          include: {
            period: {
              include: {
                course: { select: { id: true, courseCode: true, title: true } },
              },
            },
            invoice: true,
          },
        },
      },
    });
    if (!student) throw new AppError('Học viên không tồn tại', 404, 'STUDENT_NOT_FOUND');
    return student;
  }

  async getStudentByUserId(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true, role: true } },
        registrations: {
          orderBy: { registrationDate: 'desc' },
          include: {
            period: {
              include: {
                course: { select: { id: true, courseCode: true, title: true } },
              },
            },
          },
        },
      },
    });
    if (!student) throw new AppError('Không tìm thấy hồ sơ học viên cho tài khoản này', 404, 'STUDENT_NOT_FOUND');
    return student;
  }

  async updateStudent(
    id: string,
    data: {
      idCardNumber?: string | null;
      birthDate?: string | null;
      gender?: string | null;
      educationLevel?: string | null;
    }
  ) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new AppError('Học viên không tồn tại', 404, 'STUDENT_NOT_FOUND');

    return prisma.student.update({
      where: { id },
      data: {
        ...(data.idCardNumber !== undefined ? { idCardNumber: data.idCardNumber } : {}),
        ...(data.birthDate !== undefined ? { birthDate: data.birthDate ? new Date(data.birthDate) : null } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.educationLevel !== undefined ? { educationLevel: data.educationLevel } : {}),
      },
      include: { user: { include: { profile: true } } },
    });
  }
}

export const studentService = new StudentService();

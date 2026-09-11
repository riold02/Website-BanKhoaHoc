import { prisma } from "../config/database";
import { AppError } from "../utils/response.util";

export class StudentService {
  async listStudents(query: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
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
        orderBy: { createdAt: "desc" },
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
          orderBy: { registrationDate: "desc" },
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
    if (!student)
      throw new AppError("Học viên không tồn tại", 404, "STUDENT_NOT_FOUND");
    return student;
  }

  async getStudentByUserId(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true, role: true } },
        registrations: {
          orderBy: { registrationDate: "desc" },
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
    if (!student)
      throw new AppError(
        "Không tìm thấy hồ sơ học viên cho tài khoản này",
        404,
        "STUDENT_NOT_FOUND",
      );
    return student;
  }

  async getMySchedule(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student)
      throw new AppError(
        "Không tìm thấy hồ sơ học viên cho tài khoản này",
        404,
        "STUDENT_NOT_FOUND",
      );

    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: student.id, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        class: {
          include: {
            period: { include: { course: true } },
            sessions: {
              where: { status: { not: "CANCELLED" } },
              orderBy: { sessionNumber: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      class: enrollment.class,
    }));
  }

  async getMyAttendance(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student)
      throw new AppError(
        "Không tìm thấy hồ sơ học viên cho tài khoản này",
        404,
        "STUDENT_NOT_FOUND",
      );

    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: student.id, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        attendances: true,
        class: {
          include: {
            period: { include: { course: true } },
            sessions: {
              where: { status: { not: "CANCELLED" } },
              orderBy: { sessionNumber: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrollments.map((enrollment) => {
      const attendanceMap = new Map(
        enrollment.attendances.map((attendance) => [
          attendance.sessionId,
          attendance,
        ]),
      );
      const sessions = enrollment.class.sessions || [];
      const attendanceRecords = sessions.map((session) => ({
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        sessionDate: session.sessionDate,
        topic: session.topic,
        sessionStatus: session.status,
        attendance: attendanceMap.get(session.id) || null,
      }));
      const absenceCount = attendanceRecords.filter(
        (record) => record.attendance?.status === "ABSENT",
      ).length;
      return {
        enrollmentId: enrollment.id,
        class: enrollment.class,
        sessions: attendanceRecords,
        summary: {
          totalSessions: sessions.length,
          recordedSessions: attendanceRecords.filter(
            (record) => record.attendance,
          ).length,
          absenceCount,
          absenceRate: sessions.length
            ? Math.round((absenceCount / sessions.length) * 10000) / 100
            : 0,
        },
      };
    });
  }

  async getMyGrades(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student)
      throw new AppError(
        "Không tìm thấy hồ sơ học viên cho tài khoản này",
        404,
        "STUDENT_NOT_FOUND",
      );

    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: student.id, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        class: {
          include: {
            period: { include: { course: true } },
            gradeComponents: { orderBy: { id: "asc" } },
          },
        },
        grades: {
          include: { component: true },
          orderBy: { component: { id: "asc" } },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      finalScore: enrollment.finalScore,
      academicResult: enrollment.academicResult,
      class: enrollment.class,
      grades: enrollment.class.gradeComponents.map((component) => {
        const grade = enrollment.grades.find(
          (item) => item.componentId === component.id,
        );
        return {
          componentId: component.id,
          name: component.name,
          weight: component.weight,
          score: grade?.score ?? null,
          feedback: grade?.feedback ?? null,
        };
      }),
    }));
  }

  async updateStudent(
    id: string,
    data: {
      idCardNumber?: string | null;
      birthDate?: string | null;
      gender?: string | null;
      educationLevel?: string | null;
    },
  ) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student)
      throw new AppError("Học viên không tồn tại", 404, "STUDENT_NOT_FOUND");

    return prisma.student.update({
      where: { id },
      data: {
        ...(data.idCardNumber !== undefined
          ? { idCardNumber: data.idCardNumber }
          : {}),
        ...(data.birthDate !== undefined
          ? { birthDate: data.birthDate ? new Date(data.birthDate) : null }
          : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.educationLevel !== undefined
          ? { educationLevel: data.educationLevel }
          : {}),
      },
      include: { user: { include: { profile: true } } },
    });
  }
}

export const studentService = new StudentService();

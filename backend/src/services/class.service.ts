import { prisma } from "../config/database";
import { AppError } from "../utils/response.util";

const classInclude = {
  period: { include: { course: true } },
  enrollments: {
    where: { status: "ACTIVE" },
    include: {
      student: { include: { user: { include: { profile: true } } } },
      registration: true,
      attendances: true,
    },
  },
  sessions: { orderBy: { sessionNumber: "asc" as const } },
};

export class ClassService {
  private roundScore(score: number) {
    return Math.round(score * 100) / 100;
  }

  async listClasses(periodId?: string) {
    return prisma.class.findMany({
      where: periodId ? { periodId } : undefined,
      orderBy: { createdAt: "desc" },
      include: classInclude,
    });
  }

  async getClassById(id: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id },
      include: classInclude,
    });
    if (!classRecord)
      throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");
    return classRecord;
  }

  async removeStudent(classId: string, enrollmentId: string) {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: { id: enrollmentId, classId, status: "ACTIVE" },
    });
    if (!enrollment)
      throw new AppError(
        "Học viên không thuộc lớp hoặc đã được xóa khỏi lớp",
        404,
        "ENROLLMENT_NOT_FOUND",
      );

    await prisma.classEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "DROPPED" },
    });
    return this.getClassById(classId);
  }

  async deleteClass(classId: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classRecord)
      throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");

    const [enrollmentCount, sessionCount, componentCount] = await Promise.all([
      prisma.classEnrollment.count({ where: { classId } }),
      prisma.classSession.count({ where: { classId } }),
      prisma.gradeComponent.count({ where: { classId } }),
    ]);
    if (enrollmentCount || sessionCount || componentCount) {
      throw new AppError(
        "Không thể xóa lớp đã có học viên, lịch học hoặc cấu hình đầu điểm. Hãy xóa dữ liệu liên quan trước.",
        409,
        "CLASS_NOT_EMPTY",
        { enrollmentCount, sessionCount, componentCount },
      );
    }

    await prisma.class.delete({ where: { id: classId } });
    return { id: classId };
  }

  async listSessions(classId: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classRecord)
      throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");
    return prisma.classSession.findMany({
      where: { classId },
      orderBy: { sessionNumber: "asc" },
      include: { attendances: true },
    });
  }

  async createClass(data: {
    periodId: string;
    classCode: string;
    name: string;
    room?: string | null;
    scheduleDescription?: string | null;
    maxStudents?: number;
    teacherId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    allocate?: boolean;
  }) {
    const period = await prisma.enrollmentPeriod.findUnique({
      where: { id: data.periodId },
    });
    if (!period)
      throw new AppError(
        "Đợt tuyển sinh không tồn tại",
        404,
        "PERIOD_NOT_FOUND",
      );

    const classRecord = await prisma.class.create({
      data: {
        periodId: data.periodId,
        classCode: data.classCode,
        name: data.name,
        room: data.room || null,
        scheduleDescription: data.scheduleDescription || null,
        maxStudents: data.maxStudents || 30,
        teacherId: data.teacherId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    if (data.allocate) return this.allocateStudents(classRecord.id);
    return this.getClassById(classRecord.id);
  }

  async allocateStudents(classId: string, registrationIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      const classRecord = await tx.class.findUnique({ where: { id: classId } });
      if (!classRecord)
        throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");

      const activeCount = await tx.classEnrollment.count({
        where: { classId, status: "ACTIVE" },
      });
      const remainingCapacity = classRecord.maxStudents - activeCount;
      if (remainingCapacity <= 0)
        throw new AppError("Lớp học đã đủ sĩ số", 400, "CLASS_CAPACITY_FULL");

      const registrations = await tx.registration.findMany({
        where: {
          periodId: classRecord.periodId,
          status: "APPROVED",
          invoice: { paymentStatus: "PAID" },
          ...(registrationIds ? { id: { in: registrationIds } } : {}),
        },
        include: { enrollments: { where: { status: "ACTIVE" } } },
        orderBy: { registrationDate: "asc" },
      });

      if (registrationIds && registrations.length !== registrationIds.length) {
        const foundIds = new Set(
          registrations.map((registration) => registration.id),
        );
        const invalidIds = registrationIds.filter((id) => !foundIds.has(id));
        throw new AppError(
          "Một hoặc nhiều đơn chưa được duyệt, chưa thanh toán đủ hoặc không thuộc đợt của lớp",
          400,
          "REGISTRATION_NOT_ELIGIBLE",
          { registrationIds: invalidIds },
        );
      }

      const eligibleRegistrations = registrations.filter(
        (registration) => registration.enrollments.length === 0,
      );
      if (eligibleRegistrations.length === 0) {
        throw new AppError(
          "Không có học viên đủ điều kiện để phân bổ",
          400,
          "NO_ELIGIBLE_REGISTRATIONS",
        );
      }
      if (eligibleRegistrations.length > remainingCapacity) {
        throw new AppError(
          "Số học viên cần phân bổ vượt quá sĩ số còn lại của lớp",
          400,
          "CLASS_CAPACITY_EXCEEDED",
          {
            remainingCapacity,
            requested: eligibleRegistrations.length,
          },
        );
      }

      const existingEnrollments = await tx.classEnrollment.findMany({
        where: {
          classId,
          studentId: {
            in: eligibleRegistrations.map(
              (registration) => registration.studentId,
            ),
          },
        },
        select: { id: true, studentId: true, status: true },
      });
      const existingByStudentId = new Map(
        existingEnrollments.map((enrollment) => [
          enrollment.studentId,
          enrollment,
        ]),
      );
      const newRegistrations = [];

      for (const registration of eligibleRegistrations) {
        const existingEnrollment = existingByStudentId.get(
          registration.studentId,
        );
        if (existingEnrollment) {
          await tx.classEnrollment.update({
            where: { id: existingEnrollment.id },
            data: { status: "ACTIVE", registrationId: registration.id },
          });
        } else {
          newRegistrations.push({
            classId,
            studentId: registration.studentId,
            registrationId: registration.id,
          });
        }
      }

      if (newRegistrations.length > 0) {
        await tx.classEnrollment.createMany({ data: newRegistrations });
      }

      return tx.class.findUnique({
        where: { id: classId },
        include: classInclude,
      });
    });
  }

  async generateSessions(data: {
    classId: string;
    weekdays: number[];
    sessionCount: number;
    startDate?: string;
    topicPrefix?: string | null;
  }) {
    const classRecord = await prisma.class.findUnique({
      where: { id: data.classId },
      include: {
        period: true,
        sessions: { orderBy: { sessionNumber: "asc" } },
      },
    });
    if (!classRecord)
      throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");
    if (classRecord.sessions.length > 0)
      throw new AppError(
        "Lớp học đã có lịch buổi học",
        409,
        "SESSIONS_ALREADY_EXIST",
      );

    const firstDate = data.startDate
      ? new Date(data.startDate)
      : classRecord.startDate || classRecord.period.expectedStartDate;
    if (!firstDate || Number.isNaN(firstDate.getTime()))
      throw new AppError(
        "Cần cung cấp ngày bắt đầu lớp để sinh lịch",
        400,
        "START_DATE_REQUIRED",
      );

    const weekdays = [...new Set(data.weekdays)];
    const sessionDates: Date[] = [];
    const cursor = new Date(firstDate);
    cursor.setHours(0, 0, 0, 0);
    while (sessionDates.length < data.sessionCount) {
      const weekday = cursor.getDay() === 0 ? 7 : cursor.getDay();
      if (weekdays.includes(weekday)) sessionDates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    if (
      classRecord.endDate &&
      sessionDates[sessionDates.length - 1] > classRecord.endDate
    )
      throw new AppError(
        "Số buổi học vượt quá ngày kết thúc của lớp",
        400,
        "SESSION_DATE_OUT_OF_RANGE",
      );

    await prisma.classSession.createMany({
      data: sessionDates.map((sessionDate, index) => ({
        classId: data.classId,
        sessionNumber: index + 1,
        sessionDate,
        topic: data.topicPrefix ? `${data.topicPrefix} ${index + 1}` : null,
      })),
    });
    return prisma.classSession.findMany({
      where: { classId: data.classId },
      orderBy: { sessionNumber: "asc" },
    });
  }

  async saveAttendance(data: {
    classId: string;
    sessionId: string;
    attendances: Array<{
      enrollmentId: string;
      status: string;
      note?: string | null;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.classSession.findFirst({
        where: { id: data.sessionId, classId: data.classId },
      });
      if (!session)
        throw new AppError(
          "Buổi học không tồn tại trong lớp",
          404,
          "SESSION_NOT_FOUND",
        );
      if (session.status === "CANCELLED")
        throw new AppError(
          "Không thể điểm danh buổi học đã hủy",
          400,
          "SESSION_CANCELLED",
        );

      const enrollmentIds = data.attendances.map(
        (attendance) => attendance.enrollmentId,
      );
      if (new Set(enrollmentIds).size !== enrollmentIds.length)
        throw new AppError(
          "Không được gửi trùng học viên trong cùng buổi",
          400,
          "DUPLICATE_ATTENDANCE",
        );

      const enrollments = await tx.classEnrollment.findMany({
        where: {
          classId: data.classId,
          id: { in: enrollmentIds },
          status: "ACTIVE",
        },
        select: { id: true },
      });
      if (enrollments.length !== enrollmentIds.length)
        throw new AppError(
          "Có học viên không thuộc lớp hoặc đã ngừng học",
          400,
          "INVALID_ENROLLMENT",
        );

      await Promise.all(
        data.attendances.map((attendance) =>
          tx.attendance.upsert({
            where: {
              sessionId_enrollmentId: {
                sessionId: data.sessionId,
                enrollmentId: attendance.enrollmentId,
              },
            },
            create: {
              sessionId: data.sessionId,
              enrollmentId: attendance.enrollmentId,
              status: attendance.status,
              note: attendance.note || null,
            },
            update: {
              status: attendance.status,
              note: attendance.note || null,
              recordedAt: new Date(),
            },
          }),
        ),
      );
      await tx.classSession.update({
        where: { id: data.sessionId },
        data: { status: "COMPLETED" },
      });
      return tx.attendance.findMany({
        where: { sessionId: data.sessionId },
        include: { enrollment: { include: { student: true } } },
        orderBy: { recordedAt: "asc" },
      });
    });
  }

  async configureGradeComponents(
    classId: string,
    components: Array<{ id?: string; name: string; weight: number }>,
  ) {
    const totalWeight = components.reduce(
      (sum, component) => sum + component.weight,
      0,
    );
    if (Math.abs(totalWeight - 1) > 0.0001)
      throw new AppError(
        "Tổng tỷ trọng các đầu điểm phải bằng 1.0",
        400,
        "INVALID_GRADE_WEIGHTS",
        { totalWeight },
      );
    if (
      new Set(
        components.map((component) => component.name.trim().toLowerCase()),
      ).size !== components.length
    )
      throw new AppError(
        "Tên đầu điểm không được trùng nhau",
        400,
        "DUPLICATE_GRADE_COMPONENT",
      );

    return prisma.$transaction(async (tx) => {
      const classRecord = await tx.class.findUnique({
        where: { id: classId },
        include: { gradeComponents: { include: { grades: true } } },
      });
      if (!classRecord)
        throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");
      const hasGrades = classRecord.gradeComponents.some(
        (component) => component.grades.length > 0,
      );

      if (!hasGrades) {
        await tx.gradeComponent.deleteMany({ where: { classId } });
        await tx.gradeComponent.createMany({
          data: components.map((component) => ({
            classId,
            name: component.name.trim(),
            weight: component.weight,
          })),
        });
      } else {
        const existingIds = new Set(
          classRecord.gradeComponents.map((component) => component.id),
        );
        if (
          components.length !== classRecord.gradeComponents.length ||
          components.some(
            (component) => !component.id || !existingIds.has(component.id),
          )
        )
          throw new AppError(
            "Không thể thêm hoặc xóa đầu điểm sau khi đã nhập điểm",
            400,
            "GRADE_COMPONENTS_LOCKED",
          );
        await Promise.all(
          components.map((component) =>
            tx.gradeComponent.update({
              where: { id: component.id },
              data: { name: component.name.trim(), weight: component.weight },
            }),
          ),
        );
      }
      return tx.gradeComponent.findMany({
        where: { classId },
        orderBy: { id: "asc" },
      });
    });
  }

  async getGradebook(classId: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        gradeComponents: { orderBy: { id: "asc" } },
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            student: { include: { user: { include: { profile: true } } } },
            grades: true,
          },
        },
      },
    });
    if (!classRecord)
      throw new AppError("Lớp học không tồn tại", 404, "CLASS_NOT_FOUND");
    return classRecord;
  }

  async saveGrades(
    classId: string,
    enrollmentId: string,
    grades: Array<{
      componentId: string;
      score: number;
      feedback?: string | null;
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.classEnrollment.findFirst({
        where: { id: enrollmentId, classId, status: "ACTIVE" },
      });
      if (!enrollment)
        throw new AppError(
          "Học viên không thuộc lớp hoặc đã ngừng học",
          404,
          "ENROLLMENT_NOT_FOUND",
        );
      const components = await tx.gradeComponent.findMany({
        where: { classId },
      });
      const componentIds = new Set(components.map((component) => component.id));
      if (grades.some((grade) => !componentIds.has(grade.componentId)))
        throw new AppError(
          "Có đầu điểm không thuộc lớp này",
          400,
          "INVALID_GRADE_COMPONENT",
        );
      if (
        new Set(grades.map((grade) => grade.componentId)).size !== grades.length
      )
        throw new AppError(
          "Không được nhập trùng đầu điểm",
          400,
          "DUPLICATE_GRADE_COMPONENT",
        );

      await Promise.all(
        grades.map((grade) =>
          tx.grade.upsert({
            where: {
              componentId_enrollmentId: {
                componentId: grade.componentId,
                enrollmentId,
              },
            },
            create: {
              componentId: grade.componentId,
              enrollmentId,
              score: grade.score,
              feedback: grade.feedback || null,
            },
            update: { score: grade.score, feedback: grade.feedback || null },
          }),
        ),
      );
      return this.calculateResultWithTransaction(tx, classId, enrollmentId);
    });
  }

  private async calculateResultWithTransaction(
    tx: any,
    classId: string,
    enrollmentId: string,
  ) {
    const enrollment = await tx.classEnrollment.findFirst({
      where: { id: enrollmentId, classId },
      include: { grades: { include: { component: true } }, attendances: true },
    });
    if (!enrollment)
      throw new AppError(
        "Học viên không thuộc lớp",
        404,
        "ENROLLMENT_NOT_FOUND",
      );
    const sessionsCount = await tx.classSession.count({
      where: { classId, status: { not: "CANCELLED" } },
    });
    const absenceCount = enrollment.attendances.filter(
      (attendance: { status: string }) => attendance.status === "ABSENT",
    ).length;
    const absenceRate = sessionsCount === 0 ? 0 : absenceCount / sessionsCount;
    const hasAllGrades =
      enrollment.grades.length ===
      (await tx.gradeComponent.count({ where: { classId } }));
    if (!hasAllGrades) {
      await tx.classEnrollment.update({
        where: { id: enrollmentId },
        data: { finalScore: null, academicResult: null },
      });
      return {
        enrollmentId,
        finalScore: null,
        academicResult: null,
        absenceCount,
        sessionsCount,
        absenceRate: this.roundScore(absenceRate * 100),
      };
    }
    const finalComponent =
      enrollment.grades.find((grade: { component: { name: string } }) =>
        /cuối kỳ|cuoi ky|final/i.test(grade.component.name),
      ) || enrollment.grades[enrollment.grades.length - 1];
    const finalScore = finalComponent?.score ?? null;
    const score =
      enrollment.grades.length === 0
        ? null
        : this.roundScore(
            enrollment.grades.reduce(
              (
                sum: number,
                grade: { score: number; component: { weight: number } },
              ) => sum + grade.score * grade.component.weight,
              0,
            ),
          );
    const academicResult =
      score === null
        ? null
        : absenceRate > 0.2 || (finalScore !== null && finalScore < 4)
          ? "FAIL"
          : score >= 8.5
            ? "DISTINCTION"
            : score >= 5
              ? "PASS"
              : "FAIL";
    await tx.classEnrollment.update({
      where: { id: enrollmentId },
      data: { finalScore: score, academicResult },
    });
    return {
      enrollmentId,
      finalScore: score,
      academicResult,
      absenceCount,
      sessionsCount,
      absenceRate: this.roundScore(absenceRate * 100),
    };
  }

  async calculateResults(classId: string, enrollmentId?: string) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId,
        status: "ACTIVE",
        ...(enrollmentId ? { id: enrollmentId } : {}),
      },
      select: { id: true },
    });
    if (enrollments.length === 0)
      throw new AppError(
        "Không tìm thấy học viên trong lớp",
        404,
        "ENROLLMENT_NOT_FOUND",
      );
    return prisma.$transaction(async (tx) =>
      Promise.all(
        enrollments.map((enrollment) =>
          this.calculateResultWithTransaction(tx, classId, enrollment.id),
        ),
      ),
    );
  }
}

export const classService = new ClassService();

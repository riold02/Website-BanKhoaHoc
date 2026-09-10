import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class RegistrationService {
  async listRegistrations(query: {
    status?: string;
    periodId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
    // Nếu là student, chỉ xem đơn của mình
    requestingStudentId?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.requestingStudentId) where.studentId = query.requestingStudentId;
    if (query.status) where.status = query.status;
    if (query.periodId) where.periodId = query.periodId;
    if (query.studentId) where.studentId = query.studentId;

    const [total, registrations] = await Promise.all([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { registrationDate: 'desc' },
        include: {
          student: {
            include: {
              user: { include: { profile: true } },
            },
          },
          period: {
            include: {
              course: { select: { id: true, courseCode: true, title: true } },
            },
          },
        },
      }),
    ]);

    return {
      registrations,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRegistrationById(id: string) {
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: {
        student: { include: { user: { include: { profile: true } } } },
        period: { include: { course: { include: { category: true } } } },
        invoice: true,
      },
    });
    if (!reg) throw new AppError('Phiếu đăng ký không tồn tại', 404, 'REGISTRATION_NOT_FOUND');
    return reg;
  }

  async createRegistration(data: { studentId: string; periodId: string; note?: string | null }) {
    // Kiểm tra đợt tuyển sinh tồn tại và đang mở
    const period = await prisma.enrollmentPeriod.findUnique({ where: { id: data.periodId } });
    if (!period) throw new AppError('Đợt tuyển sinh không tồn tại', 404, 'PERIOD_NOT_FOUND');
    if (period.status !== 'OPEN') throw new AppError('Đợt tuyển sinh không ở trạng thái nhận đơn', 400, 'PERIOD_NOT_OPEN');

    // Kiểm tra sĩ số
    if (period.currentEnrolled >= period.maxCapacity) {
      throw new AppError('Đợt tuyển sinh đã đủ chỉ tiêu', 400, 'PERIOD_FULL');
    }

    // Kiểm tra học viên tồn tại
    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) throw new AppError('Học viên không tồn tại', 404, 'STUDENT_NOT_FOUND');

    // Kiểm tra chưa đăng ký đợt này
    const existed = await prisma.registration.findFirst({
      where: {
        studentId: data.studentId,
        periodId: data.periodId,
        status: { not: 'CANCELLED' },
      },
    });
    if (existed) throw new AppError('Học viên đã có đơn đăng ký cho đợt này', 409, 'DUPLICATE_REGISTRATION');

    // Tạo mã đơn đăng ký
    const registrationCode = `REG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return prisma.registration.create({
      data: {
        registrationCode,
        studentId: data.studentId,
        periodId: data.periodId,
        note: data.note || null,
        status: 'PENDING',
      },
      include: {
        student: { include: { user: { include: { profile: true } } } },
        period: { include: { course: { select: { id: true, courseCode: true, title: true } } } },
      },
    });
  }

  async reviewRegistration(id: string, reviewerId: string, status: 'APPROVED' | 'REJECTED', note?: string | null) {
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) throw new AppError('Phiếu đăng ký không tồn tại', 404, 'REGISTRATION_NOT_FOUND');
    if (reg.status !== 'PENDING') throw new AppError('Chỉ có thể xét duyệt phiếu đang ở trạng thái PENDING', 400, 'INVALID_STATUS');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({
        where: { id },
        data: {
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          ...(note !== undefined ? { note } : {}),
        },
        include: {
          student: { include: { user: { include: { profile: true } } } },
          period: true,
        },
      });

      // Nếu APPROVED: tăng số học viên đã đăng ký của đợt và tạo hóa đơn học phí
      if (status === 'APPROVED') {
        const period = await tx.enrollmentPeriod.findUnique({ where: { id: reg.periodId } });
        if (period && period.currentEnrolled >= period.maxCapacity) {
          throw new AppError('Đợt tuyển sinh đã đủ chỉ tiêu, không thể duyệt thêm', 400, 'PERIOD_FULL');
        }

        await tx.enrollmentPeriod.update({
          where: { id: reg.periodId },
          data: { currentEnrolled: { increment: 1 } },
        });

        const existingInvoice = await tx.tuitionInvoice.findUnique({
          where: { registrationId: reg.id },
        });

        if (!existingInvoice) {
          const invoiceCode = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);

          await tx.tuitionInvoice.create({
            data: {
              invoiceCode,
              registrationId: reg.id,
              totalAmount: period?.tuitionFee ?? 0,
              paidAmount: 0,
              discountAmount: 0,
              paymentStatus: 'UNPAID',
              dueDate,
            },
          });
        }
      }

      return updated;
    });
  }

  async cancelRegistration(id: string, requestingUserId: string, isAdmin: boolean) {
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!reg) throw new AppError('Phiếu đăng ký không tồn tại', 404, 'REGISTRATION_NOT_FOUND');

    // Học viên chỉ hủy được đơn của mình và khi còn PENDING
    if (!isAdmin && reg.student.userId !== requestingUserId) {
      throw new AppError('Không có quyền hủy đơn đăng ký này', 403, 'FORBIDDEN');
    }
    if (reg.status === 'CANCELLED') throw new AppError('Đơn đăng ký đã bị hủy rồi', 400, 'ALREADY_CANCELLED');
    if (!isAdmin && reg.status !== 'PENDING') {
      throw new AppError('Chỉ có thể hủy đơn đang ở trạng thái chờ duyệt', 400, 'CANNOT_CANCEL');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Nếu đơn đã APPROVED thì giảm currentEnrolled
      if (reg.status === 'APPROVED') {
        await tx.enrollmentPeriod.update({
          where: { id: reg.periodId },
          data: { currentEnrolled: { decrement: 1 } },
        });
      }

      return updated;
    });
  }
}

export const registrationService = new RegistrationService();

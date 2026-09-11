import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class EnrollmentPeriodService {
  async listPeriods(query: {
    courseId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.courseId) where.courseId = query.courseId;
    if (query.status) where.status = query.status;
    // Server-side search: tìm theo tên đợt, mã đợt hoặc tên khóa học
    if (query.search && query.search.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { name:       { contains: keyword, mode: 'insensitive' } },
        { periodCode: { contains: keyword, mode: 'insensitive' } },
        { course: { title: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [total, periods] = await Promise.all([
      prisma.enrollmentPeriod.count({ where }),
      prisma.enrollmentPeriod.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startRegistration: 'desc' },
        include: {
          course: { select: { id: true, courseCode: true, title: true, category: true } },
          _count: { select: { registrations: true } },
        },
      }),
    ]);

    return {
      periods,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPeriodById(id: string) {
    const period = await prisma.enrollmentPeriod.findUnique({
      where: { id },
      include: {
        course: { include: { category: true } },
        _count: { select: { registrations: true, classes: true } },
      },
    });
    if (!period) throw new AppError('Đợt tuyển sinh không tồn tại', 404, 'PERIOD_NOT_FOUND');
    return period;
  }

  async createPeriod(data: {
    courseId: string;
    periodCode: string;
    name: string;
    startRegistration: string;
    endRegistration: string;
    expectedStartDate?: string | null;
    tuitionFee: number;
    minCapacity?: number;
    maxCapacity: number;
  }) {
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new AppError('Khóa học không tồn tại', 404, 'COURSE_NOT_FOUND');
    if (!course.isActive) throw new AppError('Khóa học đã ngưng hoạt động', 400, 'COURSE_INACTIVE');

    const existing = await prisma.enrollmentPeriod.findUnique({ where: { periodCode: data.periodCode } });
    if (existing) throw new AppError(`Mã đợt '${data.periodCode}' đã tồn tại`, 409, 'PERIOD_CODE_EXISTS');

    const start = new Date(data.startRegistration);
    const end = new Date(data.endRegistration);
    if (end <= start) throw new AppError('Ngày kết thúc đăng ký phải sau ngày bắt đầu', 400, 'INVALID_DATE_RANGE');

    const minCap = data.minCapacity ?? 5;
    if (minCap >= data.maxCapacity) {
      throw new AppError(
        `Sĩ số tối thiểu (${minCap}) phải nhỏ hơn sĩ số tối đa (${data.maxCapacity})`,
        400,
        'INVALID_CAPACITY_RANGE',
      );
    }

    return prisma.enrollmentPeriod.create({
      data: {
        courseId: data.courseId,
        periodCode: data.periodCode,
        name: data.name,
        startRegistration: start,
        endRegistration: end,
        expectedStartDate: data.expectedStartDate ? new Date(data.expectedStartDate) : null,
        tuitionFee: data.tuitionFee,
        minCapacity: minCap,
        maxCapacity: data.maxCapacity,
        status: 'UPCOMING',
      },
      include: { course: { select: { id: true, courseCode: true, title: true } } },
    });
  }

  async updatePeriod(
    id: string,
    data: {
      name?: string;
      startRegistration?: string;
      endRegistration?: string;
      expectedStartDate?: string | null;
      tuitionFee?: number;
      minCapacity?: number;
      maxCapacity?: number;
    }
  ) {
    const period = await prisma.enrollmentPeriod.findUnique({ where: { id } });
    if (!period) throw new AppError('Đợt tuyển sinh không tồn tại', 404, 'PERIOD_NOT_FOUND');
    if (period.status === 'CANCELLED') throw new AppError('Không thể chỉnh sửa đợt đã hủy', 400, 'PERIOD_CANCELLED');

    if (data.maxCapacity && data.maxCapacity < period.currentEnrolled) {
      throw new AppError(
        `Sĩ số tối đa không thể nhỏ hơn số học viên đã đăng ký (${period.currentEnrolled})`,
        400,
        'CAPACITY_TOO_LOW'
      );
    }

    // Validate minCapacity < maxCapacity
    const newMin = data.minCapacity ?? period.minCapacity;
    const newMax = data.maxCapacity ?? period.maxCapacity;
    if (newMin >= newMax) {
      throw new AppError(
        `Sĩ số tối thiểu (${newMin}) phải nhỏ hơn sĩ số tối đa (${newMax})`,
        400,
        'INVALID_CAPACITY_RANGE',
      );
    }

    // Validate date range: lấy giá trị hiện tại làm fallback nếu chỉ update 1 trong 2
    const newStart = data.startRegistration ? new Date(data.startRegistration) : period.startRegistration;
    const newEnd   = data.endRegistration   ? new Date(data.endRegistration)   : period.endRegistration;
    if (newEnd <= newStart) {
      throw new AppError(
        'Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký',
        400,
        'INVALID_DATE_RANGE',
        { startRegistration: newStart, endRegistration: newEnd },
      );
    }

    return prisma.enrollmentPeriod.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.startRegistration ? { startRegistration: new Date(data.startRegistration) } : {}),
        ...(data.endRegistration ? { endRegistration: new Date(data.endRegistration) } : {}),
        ...(data.expectedStartDate !== undefined
          ? { expectedStartDate: data.expectedStartDate ? new Date(data.expectedStartDate) : null }
          : {}),
        ...(data.tuitionFee !== undefined ? { tuitionFee: data.tuitionFee } : {}),
        ...(data.minCapacity !== undefined ? { minCapacity: data.minCapacity } : {}),
        ...(data.maxCapacity !== undefined ? { maxCapacity: data.maxCapacity } : {}),
      },
      include: { course: { select: { id: true, courseCode: true, title: true } } },
    });
  }


  async updatePeriodStatus(id: string, status: string) {
    const period = await prisma.enrollmentPeriod.findUnique({ where: { id } });
    if (!period) throw new AppError('Đợt tuyển sinh không tồn tại', 404, 'PERIOD_NOT_FOUND');
    if (period.status === 'CANCELLED') throw new AppError('Đợt tuyển sinh đã bị hủy, không thể thay đổi trạng thái', 400, 'PERIOD_CANCELLED');

    // State machine: chỉ cho phép các chuyển trạng thái hợp lệ
    const VALID_TRANSITIONS: Record<string, string[]> = {
      UPCOMING: ['OPEN', 'CANCELLED'],
      OPEN:     ['CLOSED', 'CANCELLED'],
      CLOSED:   [],
    };

    const allowedNextStatuses = VALID_TRANSITIONS[period.status] ?? [];
    if (!allowedNextStatuses.includes(status)) {
      throw new AppError(
        `Không thể chuyển từ trạng thái '${period.status}' sang '${status}'. Trạng thái hợp lệ tiếp theo: [${allowedNextStatuses.join(', ') || 'Không có'}]`,
        400,
        'INVALID_STATUS_TRANSITION',
        { current: period.status, requested: status, allowed: allowedNextStatuses },
      );
    }

    return prisma.enrollmentPeriod.update({
      where: { id },
      data: { status },
    });
  }
}

export const enrollmentPeriodService = new EnrollmentPeriodService();

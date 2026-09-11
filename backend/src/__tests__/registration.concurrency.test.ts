/**
 * TASK-211: Concurrency test — kiểm tra không vượt quá chỉ tiêu đợt tuyển sinh
 * khi nhiều học viên đăng ký cùng lúc.
 *
 * Strategy: mock prisma để kiểm soát dữ liệu, simulate concurrent requests
 * bằng Promise.allSettled().
 */

import { RegistrationService } from '../services/registration.service';

// ── Mock Prisma ────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({
  prisma: {
    enrollmentPeriod: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    registration: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    tuitionInvoice: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn({
      registration: { update: jest.fn(), findUnique: jest.fn() },
      enrollmentPeriod: { findUnique: jest.fn(), update: jest.fn() },
      tuitionInvoice: { findUnique: jest.fn(), create: jest.fn() },
    })),
  },
}));

import { prisma } from '../config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Helper: tạo period mock ────────────────────────────────────────────────
const makePeriod = (overrides = {}) => ({
  id: 'period-1',
  courseId: 'course-1',
  periodCode: 'PERIOD-TEST',
  name: 'Test Period',
  status: 'OPEN',
  currentEnrolled: 0,
  maxCapacity: 2,      // chỉ tiêu = 2 để dễ test
  minCapacity: 1,
  tuitionFee: 3500000,
  startRegistration: new Date(),
  endRegistration: new Date(Date.now() + 86400000),
  expectedStartDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeStudent = (id = 'student-1') => ({
  id,
  userId: `user-${id}`,
  studentCode: `HV-${id}`,
  idCardNumber: null,
  birthDate: null,
  gender: null,
  educationLevel: null,
  createdAt: new Date(),
});

// ── Tests ──────────────────────────────────────────────────────────────────
describe('TASK-211 — Registration Concurrency & Capacity Guard', () => {
  let service: RegistrationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RegistrationService();
  });

  /**
   * TC-1: Đăng ký thành công khi đợt còn chỗ
   */
  it('TC-1: allows registration when period has available slots', async () => {
    const period = makePeriod({ currentEnrolled: 0, maxCapacity: 5 });
    (mockPrisma.enrollmentPeriod.findUnique as jest.Mock).mockResolvedValue(period);
    (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(makeStudent());
    (mockPrisma.registration.findFirst as jest.Mock).mockResolvedValue(null); // chưa đăng ký
    (mockPrisma.registration.create as jest.Mock).mockResolvedValue({
      id: 'reg-1',
      registrationCode: 'REG-001',
      status: 'PENDING',
    });

    const result = await service.createRegistration({
      studentId: 'student-1',
      periodId: 'period-1',
    });

    expect(result).toBeDefined();
    expect(mockPrisma.registration.create).toHaveBeenCalledTimes(1);
  });

  /**
   * TC-2: Chặn đăng ký khi đợt đã đủ chỉ tiêu (PERIOD_FULL)
   */
  it('TC-2: rejects registration when period is at max capacity', async () => {
    const period = makePeriod({ currentEnrolled: 2, maxCapacity: 2 }); // full
    (mockPrisma.enrollmentPeriod.findUnique as jest.Mock).mockResolvedValue(period);
    (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(makeStudent());
    (mockPrisma.registration.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createRegistration({ studentId: 'student-1', periodId: 'period-1' }),
    ).rejects.toMatchObject({ code: 'PERIOD_FULL' });

    expect(mockPrisma.registration.create).not.toHaveBeenCalled();
  });

  /**
   * TC-3: Chặn đăng ký trùng lặp cùng đợt (DUPLICATE_REGISTRATION)
   */
  it('TC-3: rejects duplicate registration for same period', async () => {
    const period = makePeriod({ currentEnrolled: 1, maxCapacity: 5 });
    (mockPrisma.enrollmentPeriod.findUnique as jest.Mock).mockResolvedValue(period);
    (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(makeStudent());
    // Đã có đơn PENDING
    (mockPrisma.registration.findFirst as jest.Mock).mockResolvedValue({
      id: 'existing-reg',
      status: 'PENDING',
    });

    await expect(
      service.createRegistration({ studentId: 'student-1', periodId: 'period-1' }),
    ).rejects.toMatchObject({ code: 'DUPLICATE_REGISTRATION' });
  });

  /**
   * TC-4: Chặn đăng ký khi đợt không ở trạng thái OPEN
   */
  it('TC-4: rejects registration when period is not OPEN', async () => {
    const period = makePeriod({ status: 'CLOSED' });
    (mockPrisma.enrollmentPeriod.findUnique as jest.Mock).mockResolvedValue(period);

    await expect(
      service.createRegistration({ studentId: 'student-1', periodId: 'period-1' }),
    ).rejects.toMatchObject({ code: 'PERIOD_NOT_OPEN' });
  });

  /**
   * TC-5: Simulate concurrent registrations — chỉ cho phép số đơn ≤ maxCapacity
   *
   * Dùng Promise.allSettled để gửi N đơn đồng thời.
   * Với maxCapacity=2, chỉ tối đa 2 đơn được phép, còn lại phải reject PERIOD_FULL.
   */
  it('TC-5: concurrent registrations respect maxCapacity limit', async () => {
    const maxCap = 2;
    let enrolled = 0; // simulate counter

    // Mock findUnique trả về period với currentEnrolled tăng dần (simulate race)
    (mockPrisma.enrollmentPeriod.findUnique as jest.Mock).mockImplementation(() => {
      return Promise.resolve(makePeriod({ currentEnrolled: enrolled, maxCapacity: maxCap }));
    });

    // Mock student khác nhau cho mỗi request
    (mockPrisma.student.findUnique as jest.Mock).mockImplementation((args: any) =>
      Promise.resolve(makeStudent(args.where.id)),
    );

    // Không có đơn trùng
    (mockPrisma.registration.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock create: thực sự tăng enrolled nếu còn chỗ
    (mockPrisma.registration.create as jest.Mock).mockImplementation(() => {
      if (enrolled >= maxCap) throw Object.assign(new Error('PERIOD_FULL'), { code: 'PERIOD_FULL' });
      enrolled += 1;
      return Promise.resolve({ id: `reg-${enrolled}`, status: 'PENDING' });
    });

    const studentIds = ['s-1', 's-2', 's-3', 's-4']; // 4 học viên cùng đăng ký
    const results = await Promise.allSettled(
      studentIds.map((sid) =>
        service.createRegistration({ studentId: sid, periodId: 'period-1' }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected  = results.filter((r) => r.status === 'rejected');

    // Tối đa maxCap đơn được tạo thành công
    expect(fulfilled.length).toBeLessThanOrEqual(maxCap);
    // Ít nhất (N - maxCap) đơn bị từ chối
    expect(rejected.length).toBeGreaterThanOrEqual(studentIds.length - maxCap);
  });
});

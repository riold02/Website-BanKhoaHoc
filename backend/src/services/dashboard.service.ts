import { prisma } from '../config/database';

export class DashboardService {
  async getOverview() {
    const [
      totalCourses,
      totalUsers,
      totalStudents,
      totalRegistrations,
      approvedRegistrations,
      paidInvoices,
      paymentTransactions,
      openPeriods,
      courseStudentCounts,
      tuitionBreakdownData,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'APPROVED' } }),
      prisma.tuitionInvoice.count({ where: { paymentStatus: 'PAID' } }),
      prisma.paymentTransaction.findMany({
        select: {
          amount: true,
          paymentDate: true,
        },
      }),
      prisma.enrollmentPeriod.count({ where: { status: 'OPEN' } }),
      prisma.enrollmentPeriod.findMany({
        select: {
          course: {
            select: {
              title: true,
            },
          },
          _count: {
            select: { registrations: true },
          },
        },
      }),
      prisma.tuitionInvoice.groupBy({
        by: ['paymentStatus'],
        _count: {
          paymentStatus: true,
        },
      }),
    ]);

    const monthMap = new Map<string, number>();
    for (const transaction of paymentTransactions) {
      const date = new Date(transaction.paymentDate);
      if (Number.isNaN(date.getTime())) continue;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(key) ?? 0;
      monthMap.set(key, current + Number(transaction.amount || 0));
    }

    const revenueByMonth = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue,
      }));

    const totalRevenue = paymentTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const conversionRate = totalRegistrations > 0 ? (approvedRegistrations / totalRegistrations) * 100 : 0;
    const paymentLabelMap: Record<string, string> = {
      PAID: 'Đã thanh toán',
      PARTIAL: 'Thanh toán một phần',
      UNPAID: 'Chưa thanh toán',
    };

    const tuitionBreakdown = (['PAID', 'PARTIAL', 'UNPAID'] as const)
      .map((status) => {
        const match = tuitionBreakdownData.find((item) => item.paymentStatus === status);
        return {
          name: paymentLabelMap[status],
          value: match?._count.paymentStatus ?? 0,
          status,
        };
      })
      .filter((item) => item.value > 0 || item.status === 'UNPAID');

    const courseStudentMap = new Map<string, number>();
    for (const courseEntry of courseStudentCounts) {
      const name = courseEntry.course?.title || 'Khóa chưa đặt tên';
      courseStudentMap.set(name, (courseStudentMap.get(name) ?? 0) + Number(courseEntry._count.registrations || 0));
    }

    return {
      totals: {
        courses: totalCourses,
        users: totalUsers,
        students: totalStudents,
        registrations: totalRegistrations,
        approvedRegistrations,
        paidInvoices,
        openPeriods,
        totalRevenue,
      },
      revenueByMonth,
      tuitionBreakdown,
      courseBreakdown: Array.from(courseStudentMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      conversionRate: {
        totalRegistrations,
        approvedRegistrations,
        rate: Number(conversionRate.toFixed(2)),
      },
    };
  }
}

export const dashboardService = new DashboardService();

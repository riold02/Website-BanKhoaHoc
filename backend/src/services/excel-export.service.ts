import ExcelJS from 'exceljs';
import { prisma } from '../config/database';

const sanitizeSheetName = (value: string) => {
  const base = value.replace(/[\\/\[\]:*?]/g, '').replace(/\s+/g, '_').trim();
  return (base || 'Sheet').slice(0, 31);
};

export class ExcelExportService {
  async exportClassList(): Promise<Buffer> {
    const classes = await prisma.class.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        period: {
          include: {
            course: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh_sach_lop');

    worksheet.columns = [
      { header: 'Mã lớp', key: 'classCode', width: 18 },
      { header: 'Tên lớp', key: 'name', width: 30 },
      { header: 'Khóa học', key: 'course', width: 32 },
      { header: 'Đợt tuyển sinh', key: 'period', width: 22 },
      { header: 'Phòng học', key: 'room', width: 18 },
      { header: 'Sĩ số', key: 'enrollmentCount', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 16 },
      { header: 'Ngày bắt đầu', key: 'startDate', width: 18 },
      { header: 'Ngày kết thúc', key: 'endDate', width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    for (const item of classes) {
      worksheet.addRow({
        classCode: item.classCode,
        name: item.name,
        course: item.period?.course?.title || '--',
        period: item.period?.name || '--',
        room: item.room || '--',
        enrollmentCount: item._count.enrollments,
        status: item.status,
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '--',
        endDate: item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '--',
      });
    }

    worksheet.autoFilter = {
      from: 'A1',
      to: 'I1',
    };

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportGradeSheet(classId?: string): Promise<Buffer> {
    const classes = await prisma.class.findMany({
      where: classId ? { id: classId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        period: { include: { course: true } },
        gradeComponents: true,
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            grades: {
              include: {
                component: true,
              },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();

    if (!classes.length) {
      const worksheet = workbook.addWorksheet('Bang_diem');
      worksheet.columns = [{ header: 'Thông báo', key: 'message', width: 80 }];
      worksheet.addRow({ message: 'Không có dữ liệu bảng điểm cho điều kiện lọc hiện tại.' });
      return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    for (const classItem of classes) {
      const sheetName = sanitizeSheetName(classItem.name || classItem.classCode);
      const worksheet = workbook.addWorksheet(sheetName);
      const componentColumns = classItem.gradeComponents.map((component) => ({
        header: component.name,
        key: `component_${component.id}`,
        width: 18,
      }));

      worksheet.columns = [
        { header: 'STT', key: 'index', width: 8 },
        { header: 'Mã học viên', key: 'studentCode', width: 18 },
        { header: 'Họ tên', key: 'fullName', width: 30 },
        ...componentColumns,
        { header: 'Điểm trung bình', key: 'averageScore', width: 18 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      const rows = classItem.enrollments
        .map((enrollment) => {
          const gradeMap = new Map(enrollment.grades.map((grade) => [grade.componentId, grade.score]));
          const componentScores = classItem.gradeComponents.map((component) => {
            const score = gradeMap.get(component.id);
            return score ?? null;
          });

          const validScores = componentScores.filter((score): score is number => score !== null && score !== undefined);
          const averageScore = validScores.length > 0
            ? validScores.reduce((sum, score) => sum + Number(score), 0) / validScores.length
            : 0;

          return {
            index: 0,
            studentCode: enrollment.student.studentCode,
            fullName: enrollment.student.user.profile?.fullName || '--',
            averageScore: Number(averageScore.toFixed(2)),
            ...Object.fromEntries(
              classItem.gradeComponents.map((component, idx) => [
                `component_${component.id}`,
                componentScores[idx] ?? null,
              ])
            ),
          };
        })
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

      rows.forEach((row, idx) => {
        const newRow = { ...row, index: idx + 1 };
        worksheet.addRow(newRow);
      });

      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(65 + worksheet.columns.length - 1)}1`,
      };
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportTuitionReport(): Promise<Buffer> {
    const invoices = await prisma.tuitionInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        registration: {
          include: {
            student: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            period: {
              include: {
                course: true,
              },
            },
          },
        },
        transactions: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bao_cao_hoc_phi');

    worksheet.columns = [
      { header: 'Mã hóa đơn', key: 'invoiceCode', width: 20 },
      { header: 'Mã học viên', key: 'studentCode', width: 18 },
      { header: 'Học viên', key: 'studentName', width: 28 },
      { header: 'Khóa học', key: 'courseTitle', width: 30 },
      { header: 'Đợt', key: 'periodName', width: 22 },
      { header: 'Tổng tiền', key: 'totalAmount', width: 18 },
      { header: 'Đã thanh toán', key: 'paidAmount', width: 18 },
      { header: 'Còn nợ', key: 'remainingAmount', width: 18 },
      { header: 'Trạng thái', key: 'paymentStatus', width: 18 },
      { header: 'Hạn thanh toán', key: 'dueDate', width: 18 },
      { header: 'Số giao dịch', key: 'transactionCount', width: 14 },
      { header: 'Giao dịch cuối', key: 'lastPaymentDate', width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    for (const invoice of invoices) {
      const totalAmount = Number(invoice.totalAmount || 0);
      const paidAmount = Number(invoice.paidAmount || 0);
      const remainingAmount = Math.max(0, totalAmount - paidAmount);
      const lastPayment = invoice.transactions.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];

      worksheet.addRow({
        invoiceCode: invoice.invoiceCode,
        studentCode: invoice.registration.student.studentCode,
        studentName: invoice.registration.student.user.profile?.fullName || '--',
        courseTitle: invoice.registration.period.course.title,
        periodName: invoice.registration.period.name,
        totalAmount: totalAmount,
        paidAmount,
        remainingAmount,
        paymentStatus: invoice.paymentStatus,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : '--',
        transactionCount: invoice.transactions.length,
        lastPaymentDate: lastPayment ? new Date(lastPayment.paymentDate).toLocaleDateString('vi-VN') : '--',
      });
    }

    worksheet.autoFilter = {
      from: 'A1',
      to: 'L1',
    };

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}

export const excelExportService = new ExcelExportService();

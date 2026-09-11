import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class TuitionService {
  private buildTransferInfo(invoiceCode?: string | null) {
    const transferContent = invoiceCode ? `HP ${invoiceCode}` : 'HP TUITION';

    const paymentInfo = {
      bankName: 'Vietcombank',
      bankCode: 'VCB',
      accountNumber: '1023456789',
      accountHolder: 'CÔNG TY TNHH GIÁO DỤC DLU',
      branch: 'Chi nhánh Hà Nội',
      transferContent,
      note: 'Vui lòng ghi đúng nội dung chuyển khoản để hệ thống đối chiếu hóa đơn.',
      qrCodeUrl: null,
    };

    return {
      bankInfo: paymentInfo,
      bankTransferInfo: paymentInfo,
      transferInfo: paymentInfo,
      paymentInfo,
      paymentInstructions: paymentInfo,
      transferInstructions: paymentInfo,
    };
  }

  private withTransferInfo<T extends { invoiceCode?: string | null }>(invoice: T) {
    return {
      ...invoice,
      ...this.buildTransferInfo(invoice.invoiceCode),
    };
  }

  async listTuitionInvoices(query: {
    status?: string;
    studentId?: string;
    page?: number;
    limit?: number;
    requestingStudentId?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.paymentStatus = query.status;
    }

    if (query.requestingStudentId) {
      where.registration = { studentId: query.requestingStudentId };
    }

    if (query.studentId) {
      where.registration = { ...where.registration, studentId: query.studentId };
    }

    const [total, invoices] = await Promise.all([
      prisma.tuitionInvoice.count({ where }),
      prisma.tuitionInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          registration: {
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
          },
          transactions: {
            orderBy: { paymentDate: 'desc' },
            take: 5,
          },
        },
      }),
    ]);

    return {
      invoices: invoices.map((invoice) => this.withTransferInfo(invoice)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyTuitionInvoices(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      throw new AppError('Không tìm thấy hồ sơ học viên cho tài khoản này', 404, 'STUDENT_NOT_FOUND');
    }

    const registrations = await prisma.registration.findMany({
      where: { studentId: student.id },
      select: { id: true },
    });

    const registrationIds = registrations.map((reg) => reg.id);

    const invoices = await prisma.tuitionInvoice.findMany({
      where: registrationIds.length > 0 ? { registrationId: { in: registrationIds } } : { registrationId: '' },
      orderBy: { createdAt: 'desc' },
      include: {
        registration: {
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
        },
        transactions: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    return invoices.map((invoice) => this.withTransferInfo(invoice));
  }

  async getTuitionInvoiceById(id: string, requestingUser?: { userId: string; role: string }) {
    const invoice = await prisma.tuitionInvoice.findUnique({
      where: { id },
      include: {
        registration: {
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
        },
        transactions: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Hóa đơn học phí không tồn tại', 404, 'TUITION_INVOICE_NOT_FOUND');
    }

    if (requestingUser?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: requestingUser.userId },
        select: { id: true },
      });

      if (!student || invoice.registration.studentId !== student.id) {
        throw new AppError('Bạn không có quyền xem hóa đơn này', 403, 'FORBIDDEN');
      }
    }

    return this.withTransferInfo(invoice);
  }

  async recordPayment(
    invoiceId: string,
    data: {
      amount: number;
      paymentMethod: 'CASH' | 'BANK_TRANSFER';
      referenceNumber?: string | null;
      note?: string | null;
      receiverId?: string;
    }
  ) {
    const invoice = await prisma.tuitionInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new AppError('Hóa đơn học phí không tồn tại', 404, 'TUITION_INVOICE_NOT_FOUND');
    }

    if (data.amount <= 0) {
      throw new AppError('Số tiền thanh toán phải lớn hơn 0', 400, 'INVALID_PAYMENT_AMOUNT');
    }

    const totalAmount = Number(invoice.totalAmount);
    const paidAmount = Number(invoice.paidAmount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    if (data.amount > remainingAmount) {
      throw new AppError(
        `Số tiền thanh toán vượt quá số còn nợ. Còn nợ: ${remainingAmount.toLocaleString('vi-VN')} VND`,
        400,
        'AMOUNT_EXCEEDS_BALANCE'
      );
    }

    if (data.paymentMethod === 'BANK_TRANSFER' && (!data.referenceNumber || !data.referenceNumber.trim())) {
      throw new AppError('Vui lòng cung cấp mã tham chiếu cho thanh toán chuyển khoản', 400, 'REFERENCE_REQUIRED');
    }

    return prisma.$transaction(async (tx) => {
      const transactionCode = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const transaction = await tx.paymentTransaction.create({
        data: {
          invoiceId,
          transactionCode,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber?.trim() || null,
          paymentDate: new Date(),
          receiverId: data.receiverId || null,
          note: data.note?.trim() || null,
        },
      });

      const nextPaidAmount = paidAmount + data.amount;
      const updatedInvoice = await tx.tuitionInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: nextPaidAmount,
          paymentStatus: nextPaidAmount >= totalAmount ? 'PAID' : 'PARTIAL',
        },
        include: {
          registration: {
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
          },
          transactions: {
            orderBy: { paymentDate: 'desc' },
          },
        },
      });

      return {
        ...updatedInvoice,
        latestTransaction: transaction,
      };
    });
  }
}

export const tuitionService = new TuitionService();

import { Request, Response, NextFunction } from 'express';
import { tuitionService } from '../services/tuition.service';
import { sendSuccess } from '../utils/response.util';
import { RoleEnum } from '../constants/roles.enum';
import { studentService } from '../services/student.service';

export class TuitionController {
  async listTuitionInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, studentId, page, limit } = req.query;
      const user = req.user!;

      let requestingStudentId: string | undefined;
      if (user.role === RoleEnum.STUDENT) {
        const student = await studentService.getStudentByUserId(user.userId);
        requestingStudentId = student.id;
      }

      const result = await tuitionService.listTuitionInvoices({
        status: status as string,
        studentId: studentId as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        requestingStudentId,
      });

      return sendSuccess(res, result.invoices, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getMyTuitionInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const invoices = await tuitionService.getMyTuitionInvoices(user.userId);
      return sendSuccess(res, invoices, 200);
    } catch (error) {
      next(error);
    }
  }

  async getTuitionInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await tuitionService.getTuitionInvoiceById(req.params.id, req.user);
      return sendSuccess(res, invoice, 200);
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const payment = await tuitionService.recordPayment(req.params.id, {
        amount: Number(req.body.amount),
        paymentMethod: req.body.paymentMethod,
        referenceNumber: req.body.referenceNumber,
        note: req.body.note,
        receiverId: user.userId,
      });

      return sendSuccess(res, payment, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const tuitionController = new TuitionController();

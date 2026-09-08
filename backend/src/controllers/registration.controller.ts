import { Request, Response, NextFunction } from 'express';
import { registrationService } from '../services/registration.service';
import { studentService } from '../services/student.service';
import { sendSuccess } from '../utils/response.util';
import { AppError } from '../utils/response.util';
import { RoleEnum } from '../constants/roles.enum';

export class RegistrationController {
  async listRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, periodId, studentId, page, limit } = req.query;
      const user = req.user!;

      // Nếu là STUDENT, chỉ xem đơn của chính mình
      let requestingStudentId: string | undefined;
      if (user.role === RoleEnum.STUDENT) {
        const student = await studentService.getStudentByUserId(user.userId);
        requestingStudentId = student.id;
      }

      const result = await registrationService.listRegistrations({
        status: status as string,
        periodId: periodId as string,
        studentId: studentId as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        requestingStudentId,
      });
      return sendSuccess(res, result.registrations, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getRegistrationById(req: Request, res: Response, next: NextFunction) {
    try {
      const reg = await registrationService.getRegistrationById(req.params.id);
      return sendSuccess(res, reg, 200);
    } catch (error) {
      next(error);
    }
  }

  async createRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      // Học viên tạo đơn cho chính mình
      const student = await studentService.getStudentByUserId(user.userId);
      const reg = await registrationService.createRegistration({
        studentId: student.id,
        periodId: req.body.periodId,
        note: req.body.note,
      });
      return sendSuccess(res, reg, 201);
    } catch (error) {
      next(error);
    }
  }

  async reviewRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { status, note } = req.body;
      const reg = await registrationService.reviewRegistration(req.params.id, user.userId, status, note);
      return sendSuccess(res, reg, 200);
    } catch (error) {
      next(error);
    }
  }

  async cancelRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isAdmin = user.role === RoleEnum.ADMIN || user.role === RoleEnum.STAFF;
      const reg = await registrationService.cancelRegistration(req.params.id, user.userId, isAdmin);
      return sendSuccess(res, reg, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const registrationController = new RegistrationController();

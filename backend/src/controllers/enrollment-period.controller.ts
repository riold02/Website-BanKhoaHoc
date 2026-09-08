import { Request, Response, NextFunction } from 'express';
import { enrollmentPeriodService } from '../services/enrollment-period.service';
import { sendSuccess } from '../utils/response.util';

export class EnrollmentPeriodController {
  async listPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, status, page, limit } = req.query;
      const result = await enrollmentPeriodService.listPeriods({
        courseId: courseId as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.periods, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getPeriodById(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await enrollmentPeriodService.getPeriodById(req.params.id);
      return sendSuccess(res, period, 200);
    } catch (error) {
      next(error);
    }
  }

  async createPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await enrollmentPeriodService.createPeriod(req.body);
      return sendSuccess(res, period, 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await enrollmentPeriodService.updatePeriod(req.params.id, req.body);
      return sendSuccess(res, period, 200);
    } catch (error) {
      next(error);
    }
  }

  async updatePeriodStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const period = await enrollmentPeriodService.updatePeriodStatus(req.params.id, req.body.status);
      return sendSuccess(res, period, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentPeriodController = new EnrollmentPeriodController();

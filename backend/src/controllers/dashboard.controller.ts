import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response.util';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { usernameOrEmail, password } = req.body;
      const result = await authService.login(usernameOrEmail, password);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      return sendSuccess(res, tokens, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

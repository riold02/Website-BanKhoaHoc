import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response.util';

export class UserController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, roleId, isActive } = req.query;
      const result = await userService.listUsers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        roleId: roleId ? parseInt(roleId as string, 10) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      return sendSuccess(res, result.users, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUserStatus(req.params.id, req.body.isActive, req.user!.userId);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUserRole(req.params.id, req.body.roleId);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

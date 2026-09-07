import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.util';
import { RoleEnum } from '../constants/roles.enum';

export function authorize(allowedRoles: (RoleEnum | string)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Chưa xác thực người dùng', 401, 'UNAUTHORIZED'));
    }

    const hasPermission = allowedRoles.includes(req.user.role);
    if (!hasPermission) {
      return next(
        new AppError(
          `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

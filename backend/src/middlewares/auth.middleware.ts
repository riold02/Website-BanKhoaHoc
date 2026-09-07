import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/response.util';
import { env } from '../config/env';
import { RoleEnum } from '../constants/roles.enum';

export interface AuthUser {
  userId: string;
  email: string;
  role: RoleEnum | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Kiểm tra JWT Bearer Token trước
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyAccessToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
        return next();
      } catch (err: any) {
        throw new AppError('Token xác thực không hợp lệ hoặc đã hết hạn', 401, 'INVALID_TOKEN');
      }
    }

    // 2. Mock Auth Decoupling cho nhóm 4 người (Chỉ áp dụng trong môi trường development)
    if (env.NODE_ENV === 'development') {
      const mockRoleHeader = req.headers['x-mock-role'] as string;
      const mockUserIdHeader = req.headers['x-mock-user-id'] as string;

      if (mockRoleHeader) {
        const roleUpper = mockRoleHeader.toUpperCase();
        req.user = {
          userId: mockUserIdHeader || '00000000-0000-0000-0000-000000000001',
          email: `mock_${roleUpper.toLowerCase()}@cms.local`,
          role: roleUpper,
        };
        return next();
      }
    }

    // 3. Nếu không có cả Token và Mock Header
    throw new AppError('Yêu cầu xác thực. Vui lòng đăng nhập.', 401, 'UNAUTHORIZED');
  } catch (error) {
    next(error);
  }
}

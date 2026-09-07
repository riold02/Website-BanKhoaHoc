import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response.util';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  console.error('💥 Unhandled Error:', err);

  // Prisma unique constraint violation error code P2002
  if (err.code === 'P2002') {
    const target = err.meta?.target ? `Trường ${err.meta.target}` : 'Dữ liệu';
    return sendError(res, `${target} đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.`, 409, 'DUPLICATE_ENTRY');
  }

  // Fallback 500 error
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi nội bộ máy chủ' : err.message || 'Lỗi hệ thống',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}

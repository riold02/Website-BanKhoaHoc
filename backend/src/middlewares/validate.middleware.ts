import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/response.util';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join('.').replace(/^(body|query|params)\./, ''),
          message: i.message,
        }));
        return next(
          new AppError(
            `Dữ liệu đầu vào không hợp lệ: ${issues[0]?.message || 'Lỗi định dạng'}`,
            400,
            'VALIDATION_ERROR',
            issues
          )
        );
      }
      next(error);
    }
  };
}

import { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiSuccessResponse<T>['meta']
) {
  const responsePayload: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  code: string = 'ERROR',
  details?: any
) {
  const responsePayload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responsePayload);
}

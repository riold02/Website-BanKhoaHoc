import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRoutes } from './routes/api.routes';
import { errorHandler } from './middlewares/error.middleware';
import { sendError } from './utils/response.util';
import { env } from './config/env';

export const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép tất cả trong dev, hoặc domain frontend
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-user-id', 'x-mock-role'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Central API Routes (tiền tố chuẩn /api/v1)
app.use('/api/v1', apiRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  return sendError(res, `Đường dẫn API '${req.originalUrl}' không tồn tại trên hệ thống`, 404, 'ROUTE_NOT_FOUND');
});

// Central Error Handler
app.use(errorHandler);

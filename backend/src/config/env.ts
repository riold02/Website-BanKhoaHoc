import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'cms_super_secret_jwt_key_2026_dlu',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'cms_super_refresh_jwt_key_2026_dlu',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

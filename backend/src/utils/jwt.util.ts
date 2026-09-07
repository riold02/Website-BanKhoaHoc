import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
}

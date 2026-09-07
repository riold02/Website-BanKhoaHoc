import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util';
import { AppError } from '../utils/response.util';
import { ROLE_IDS, RoleEnum } from '../constants/roles.enum';

export class AuthService {
  async register(data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
    phone?: string;
    address?: string;
    idCardNumber?: string;
    gender?: string;
    birthDate?: string;
  }) {
    // 1. Kiểm tra email hoặc username đã tồn tại
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError('Email này đã được đăng ký trong hệ thống', 409, 'EMAIL_EXISTS');
      }
      throw new AppError('Tên đăng nhập này đã được sử dụng', 409, 'USERNAME_EXISTS');
    }

    // 2. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 3. Sinh mã học viên ngẫu nhiên (HV-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentCode = `HV-${new Date().getFullYear()}-${randomSuffix}`;

    // 4. Khởi tạo tài khoản trong Transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash,
          roleId: ROLE_IDS[RoleEnum.STUDENT],
          profile: {
            create: {
              fullName: data.fullName,
              phone: data.phone || null,
              address: data.address || null,
            },
          },
          student: {
            create: {
              studentCode,
              idCardNumber: data.idCardNumber || null,
              gender: data.gender || null,
              birthDate: data.birthDate ? new Date(data.birthDate) : null,
            },
          },
        },
        include: {
          role: true,
          profile: true,
          student: true,
        },
      });
      return user;
    });

    // 5. Cấp Access & Refresh Token
    const tokens = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role.name,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, tokens };
  }

  async login(usernameOrEmail: string, pass: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
      include: {
        role: true,
        profile: true,
        student: true,
      },
    });

    if (!user) {
      throw new AppError('Tên đăng nhập hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ ban quản trị.', 403, 'ACCOUNT_LOCKED');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Tên đăng nhập hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', 401, 'UNAUTHORIZED');
      }

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role.name,
      });

      return tokens;
    } catch (err: any) {
      throw new AppError('RefreshToken không hợp lệ hoặc đã hết hạn', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        profile: true,
        student: true,
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy thông tin người dùng', 404, 'USER_NOT_FOUND');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; address?: string; avatarUrl?: string }) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.address !== undefined ? { address: data.address || null } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
      },
      create: {
        userId,
        fullName: data.fullName || 'Người dùng',
        phone: data.phone || null,
        address: data.address || null,
        avatarUrl: data.avatarUrl || null,
      },
    });

    return profile;
  }
}

export const authService = new AuthService();

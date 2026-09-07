import { prisma } from '../config/database';
import { AppError } from '../utils/response.util';

export class UserService {
  async listUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    isActive?: boolean;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { username: { contains: query.search } },
        { profile: { fullName: { contains: query.search } } },
      ];
    }

    if (query.roleId !== undefined) {
      where.roleId = query.roleId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          profile: true,
          student: true,
        },
      }),
    ]);

    const safeUsers = users.map(({ passwordHash, ...safe }) => safe);
    const totalPages = Math.ceil(total / limit);

    return {
      users: safeUsers,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        profile: true,
        student: true,
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUserStatus(id: string, isActive: boolean, currentAdminId: string) {
    if (id === currentAdminId && !isActive) {
      throw new AppError('Bạn không thể tự khóa tài khoản quản trị viên của chính mình', 400, 'CANNOT_LOCK_SELF');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        role: true,
        profile: true,
      },
    });

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUserRole(id: string, roleId: number) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError('Vai trò không tồn tại', 404, 'ROLE_NOT_FOUND');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { roleId },
      include: {
        role: true,
        profile: true,
      },
    });

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const userService = new UserService();

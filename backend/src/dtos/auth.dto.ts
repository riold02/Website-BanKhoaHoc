import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Địa chỉ email không hợp lệ'),
    username: z
      .string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(30, 'Tên đăng nhập không được quá 30 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    phone: z.string().regex(/^0[0-9]{9}$/, 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng số 0)').optional().or(z.literal('')),
    address: z.string().optional(),
    idCardNumber: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    usernameOrEmail: z.string().min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').optional(),
    phone: z.string().regex(/^0[0-9]{9}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
    address: z.string().optional(),
    avatarUrl: z.string().url('URL ảnh đại diện không hợp lệ').optional().or(z.literal('')),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Vui lòng cung cấp refreshToken'),
  }),
});

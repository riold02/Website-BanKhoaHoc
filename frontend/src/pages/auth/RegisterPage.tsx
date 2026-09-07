import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, Phone, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    idCardNumber: '',
    gender: 'Nam',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        idCardNumber: formData.idCardNumber,
        gender: formData.gender,
      });
      navigate('/courses', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/courses" className="inline-flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Tạo Tài Khoản Học Viên Mới
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Đăng ký tài khoản để xem thông tin đợt tuyển sinh, nộp đơn và theo dõi khóa học
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên (*)"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                icon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label="Số điện thoại (*)"
                name="phone"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone className="h-4 w-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Địa chỉ Email (*)"
                name="email"
                type="email"
                placeholder="hocvien@gmail.com"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Tên đăng nhập (*)"
                name="username"
                placeholder="hocvien2026"
                value={formData.username}
                onChange={handleChange}
                icon={<User className="h-4 w-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mật khẩu (*)"
                name="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <Input
                label="Nhập lại mật khẩu (*)"
                name="confirmPassword"
                type="password"
                placeholder="Khớp với mật khẩu trên"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock className="h-4 w-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số CCCD / CMND"
                name="idCardNumber"
                placeholder="06820000xxxx"
                value={formData.idCardNumber}
                onChange={handleChange}
                icon={<CreditCard className="h-4 w-4" />}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <Input
              label="Địa chỉ thường trú"
              name="address"
              placeholder="Số nhà, Đường, Phường/Xã, Tỉnh/Thành"
              value={formData.address}
              onChange={handleChange}
              icon={<MapPin className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Hoàn Tất Đăng Ký
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

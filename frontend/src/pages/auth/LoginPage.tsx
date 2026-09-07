import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const user = await login(usernameOrEmail, password);
      
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role.name === 'ADMIN' || user.role.name === 'STAFF') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/courses', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (userType: 'admin' | 'staff' | 'student') => {
    if (userType === 'admin') {
      setUsernameOrEmail('admin@cms.dlu.edu.vn');
      setPassword('Password123@');
    } else if (userType === 'staff') {
      setUsernameOrEmail('staff@cms.dlu.edu.vn');
      setPassword('Password123@');
    } else {
      setUsernameOrEmail('student@cms.dlu.edu.vn');
      setPassword('Password123@');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/courses" className="inline-flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Đăng Nhập Hệ Thống CMS
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hệ thống Quản lý Đăng ký Khóa học & Học viên - Đại học Đà Lạt
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên đăng nhập hoặc Email"
              type="text"
              placeholder="admin@cms.dlu.edu.vn hoặc admin"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Vui lòng liên hệ Giáo vụ hoặc Admin qua email daotao@dlu.edu.vn để cấp lại mật khẩu.');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Đăng Nhập
            </Button>
          </form>

          {/* Quick Demo Accounts for pairwise testing */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ Đăng nhập nhanh tài khoản mẫu (Demo):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-800 transition text-center"
              >
                <ShieldCheck className="h-4 w-4 mb-1 text-purple-600" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-purple-500">Quản trị</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('staff')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-800 transition text-center"
              >
                <UserCheck className="h-4 w-4 mb-1 text-blue-600" />
                <span className="text-[11px] font-bold">Staff</span>
                <span className="text-[9px] text-blue-500">Giáo vụ</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 transition text-center"
              >
                <BookOpen className="h-4 w-4 mb-1 text-emerald-600" />
                <span className="text-[11px] font-bold">Student</span>
                <span className="text-[9px] text-emerald-500">Học viên</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Chưa có tài khoản học viên?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Đăng ký học viên ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

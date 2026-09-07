import React, { useEffect, useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Lock, Unlock, User as UserIcon } from 'lucide-react';
import { authApi } from '../../services/auth.api';
import { User } from '../../types/auth.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate, getRoleBadgeLabel } from '../../utils/formatters';
import { useAuth } from '../../context/auth.context';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status toggle modal
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user: currentUser } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await authApi.listUsers({
        page,
        limit: 10,
        search: search || undefined,
        roleId: selectedRole ? parseInt(selectedRole, 10) : undefined,
      });
      setUsers(res.users);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, selectedRole]);

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    try {
      setIsUpdating(true);
      const updated = await authApi.updateUserStatus(targetUser.id, !targetUser.isActive);
      showToast(
        `Đã ${updated.isActive ? 'mở khóa' : 'khóa'} tài khoản '${updated.username}' thành công!`
      );
      setTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái tài khoản', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-xl border animate-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Quản Lý Tài Khoản & Phân Quyền (User Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: <strong className="text-slate-800">{totalCount} tài khoản</strong> trong hệ thống
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Tìm theo tên đăng nhập, email, họ tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả vai trò</option>
            <option value="1">Admin (Quản trị viên)</option>
            <option value="2">Staff (Giáo vụ)</option>
            <option value="3">Student (Học viên)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Người Dùng</th>
                <th className="px-6 py-3 font-semibold">Tên Đăng Nhập</th>
                <th className="px-6 py-3 font-semibold">Vai Trò</th>
                <th className="px-6 py-3 font-semibold">Số Điện Thoại</th>
                <th className="px-6 py-3 font-semibold">Ngày Tạo</th>
                <th className="px-6 py-3 font-semibold">Trạng Thái</th>
                <th className="px-6 py-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleBadge = getRoleBadgeLabel(u.role.name);
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {u.profile?.fullName ? u.profile.fullName.charAt(0) : <UserIcon className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {u.profile?.fullName || u.username}
                              {isCurrent && (
                                <span className="ml-1.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-normal">
                                  Bạn
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-700">{u.username}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${roleBadge.color}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {u.profile?.phone || '--'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant={u.isActive ? 'success' : 'error'} size="sm">
                          {u.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {!isCurrent && (
                          <Button
                            variant={u.isActive ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => setTargetUser(u)}
                            icon={
                              u.isActive ? (
                                <Lock className="h-3 w-3 text-rose-500" />
                              ) : (
                                <Unlock className="h-3 w-3 text-emerald-600" />
                              )
                            }
                          >
                            {u.isActive ? 'Khóa' : 'Mở'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        isOpen={Boolean(targetUser)}
        onClose={() => setTargetUser(null)}
        title={targetUser?.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bạn có chắc muốn {targetUser?.isActive ? 'khóa' : 'mở khóa'} tài khoản của{' '}
            <strong className="text-slate-900">
              {targetUser?.profile?.fullName || targetUser?.username} ({targetUser?.email})
            </strong>
            ?
          </p>
          {targetUser?.isActive && (
            <p className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Khi bị khóa, người dùng sẽ không thể đăng nhập vào cổng học tập hoặc quản trị của hệ thống.
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setTargetUser(null)}>
              Hủy
            </Button>
            <Button
              variant={targetUser?.isActive ? 'danger' : 'primary'}
              size="sm"
              isLoading={isUpdating}
              onClick={handleToggleStatus}
            >
              {targetUser?.isActive ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

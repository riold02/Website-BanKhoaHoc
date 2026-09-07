export function formatVND(amount: number): string {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--/--/----';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getRoleBadgeLabel(role: string): { label: string; color: string } {
  switch (role) {
    case 'ADMIN':
      return { label: 'Quản Trị Viên', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'STAFF':
      return { label: 'Giáo Vụ Đào Tạo', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'STUDENT':
      return { label: 'Học Viên', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    default:
      return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

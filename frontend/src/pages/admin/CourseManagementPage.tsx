import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  FileText,
} from 'lucide-react';
import { courseApi } from '../../services/course.api';
import { Course, Category } from '../../types/course.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatVND } from '../../utils/formatters';

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalHours, setTotalHours] = useState<number | ''>('');
  const [standardPrice, setStandardPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete Confirm Modal
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await courseApi.getCourses({
        page,
        limit: 10,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
      });
      setCourses(res.courses);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách khóa học', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await courseApi.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, search, selectedCategory]);

  const handleOpenCreateDrawer = () => {
    setEditingCourse(null);
    setCourseCode('');
    setTitle('');
    setDescription('');
    setTotalHours(60);
    setStandardPrice(3000000);
    setCategoryId(categories[0]?.id || '');
    setIsActive(true);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.courseCode);
    setTitle(course.title);
    setDescription(course.description || '');
    setTotalHours(course.totalHours);
    setStandardPrice(course.standardPrice);
    setCategoryId(course.categoryId || '');
    setIsActive(course.isActive);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !title.trim() || totalHours === '' || standardPrice === '') {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        courseCode: courseCode.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || undefined,
        totalHours: Number(totalHours),
        standardPrice: Number(standardPrice),
        categoryId: categoryId || null,
        isActive,
      };

      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, payload);
        showToast(`Cập nhật khóa học '${payload.courseCode}' thành công!`);
      } else {
        await courseApi.createCourse(payload);
        showToast(`Tạo mới khóa học '${payload.courseCode}' thành công!`);
      }

      setIsDrawerOpen(false);
      fetchCourses();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi lưu khóa học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;
    try {
      setIsDeleting(true);
      const res = await courseApi.deleteCourse(deletingCourse.id);
      showToast(res.message);
      setDeletingCourse(null);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa khóa học', 'error');
    } finally {
      setIsDeleting(false);
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
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Khóa Học (Course Catalog)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: <strong className="text-slate-800">{totalCount} khóa học</strong> trong hệ thống
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateDrawer}
          icon={<Plus className="h-4 w-4" />}
        >
          Thêm Khóa Học Mới
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Tìm theo tên khóa học, mã khóa học (Enter)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả danh mục đào tạo</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Mã Khóa</th>
                <th className="px-6 py-3 font-semibold">Tên Khóa Học</th>
                <th className="px-6 py-3 font-semibold">Danh Mục</th>
                <th className="px-6 py-3 font-semibold">Thời Lượng</th>
                <th className="px-6 py-3 font-semibold">Học Phí Chuẩn</th>
                <th className="px-6 py-3 font-semibold">Đợt Mở</th>
                <th className="px-6 py-3 font-semibold">Trạng Thái</th>
                <th className="px-6 py-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải danh sách khóa học...</span>
                    </div>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không tìm thấy khóa học nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-700">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900 max-w-sm">
                      <div className="line-clamp-1">{course.title}</div>
                      {course.description && (
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                        {course.category?.name || 'Chung'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">
                      {course.totalHours} giờ
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {formatVND(course.standardPrice)}
                    </td>
                    <td className="px-6 py-3.5">
                      {course.periods && course.periods.length > 0 ? (
                        <Badge variant="primary" size="sm">
                          {course.periods.length} đợt mở
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa mở đợt</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={course.isActive ? 'success' : 'slate'} size="sm">
                        {course.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditDrawer(course)}
                          title="Chỉnh sửa khóa học"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCourse(course)}
                          title="Xóa / Ngưng khóa học"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {page} / {totalPages} (Tổng số: {totalCount} khóa)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer Form: Create / Edit Course */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        variant="drawer"
        maxWidth="lg"
        title={editingCourse ? `Chỉnh Sửa Khóa Học: ${editingCourse.courseCode}` : 'Thêm Khóa Học Mới'}
        description="Điền thông tin chi tiết khóa học đào tạo ngắn hạn của trung tâm."
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã Khóa Học (*)"
              placeholder="VD: LP-WEB-15"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              helperText="Viết hoa, không dấu, ngăn cách bằng gạch nối"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Danh Mục Khóa Học
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Tên Khóa Học (*)"
            placeholder="VD: Lập trình Web Fullstack Chuyên Nghiệp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Thời lượng (Tổng số giờ) (*)"
              type="number"
              placeholder="VD: 90"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value === '' ? '' : Number(e.target.value))}
              icon={<Clock className="h-4 w-4" />}
              required
            />

            <Input
              label="Học phí chuẩn định mức (VND) (*)"
              type="number"
              placeholder="VD: 3500000"
              value={standardPrice}
              onChange={(e) => setStandardPrice(e.target.value === '' ? '' : Number(e.target.value))}
              icon={<Coins className="h-4 w-4" />}
              helperText={typeof standardPrice === 'number' ? formatVND(standardPrice) : ''}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Mô tả chi tiết & Đề cương tóm tắt
            </label>
            <textarea
              rows={5}
              placeholder="Nội dung chương trình học, mục tiêu đầu ra, yêu cầu học viên..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs font-medium text-slate-700">
                Kích hoạt mở khóa học này trên hệ thống tuyển sinh
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsDrawerOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {editingCourse ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <Modal
        isOpen={Boolean(deletingCourse)}
        onClose={() => setDeletingCourse(null)}
        title="Xác nhận xóa / ngưng khóa học"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa khóa học{' '}
            <strong className="text-slate-900">
              {deletingCourse?.courseCode} - {deletingCourse?.title}
            </strong>
            ?
          </p>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            Lưu ý: Nếu khóa học đã có đợt tuyển sinh hoặc danh sách học viên đăng ký, hệ thống sẽ tự động chuyển trạng thái sang ngưng hoạt động để bảo toàn dữ liệu lịch sử.
          </p>
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setDeletingCourse(null)}>
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              Xác Nhận Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

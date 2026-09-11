import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  BookOpen,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  User,
  Phone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { courseApi } from '../../services/course.api';
import { registrationApi } from '../../services/registration.api';
import { Course, Category } from '../../types/course.types';
import { formatVND, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/auth.context';

export const CourseCatalogPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Detail Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [cats, courseRes] = await Promise.all([
          courseApi.getCategories(),
          courseApi.getCourses({ isActive: true, limit: 50 }),
        ]);
        setCategories(cats);
        setCourses(courseRes.courses);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khóa học:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchCategory = activeCategory === 'ALL' || c.categoryId === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Registration state
  const [registerCourse, setRegisterCourse] = useState<Course | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [regNote, setRegNote] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegisterClick = (course: Course) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses` } } });
      return;
    }
    if (user.role?.name !== 'STUDENT') {
      alert('Chỉ tài khoản Học viên mới có thể đăng ký khóa học.');
      return;
    }
    const openPeriods = (course.periods || []).filter((p) => p.status === 'OPEN');
    if (openPeriods.length === 0) {
      alert('Hiện chưa có đợt tuyển sinh nào đang mở cho khóa học này.');
      return;
    }
    setRegisterCourse(course);
    setSelectedPeriodId(openPeriods[0].id);
    setRegNote('');
    setAgreedToTerms(false);
    setRegisterError('');
    setRegisterSuccess(false);
    setSelectedCourse(null);
  };

  const handleSubmitRegistration = async () => {
    if (!selectedPeriodId) { setRegisterError('Vui lòng chọn đợt tuyển sinh.'); return; }
    if (!agreedToTerms) { setRegisterError('Bạn cần đồng ý với nội quy trung tâm trước khi gửi đơn.'); return; }
    setIsRegistering(true);
    setRegisterError('');
    try {
      await registrationApi.createRegistration({
        periodId: selectedPeriodId,
        note: regNote.trim() || undefined,
      });
      setRegisterSuccess(true);
    } catch (err: any) {
      setRegisterError(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-4 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Đại Học Đà Lạt (DLU) - Tuyển Sinh 2026
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Khám Phá Các Khóa Đào Tạo Ngắn Hạn & Kỹ Năng Nghề
          </h1>
          <p className="mt-4 text-sm sm:text-base text-blue-100/85 max-w-2xl mx-auto leading-relaxed">
            Chương trình đào tạo thực chiến từ chuyên gia, cấp chứng chỉ chuẩn quốc tế, trang bị kiến thức vững chắc để bứt phá sự nghiệp công nghệ và hội nhập.
          </p>

          {/* Search Bar in Hero */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-950/20 p-1.5 border border-white/20">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm khóa học: React, Python, Java, IELTS, MOS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Category Filter Pills */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-8">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Tất Cả ({courses.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-slate-500">
            Hiển thị <strong className="text-slate-800 font-semibold">{filteredCourses.length} khóa học</strong> phù hợp
          </p>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Đang tải danh mục khóa học...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center p-8">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy khóa học nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có khóa học nào khớp với từ khóa &apos;{search}&apos;. Vui lòng thử tìm kiếm lại với từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const activePeriod = course.periods && course.periods.length > 0 ? course.periods[0] : null;
              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-lg hover:border-blue-200 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Card Header & Category Pill */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {course.category?.name || 'Khóa học chuẩn'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {course.courseCode}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                      {course.description || 'Chương trình đào tạo chuyên sâu chuẩn kỹ năng đầu ra cho học viên và sinh viên.'}
                    </p>

                    {/* Meta info: Hours & Enrolled */}
                    <div className="flex items-center justify-between py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{course.totalHours} giờ học</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span>Cấp chứng chỉ</span>
                      </div>
                    </div>

                    {/* Active Enrollment Period Alert if any */}
                    {activePeriod && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{activePeriod.name}</p>
                          <p className="text-amber-700 text-[10px]">
                            Đã đăng ký: {activePeriod.currentEnrolled}/{activePeriod.maxCapacity} chỉ tiêu
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Price & Action */}
                  <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">
                        Học phí trọn gói
                      </span>
                      <span className="text-lg font-bold font-mono text-slate-900 leading-tight">
                        {formatVND(activePeriod ? activePeriod.tuitionFee : course.standardPrice)}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                      icon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Chi Tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Course Detail Modal */}
      <Modal
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title || 'Thông Tin Khóa Học'}
        maxWidth="xl"
      >
        {selectedCourse && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Mã: {selectedCourse.courseCode}
                </span>
                <span className="text-xs text-blue-700 font-medium">
                  {selectedCourse.category?.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Thời lượng: {selectedCourse.totalHours} giờ</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mục Tiêu & Đề Cương Khóa Học
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line">
                {selectedCourse.description ||
                  'Khóa học được thiết kế theo chuẩn đầu ra doanh nghiệp. Học viên được học lý thuyết kết hợp 70% thời lượng thực hành trực tiếp tại phòng lab tin học trung tâm đào tạo DLU.'}
              </p>
            </div>

            {/* Enrollment Periods list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Đợt Tuyển Sinh Đang Tiếp Nhận
              </h4>
              {selectedCourse.periods && selectedCourse.periods.length > 0 ? (
                <div className="space-y-2">
                  {selectedCourse.periods.map((period) => (
                    <div
                      key={period.id}
                      className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{period.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hạn đăng ký: {formatDate(period.endRegistration)} • Khai giảng dự kiến:{' '}
                          {formatDate(period.expectedStartDate)}
                        </p>
                        <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                          Đã đăng ký: {period.currentEnrolled}/{period.maxCapacity} học viên
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold font-mono text-emerald-700 block">
                          {formatVND(period.tuitionFee)}
                        </span>
                        <Badge variant="success" size="sm">
                          Đang nhận đơn
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Hiện chưa có đợt tuyển sinh mới cho khóa học này. Bạn có thể đăng ký giữ chỗ để trung tâm thông báo sớm nhất.
                </p>
              )}
            </div>

            {/* Price & Register CTA */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Học Phí Chuẩn
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {formatVND(selectedCourse.standardPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="md" onClick={() => setSelectedCourse(null)}>
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleRegisterClick(selectedCourse)}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Đăng Ký Khóa Học
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Registration Modal — §18.4 full form */}
      <Modal
        isOpen={Boolean(registerCourse)}
        onClose={() => setRegisterCourse(null)}
        title={`Xác nhận Đăng ký Khóa Học`}
        maxWidth="md"
      >
        {registerCourse && (
          <div className="space-y-4">
            {registerSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Gửi đơn thành công!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Đơn đăng ký của bạn đã được ghi nhận và đang chờ xét duyệt từ giáo vụ đào tạo.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setRegisterCourse(null)}>
                    Đóng
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { setRegisterCourse(null); navigate('/my-registrations'); }}
                    icon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Xem đơn của tôi
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Course info header */}
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Khóa học</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{registerCourse.title}</p>
                </div>

                {/* Student info — pre-filled from profile */}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Thông tin xác nhận đăng ký</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Họ và tên</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user?.profile?.fullName || user?.username || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Số điện thoại</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user?.profile?.phone || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">CCCD / Mã học viên</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user?.student?.idCardNumber || user?.student?.studentCode || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Email</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user?.email || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period selection */}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Chọn đợt tuyển sinh <span className="text-rose-500">*</span></p>
                  <div className="space-y-2">
                    {(registerCourse.periods || [])
                      .filter((p) => p.status === 'OPEN')
                      .map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            selectedPeriodId === p.id
                              ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
                              : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="period"
                            value={p.id}
                            checked={selectedPeriodId === p.id}
                            onChange={() => setSelectedPeriodId(p.id)}
                            className="mt-0.5 accent-blue-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Hạn đăng ký: {formatDate(p.endRegistration)}
                              {p.expectedStartDate && ` · Khai giảng: ${formatDate(p.expectedStartDate)}`}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Còn {p.maxCapacity - p.currentEnrolled}/{p.maxCapacity} chỗ
                            </p>
                          </div>
                          <span className="text-xs font-bold font-mono text-emerald-700 shrink-0">
                            {formatVND(p.tuitionFee)}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Note textarea */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Ghi chú thêm <span className="text-slate-400 font-normal normal-case">(không bắt buộc)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={regNote}
                    onChange={(e) => setRegNote(e.target.value)}
                    placeholder='Ví dụ: "Tôi muốn học ca tối thứ 2-4-6"'
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none placeholder-slate-400"
                  />
                </div>

                {/* Terms checkbox */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  agreedToTerms ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 accent-emerald-600 h-3.5 w-3.5"
                  />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tôi cam kết thông tin cá nhân nêu trên là chính xác và đồng ý tuân thủ{' '}
                    <span className="font-semibold text-slate-800">nội quy đào tạo của Trung tâm Đào tạo Đại học Đà Lạt (DLU)</span>.
                  </p>
                </label>

                {registerError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {registerError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="md" onClick={() => setRegisterCourse(null)} className="flex-1">
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitRegistration}
                    disabled={isRegistering || !agreedToTerms}
                    icon={<ArrowRight className="h-4 w-4" />}
                    className="flex-1"
                  >
                    {isRegistering ? 'Đang gửi...' : 'Gửi Đơn Đăng Ký Ngay'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

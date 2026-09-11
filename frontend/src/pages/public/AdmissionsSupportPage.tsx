import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgePercent,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCheck,
  GraduationCap,
  Headphones,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdmissionsSupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    courseInterest: 'Lập trình Web Fullstack',
    note: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;
    setIsSubmitted(true);
  };

  const steps = [
    {
      step: '01',
      title: 'Khám Phá & Chọn Khóa Học',
      desc: 'Tìm kiếm khóa học phù hợp với mục tiêu phát triển, xem chi tiết học phí, thời lượng và đợt tuyển sinh đang mở.',
      icon: BookOpen,
    },
    {
      step: '02',
      title: 'Đăng Ký Tuyển Sinh Online',
      desc: 'Điền đơn đăng ký trực tiếp trên hệ thống CMS chỉ trong 1 phút, nhận mã đăng ký (Registration Code) theo dõi tức thì.',
      icon: FileCheck,
    },
    {
      step: '03',
      title: 'Xét Duyệt & Hướng Dẫn Học Phí',
      desc: 'Giáo vụ đối soát và phê duyệt đơn, hệ thống tự động xuất hóa đơn học phí kèm mã QR chuyển khoản chính xác.',
      icon: UserCheck,
    },
    {
      step: '04',
      title: 'Xếp Lớp & Bắt Đầu Học Tập',
      desc: 'Nhận thông báo xếp lớp, thời khóa biểu, phòng học và tài liệu học tập ngay trên Cổng học tập cá nhân.',
      icon: GraduationCap,
    },
  ];

  const faqs = [
    {
      question: 'Sinh viên Trường Đại Học Đà Lạt có được ưu đãi học phí không?',
      answer:
        'Có. Sinh viên chính quy của ĐH Đà Lạt khi xuất trình thẻ sinh viên còn hiệu lực sẽ được giảm ngay 10% - 15% học phí tùy theo từng chương trình đào tạo.',
    },
    {
      question: 'Người mới bắt đầu chưa có nền tảng công nghệ có học được không?',
      answer:
        'Hoàn toàn được. Các chương trình đào tạo tại trung tâm được thiết kế theo lộ trình chuẩn từ căn bản đến nâng cao. Giảng viên và trợ giảng sẽ hỗ trợ kèm cặp thực hành trực tiếp tại phòng máy.',
    },
    {
      question: 'Sau khi hoàn thành khóa học, học viên được cấp chứng chỉ gì?',
      answer:
        'Học viên đạt đủ điều kiện chuyên cần và bài thi tốt nghiệp sẽ được cấp Chứng nhận hoàn thành khóa học chính quy do Trường Đại Học Đà Lạt cấp, hoặc hỗ trợ đăng ký dự thi chứng chỉ quốc tế (MOS, IELTS) theo chuẩn toàn cầu.',
    },
    {
      question: 'Nếu bận việc đột xuất tôi có thể xin bảo lưu hoặc chuyển lớp không?',
      answer:
        'Học viên được quyền làm đơn xin bảo lưu kết quả học tập tối đa trong 06 tháng hoặc chuyển sang ca học khác cùng cấp độ nếu còn chỉ tiêu, hoàn toàn không phát sinh chi phí phụ trội.',
    },
    {
      question: 'Các hình thức thanh toán học phí tại trung tâm?',
      answer:
        'Học viên có thể thanh toán thuận tiện qua chuyển khoản ngân hàng 24/7 (quét mã QR tiện lợi có sẵn trong trang "Học phí của tôi") hoặc nộp trực tiếp tại Văn phòng tuyển sinh trung tâm (Phòng A101).',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 px-4 pt-16 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md">
            <Headphones className="h-4 w-4" />
            Phòng Đào Tạo & Tuyển Sinh DLU
          </span>

          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl text-white">
            Hỗ Trợ Tuyển Sinh & Tư Vấn Học Vụ
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-base text-blue-100/90 font-normal leading-relaxed">
            Đội ngũ tư vấn luôn sẵn sàng giải đáp mọi thắc mắc về lộ trình đào tạo, chính sách miễn giảm học phí và hỗ trợ thủ tục nhập học nhanh chóng nhất.
          </p>
        </div>
      </section>

      {/* 4 Contact Cards */}
      <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <PhoneCall className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hotline Tuyển Sinh</p>
            <p className="mt-1 text-base font-black text-slate-900">(0263) 3822 246</p>
            <p className="mt-1 text-xs text-slate-500">Giờ hành chính (7:30 - 17:00)</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tư Vấn Zalo / Di Động</p>
            <p className="mt-1 text-base font-black text-slate-900">0912 345 678</p>
            <p className="mt-1 text-xs text-slate-500">Hỗ trợ trực tuyến 24/7</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Phòng Đào Tạo</p>
            <p className="mt-1 text-sm font-black text-slate-900 truncate">phongdaotao@dlu.edu.vn</p>
            <p className="mt-1 text-xs text-slate-500">Phản hồi trong 24h làm việc</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Văn Phòng Trực Tiếp</p>
            <p className="mt-1 text-sm font-black text-slate-900">Phòng A101, Tòa nhà Trung tâm</p>
            <p className="mt-1 text-xs text-slate-500">ĐH Đà Lạt, 01 Phù Đổng Thiên Vương</p>
          </div>
        </div>
      </div>

      <main className="mx-auto mt-14 max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
        {/* Step by Step Admissions Workflow */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Quy Trình Nhập Học
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              4 Bước Đơn Giản Để Bắt Đầu Khóa Học
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hệ thống xử lý đăng ký tự động và nhanh chóng, đảm bảo trải nghiệm thuận lợi nhất cho học viên.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-black text-blue-600">{st.step}</span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{st.title}</h3>
                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form Consultation & FAQ Section */}
        <section className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Form */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900">Đăng Ký Tư Vấn Miễn Phí</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Vui lòng để lại thông tin, chuyên viên tuyển sinh của Trung tâm sẽ liên hệ tư vấn lộ trình và ưu đãi phù hợp.
            </p>

            {isSubmitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-emerald-900">Gửi Yêu Cầu Thành Công!</h3>
                <p className="mt-2 text-xs text-emerald-700 leading-relaxed">
                  Cảm ơn bạn <strong>{formData.fullName}</strong>. Chúng tôi đã tiếp nhận thông tin và sẽ gọi điện hỗ trợ bạn qua số điện thoại <strong>{formData.phone}</strong> trong thời gian sớm nhất.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      fullName: '',
                      phone: '',
                      email: '',
                      courseInterest: 'Lập trình Web Fullstack',
                      note: '',
                    });
                  }}
                >
                  Gửi yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Họ Và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Số Điện Thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Địa Chỉ Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Khóa Học Quan Tâm
                  </label>
                  <select
                    value={formData.courseInterest}
                    onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Lập trình Web Fullstack">Lập trình Web Fullstack Chuyên Nghiệp</option>
                    <option value="Phân tích Dữ liệu Python & AI">Phân tích Dữ liệu & Ứng dụng AI</option>
                    <option value="Luyện thi IELTS Target 6.5+">Luyện thi IELTS Cấp tốc Target 6.5+</option>
                    <option value="Lập trình Java Spring Boot">Lập trình Java Spring Boot Doanh nghiệp</option>
                    <option value="Tin học Văn phòng MOS">Tin học Văn phòng Quốc tế MOS</option>
                    <option value="Khác">Khóa học khác / Cần tư vấn thêm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Câu Hỏi Hoặc Ghi Chú Thêm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mục tiêu học tập, thời gian rảnh hoặc câu hỏi thắc mắc..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <Button type="submit" className="w-full justify-center">
                  Gửi Yêu Cầu Tư Vấn Tuyển Sinh
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-6 space-y-4">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Hỏi & Đáp Thường Gặp
              </span>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Giải Đáp Thắc Mắc Về Khóa Học
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
                    >
                      <span className="text-sm font-bold text-slate-900 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-600 border-t border-slate-100 bg-slate-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Student Discount Callout */}
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <BadgePercent className="h-4 w-4 text-amber-600" />
                Chính Sách Khuyến Học Sinh Viên DLU
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Đăng ký theo nhóm từ 3 người trở lên được giảm thêm 5% học phí mỗi học viên. Liên hệ hotline để được hướng dẫn thủ tục chiết khấu nhóm.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdmissionsSupportPage;

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Layers,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Layers,
      title: 'Công Nghệ & Phát Triển Phần Mềm',
      desc: 'Đào tạo kỹ năng Fullstack Web, Spring Boot, React, kiến trúc Microservices và kiểm thử phần mềm thực tế theo dự án doanh nghiệp.',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Sparkles,
      title: 'Dữ Liệu & Trí Tuệ Nhân Tạo (AI)',
      desc: 'Trang bị kiến thức phân tích dữ liệu kinh doanh, Python Data Science, Machine Learning và ứng dụng AI tự động hóa công việc.',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      icon: Award,
      title: 'Ngoại Ngữ Chuẩn Quốc Tế',
      desc: 'Luyện thi IELTS Target 6.5+, TOEIC 4 kỹ năng và tiếng Anh chuyên ngành với đội ngũ giảng viên giàu kinh nghiệm thực chiến.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: BookOpen,
      title: 'Tin Học Văn Phòng MOS & Đồ Họa',
      desc: 'Luyện thi chuẩn Microsoft Office Specialist (MOS) và thiết kế đồ họa ứng dụng, đáp ứng nhu cầu chuẩn đầu ra và công việc.',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  const highlights = [
    {
      title: 'Chương Trình Thực Chiến 80%',
      desc: 'Thời lượng thực hành phòng máy chiếm hơn 80%, làm bài tập và dự án thực tế sát nhu cầu tuyển dụng.',
    },
    {
      title: 'Chứng Chỉ Chuẩn Quốc Gia & Quốc Tế',
      desc: 'Học viên hoàn thành khóa học được cấp chứng nhận chính quy từ Trường Đại Học Đà Lạt hoặc chứng chỉ quốc tế tương ứng.',
    },
    {
      title: 'Giảng Viên Chuyên Môn Cao',
      desc: 'Đội ngũ tiến sĩ, thạc sĩ và chuyên gia đến từ các công ty công nghệ, doanh nghiệp đối tác hàng đầu.',
    },
    {
      title: 'Hỗ Trợ Học Tập & Việc Làm',
      desc: 'Học bù, học kèm, kết nối cơ hội thực tập và ngày hội việc làm hàng năm cho toàn bộ học viên của trung tâm.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 px-4 pt-16 pb-24 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md">
            <GraduationCap className="h-4 w-4" />
            Trường Đại Học Đà Lạt (DLU)
          </span>

          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white">
            Trung Tâm Đào Tạo Ngắn Hạn & Bồi Dưỡng Kỹ Năng
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed text-blue-100/90 font-normal">
            Nơi nâng bước sự nghiệp qua các chương trình đào tạo chuyên sâu, cấp tốc, bám sát thực tiễn công nghệ và tiêu chuẩn doanh nghiệp trong kỷ nguyên số.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/courses">
              <Button size="lg" className="shadow-lg shadow-blue-900/40">
                Khám Phá Khóa Học
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admissions">
              <Button variant="secondary" size="lg">
                Tư Vấn Tuyển Sinh
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Stats Overview */}
      <div className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:grid-cols-4 sm:p-8">
          <div className="text-center sm:border-r sm:border-slate-100">
            <p className="text-3xl sm:text-4xl font-black text-blue-600">15+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Năm Hoạt Động</p>
          </div>
          <div className="text-center sm:border-r sm:border-slate-100">
            <p className="text-3xl sm:text-4xl font-black text-indigo-600">12,000+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Học Viên Tốt Nghiệp</p>
          </div>
          <div className="text-center sm:border-r sm:border-slate-100">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600">96.8%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Hài Lòng Về Chất Lượng</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-amber-600">50+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh Nghiệp Liên Kết</p>
          </div>
        </div>
      </div>

      {/* Introduction & Mission */}
      <main className="mx-auto mt-16 max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Target className="h-4 w-4" />
              Sứ Mệnh & Tầm Nhìn
            </span>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Cung cấp kiến thức thực chiến, định hình tương lai số
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Trung tâm Đào tạo Ngắn hạn Đại học Đà Lạt được thành lập với mục tiêu trở thành cầu nối vững chắc giữa nhà trường và thị trường lao động. Chúng tôi liên tục cập nhật giáo trình theo công nghệ mới nhất, giúp học viên trang bị kỹ năng làm việc thực tế, tự tin ứng tuyển vào các tập đoàn lớn.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Mọi chương trình đào tạo tại trung tâm đều được thẩm định bởi Hội đồng Khoa học và các chuyên gia đầu ngành, đảm bảo tính chuẩn xác, sư phạm và hiệu quả ứng dụng cao nhất.
            </p>

            <div className="pt-2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">
                  Chứng chỉ do Hiệu trưởng Trường Đại Học Đà Lạt ký duyệt
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              Giá Trị Cốt Lõi Của Trung Tâm
            </h3>
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
                <p className="font-bold text-sm text-blue-900">Chất lượng là tiên quyết (Quality First)</p>
                <p className="text-xs text-slate-600 mt-1">Lấy sự tiến bộ và năng lực thực tế của người học làm thước đo đánh giá chất lượng khóa đào tạo.</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
                <p className="font-bold text-sm text-blue-900">Thực chiến & Hội nhập (Action-oriented)</p>
                <p className="text-xs text-slate-600 mt-1">Học đi đôi với hành, cập nhật liên tục các chuẩn mực công nghệ thế giới.</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
                <p className="font-bold text-sm text-blue-900">Đồng hành & Tận tâm (Student-centered)</p>
                <p className="text-xs text-slate-600 mt-1">Đội ngũ giảng viên và giáo vụ luôn đồng hành hỗ trợ học viên từ ngày khai giảng đến khi hoàn tất chứng chỉ.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Lĩnh Vực Đào Tạo
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              4 Trụ Cột Đào Tạo Trọng Tâm
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Được thiết kế linh hoạt cho sinh viên, người đi làm và doanh nghiệp cần đào tạo nhân sự theo yêu cầu.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${pillar.color} mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                      Xem các lớp mở
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Facilities & Faculty */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Cơ Sở Vật Chất & Môi Trường Học
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Phòng Lab Chuẩn Hiện Đại Giữa Thành Phố Ngàn Hoa
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Nằm trong khuôn viên Đại học Đà Lạt - một trong những ngôi trường có cảnh quan đẹp và thơ mộng nhất Việt Nam, Trung tâm sở hữu hệ thống phòng học chuyên dụng hiện đại:
              </p>
              <ul className="mt-5 space-y-3">
                {highlights.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-slate-900">{item.title}: </strong>
                      <span className="text-slate-600 text-xs sm:text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 text-white flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200">
                  <MapPin className="h-3.5 w-3.5" />
                  Địa Điểm Đào Tạo
                </span>
                <h3 className="mt-4 text-xl font-bold">Trường Đại Học Đà Lạt (DLU)</h3>
                <p className="mt-2 text-xs text-blue-100/80 leading-relaxed">
                  Số 01 Phù Đổng Thiên Vương, Phường 8, Thành phố Đà Lạt, Tỉnh Lâm Đồng.
                </p>
                <div className="mt-6 space-y-2.5 text-xs text-blue-100">
                  <p className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-blue-300" />
                    <span>Hotline: (0263) 3822 246 - (0263) 3822 093</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-300" />
                    <span>Giờ làm việc: Thứ 2 – Thứ 7 (7:30 - 17:00)</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Link to="/admissions">
                  <Button variant="secondary" className="w-full justify-center">
                    Gửi Yêu Cầu Tư Vấn Ngay
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;

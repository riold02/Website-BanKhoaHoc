import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  HelpCircle,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../../context/auth.context";
import { studentApi } from "../../services/student.api";
import {
  StudentAttendanceItem,
  StudentGradeItem,
  StudentScheduleItem,
} from "../../types/learning.types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatters";

type PortalTab = "schedule" | "attendance" | "grades";

const attendanceLabels = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Đi trễ",
  EXCUSED: "Có phép",
};

const attendanceVariants = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  EXCUSED: "info",
} as const;

export const LearningPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PortalTab>("schedule");
  const [schedule, setSchedule] = useState<StudentScheduleItem[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceItem[]>([]);
  const [grades, setGrades] = useState<StudentGradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      studentApi.getMySchedule(),
      studentApi.getMyAttendance(),
      studentApi.getMyGrades(),
    ])
      .then(([scheduleData, attendanceData, gradeData]) => {
        setSchedule(scheduleData);
        setAttendance(attendanceData);
        setGrades(gradeData);
      })
      .catch((requestError: any) =>
        setError(
          requestError.message || "Không thể tải thông tin cổng học tập",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalClasses = schedule.length;
    let totalSessionsCount = 0;
    let completedSessionsCount = 0;

    for (const item of schedule) {
      totalSessionsCount += item.class.sessions?.length || 0;
      completedSessionsCount +=
        item.class.sessions?.filter((s) => s.status === "COMPLETED").length ||
        0;
    }

    let totalRecorded = 0;
    let totalPresent = 0;
    for (const att of attendance) {
      totalRecorded += att.summary?.recordedSessions || 0;
      const presentCount = att.sessions.filter(
        (s) =>
          s.attendance?.status === "PRESENT" ||
          s.attendance?.status === "EXCUSED",
      ).length;
      totalPresent += presentCount;
    }

    const attendanceRate =
      totalRecorded > 0
        ? Math.round((totalPresent / totalRecorded) * 100)
        : 100;

    // Grades summary
    const scoredCourses = grades.filter(
      (g) => g.finalScore !== null && g.finalScore !== undefined,
    );
    const avgScore =
      scoredCourses.length > 0
        ? (
            scoredCourses.reduce(
              (sum, g) => sum + Number(g.finalScore || 0),
              0,
            ) / scoredCourses.length
          ).toFixed(1)
        : null;

    return {
      totalClasses,
      totalSessionsCount,
      completedSessionsCount,
      attendanceRate,
      avgScore,
    };
  }, [schedule, attendance, grades]);

  const tabs = [
    {
      id: "schedule" as const,
      label: "Lịch Học & Buổi Học",
      icon: CalendarDays,
    },
    {
      id: "attendance" as const,
      label: "Điểm Danh & Chuyên Cần",
      icon: UserCheck,
    },
    {
      id: "grades" as const,
      label: "Bảng Điểm & Kết Quả",
      icon: GraduationCap,
    },
  ];

  const primaryClass = schedule[0]?.class;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Banner */}
      <section className="relative min-h-[252px] overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 px-4 pt-12 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md">
                <GraduationCap className="h-4 w-4" />
                Cổng Học Viên Chính Quy
              </span>
              <h1 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white">
                Xin chào,{" "}
                {user?.profile?.fullName || user?.username || "Học viên"}!
              </h1>
              <p className="mt-2 text-sm text-blue-100/80 max-w-2xl">
                Mã học viên:{" "}
                <strong className="text-white font-mono">
                  {user?.student?.studentCode || "HV-2026-001"}
                </strong>{" "}
                · Theo dõi toàn bộ lịch học, tiến độ điểm danh chuyên cần và kết
                quả thi tốt nghiệp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/my-tuition">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<WalletCards className="h-4 w-4" />}
                >
                  Xem Học Phí
                </Button>
              </Link>
              <Link to="/my-registrations">
                <Button size="sm" icon={<ShieldCheck className="h-4 w-4" />}>
                  Đơn của tôi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Balanced 4-Column Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lớp Đang Học
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.totalClasses}{" "}
              <span className="text-sm font-normal text-slate-500">Lớp</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Đang hoạt động trong kỳ
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Buổi Đã Học
              </span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock3 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.completedSessionsCount}
              <span className="text-sm font-normal text-slate-500">
                /{metrics.totalSessionsCount || 0} buổi
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tiến độ lộ trình khóa học
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tỷ Lệ Chuyên Cần
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
              {metrics.attendanceRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {metrics.attendanceRate >= 80
                ? "Đủ điều kiện dự thi"
                : "Cần chú ý chuyên cần"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Điểm Đánh Giá
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.avgScore ? `${metrics.avgScore}/10` : "Đang học"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Kết quả tổng kết môn</p>
          </div>
        </div>

        {/* 2-Column Balanced Workspace */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Interactive Tabs & Content (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tab Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="grid grid-cols-3 gap-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs sm:text-sm font-semibold transition ${
                      activeTab === id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Panes */}
            {isLoading ? (
              <StatePanel
                icon={
                  <Clock3 className="h-8 w-8 animate-pulse text-blue-600" />
                }
                message="Đang đồng bộ dữ liệu học tập của bạn..."
              />
            ) : error ? (
              <StatePanel
                icon={<AlertCircle className="h-8 w-8 text-rose-500" />}
                message={error}
                error
              />
            ) : (
              <div>
                {activeTab === "schedule" && (
                  <ScheduleSection items={schedule} />
                )}
                {activeTab === "attendance" && (
                  <AttendanceSection items={attendance} />
                )}
                {activeTab === "grades" && <GradesSection items={grades} />}
              </div>
            )}
          </div>

          {/* Right Column: Contextual Cards, Active Class Info & Links (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Active Class Summary Card */}
            {primaryClass ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    Lớp Học Đang Diễn Ra
                  </span>
                  <Badge variant="success" size="sm">
                    Đang học
                  </Badge>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {primaryClass.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {primaryClass.classCode}
                  </p>

                  <div className="mt-4 space-y-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        {primaryClass.room || "Phòng học chuyên dụng Lab A101"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        {primaryClass.scheduleDescription ||
                          "Thứ 2, 4, 6 (18:00 - 20:30)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Lối Tắt Học Vụ
              </h3>

              <div className="space-y-2">
                <Link
                  to="/my-tuition"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <WalletCards className="h-4 w-4 text-blue-600" />
                    <span>Học phí & Hóa đơn</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  to="/my-registrations"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Đơn đăng ký của tôi</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  to="/courses"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <span>Khám phá khóa học mới</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Learning Policy & Support Box */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                Hỗ Trợ Học Viên & Quy Chế
              </div>
              <p className="text-xs text-blue-800/90 leading-relaxed">
                Học viên cần đạt tối thiểu <strong>80% số buổi có mặt</strong>{" "}
                và hoàn thành đầy đủ bài tập thực hành để đủ điều kiện xét cấp
                chứng chỉ khóa học.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-200/60 text-xs text-blue-900 space-y-1">
                <p className="flex items-center gap-2">
                  <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    Hotline Giáo vụ: <strong>(0263) 3822 246</strong>
                  </span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// Section: Schedule
const ScheduleSection: React.FC<{ items: StudentScheduleItem[] }> = ({
  items,
}) =>
  items.length === 0 ? (
    <Empty message="Bạn chưa được xếp vào lớp học nào. Vui lòng kiểm tra lại đơn đăng ký hoặc liên hệ giáo vụ." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-semibold text-blue-600">
                  {item.class.classCode}
                </p>
                <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
                  {item.class.period?.course?.title || item.class.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {item.class.name} ·{" "}
                  {item.class.room || "Phòng máy Lab chuyên dụng"}
                </p>
              </div>
              <Badge
                variant={
                  item.enrollmentStatus === "COMPLETED" ? "slate" : "success"
                }
              >
                {item.enrollmentStatus === "COMPLETED"
                  ? "Đã hoàn thành"
                  : "Đang theo học"}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              Lịch học:{" "}
              <strong>
                {item.class.scheduleDescription ||
                  "Lịch học cập nhật theo thời khóa biểu"}
              </strong>
            </p>
          </div>

          <div className="p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Danh sách các buổi học
            </h4>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {item.class.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-blue-200 transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800">
                      Buổi {session.sessionNumber}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                      {formatDate(session.sessionDate)}
                      {session.topic ? ` · ${session.topic}` : ""}
                    </p>
                  </div>
                  <Badge
                    size="sm"
                    variant={
                      session.status === "COMPLETED" ? "success" : "primary"
                    }
                  >
                    {session.status === "COMPLETED" ? "Đã học" : "Sắp học"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );

// Section: Attendance
const AttendanceSection: React.FC<{ items: StudentAttendanceItem[] }> = ({
  items,
}) =>
  items.length === 0 ? (
    <Empty message="Chưa có dữ liệu điểm danh cho khóa học này." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="font-mono text-xs font-semibold text-blue-600">
                {item.class.classCode}
              </p>
              <h2 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                {item.class.period?.course?.title || item.class.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-slate-900">
                {item.summary?.recordedSessions || 0}/
                {item.summary?.totalSessions || 0}
              </p>
              <p className="text-[11px] text-slate-500">
                buổi đã ghi nhận · vắng {item.summary?.absenceRate ?? 0}%
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {item.sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/60 transition"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Buổi {session.sessionNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDate(session.sessionDate)}
                    {session.topic ? ` · ${session.topic}` : ""}
                  </p>
                </div>
                {session.attendance ? (
                  <Badge
                    variant={attendanceVariants[session.attendance.status]}
                  >
                    {attendanceLabels[session.attendance.status]}
                  </Badge>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Chưa điểm danh
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

// Section: Grades
const GradesSection: React.FC<{ items: StudentGradeItem[] }> = ({ items }) =>
  items.length === 0 ? (
    <Empty message="Chưa có bảng điểm cá nhân được công bố." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="font-mono text-xs font-semibold text-blue-600">
                {item.class.classCode}
              </p>
              <h2 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                {item.class.period?.course?.title || item.class.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {item.finalScore !== null && item.finalScore !== undefined ? (
                <span className="text-2xl font-black text-slate-900">
                  {item.finalScore}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Chưa hoàn tất điểm
                </span>
              )}
              <Badge
                variant={
                  item.academicResult === "FAIL"
                    ? "error"
                    : item.academicResult === "DISTINCTION"
                      ? "success"
                      : item.academicResult === "PASS"
                        ? "primary"
                        : "slate"
                }
              >
                {item.academicResult || "Đang cập nhật"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {item.grades.map((grade) => (
              <div
                key={grade.componentId}
                className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {grade.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.round(grade.weight * 100)}%
                  </span>
                </div>
                <p
                  className={`mt-2 text-2xl font-black ${
                    grade.score !== null &&
                    grade.score !== undefined &&
                    grade.score < 4
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {grade.score ?? "--"}
                </p>
                {grade.feedback && (
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    {grade.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

const Empty: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
    <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
    <p className="text-sm font-semibold text-slate-700">{message}</p>
  </div>
);

const StatePanel: React.FC<{
  icon: React.ReactNode;
  message: string;
  error?: boolean;
}> = ({ icon, message, error }) => (
  <div
    className={`rounded-3xl border bg-white px-6 py-16 text-center shadow-sm ${
      error
        ? "border-rose-200 text-rose-700"
        : "border-slate-200 text-slate-500"
    }`}
  >
    <div className="mb-3 flex justify-center">{icon}</div>
    <p className="text-sm font-semibold">{message}</p>
  </div>
);

export default LearningPortalPage;

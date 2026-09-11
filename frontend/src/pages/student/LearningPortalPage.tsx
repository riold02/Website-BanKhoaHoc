import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { studentApi } from "../../services/student.api";
import {
  StudentAttendanceItem,
  StudentGradeItem,
  StudentScheduleItem,
} from "../../types/learning.types";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/formatters";

type PortalTab = "schedule" | "attendance" | "grades";

const attendanceLabels = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Trễ",
  EXCUSED: "Miễn",
};
const attendanceVariants = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  EXCUSED: "info",
} as const;

export const LearningPortalPage: React.FC = () => {
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
        setError(requestError.message || "Không thể tải cổng học tập"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const tabs = [
    { id: "schedule" as const, label: "Lịch học", icon: CalendarDays },
    { id: "attendance" as const, label: "Điểm danh", icon: UserCheck },
    { id: "grades" as const, label: "Bảng điểm", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 px-4 pb-16 pt-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100">
            <GraduationCap className="h-3.5 w-3.5" />
            Cổng học tập cá nhân
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Lớp học của tôi
          </h1>
          <p className="mt-2 max-w-xl text-sm text-blue-100/80">
            Theo dõi lịch học, chuyên cần và kết quả học tập trong một màn hình.
          </p>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition sm:text-sm ${activeTab === id ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <StatePanel
            icon={<Clock3 className="h-8 w-8 animate-pulse" />}
            message="Đang tải dữ liệu học tập..."
          />
        ) : error ? (
          <StatePanel
            icon={<AlertCircle className="h-8 w-8 text-rose-400" />}
            message={error}
            error
          />
        ) : (
          <div className="mt-4">
            {activeTab === "schedule" && <ScheduleSection items={schedule} />}
            {activeTab === "attendance" && (
              <AttendanceSection items={attendance} />
            )}
            {activeTab === "grades" && <GradesSection items={grades} />}
          </div>
        )}
      </main>
    </div>
  );
};

const ScheduleSection: React.FC<{ items: StudentScheduleItem[] }> = ({
  items,
}) =>
  items.length === 0 ? (
    <Empty message="Bạn chưa được xếp vào lớp học nào." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-blue-600">
                  {item.class.classCode}
                </p>
                <h2 className="mt-1 text-base font-bold text-slate-900">
                  {item.class.period.course.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {item.class.name} · {item.class.room || "Chưa xếp phòng"}
                </p>
              </div>
              <Badge
                variant={
                  item.enrollmentStatus === "COMPLETED" ? "slate" : "success"
                }
              >
                {item.enrollmentStatus === "COMPLETED"
                  ? "Đã hoàn thành"
                  : "Đang học"}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              {item.class.scheduleDescription || "Lịch học đang được cập nhật"}
            </p>
          </div>
          <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {item.class.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Buổi {session.sessionNumber}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatDate(session.sessionDate)}
                    {session.topic ? ` · ${session.topic}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    session.status === "COMPLETED" ? "success" : "primary"
                  }
                >
                  {session.status === "COMPLETED" ? "Đã học" : "Sắp học"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

const AttendanceSection: React.FC<{ items: StudentAttendanceItem[] }> = ({
  items,
}) =>
  items.length === 0 ? (
    <Empty message="Chưa có dữ liệu điểm danh." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="font-mono text-xs text-blue-600">
                {item.class.classCode}
              </p>
              <h2 className="mt-1 text-sm font-bold text-slate-900">
                {item.class.period.course.title}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-slate-900">
                {item.summary.recordedSessions}/{item.summary.totalSessions}
              </p>
              <p className="text-[11px] text-slate-500">
                buổi đã điểm danh · vắng {item.summary.absenceRate}%
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {item.sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between gap-3 px-5 py-3"
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

const GradesSection: React.FC<{ items: StudentGradeItem[] }> = ({ items }) =>
  items.length === 0 ? (
    <Empty message="Chưa có bảng điểm cá nhân." />
  ) : (
    <div className="space-y-4">
      {items.map((item) => (
        <section
          key={item.enrollmentId}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="font-mono text-xs text-blue-600">
                {item.class.classCode}
              </p>
              <h2 className="mt-1 text-sm font-bold text-slate-900">
                {item.class.period.course.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {item.finalScore !== null && item.finalScore !== undefined ? (
                <span className="text-2xl font-extrabold text-slate-900">
                  {item.finalScore}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Chưa đủ điểm</span>
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
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {grade.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {Math.round(grade.weight * 100)}%
                  </span>
                </div>
                <p
                  className={`mt-2 text-xl font-bold ${grade.score !== null && grade.score !== undefined && grade.score < 4 ? "text-rose-700" : "text-slate-900"}`}
                >
                  {grade.score ?? "--"}
                </p>
                {grade.feedback && (
                  <p className="mt-1 text-[11px] text-slate-500">
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
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
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
    className={`mt-4 rounded-2xl border bg-white px-6 py-16 text-center shadow-sm ${error ? "border-rose-200 text-rose-700" : "border-slate-200 text-slate-500"}`}
  >
    <div className="mb-3 flex justify-center">{icon}</div>
    <p className="text-sm font-semibold">{message}</p>
  </div>
);

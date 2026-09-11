import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  Clock3,
  DoorOpen,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { classApi } from "../../services/class.api";
import {
  AttendanceStatus,
  ClassSession,
  ClassStatus,
  Gradebook,
  ManagedClass,
} from "../../types/class.types";
import { Registration } from "../../types/enrollment.types";
import { registrationApi } from "../../services/registration.api";
import { enrollmentPeriodApi } from "../../services/enrollment-period.api";
import { EnrollmentPeriod } from "../../types/enrollment.types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { formatDate } from "../../utils/formatters";

const statusLabels: Record<ClassStatus, string> = {
  PLANNING: "Đang chuẩn bị",
  ACTIVE: "Đang học",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusVariants: Record<
  ClassStatus,
  "primary" | "success" | "slate" | "error"
> = {
  PLANNING: "primary",
  ACTIVE: "success",
  COMPLETED: "slate",
  CANCELLED: "error",
};

export const ClassManagementPage: React.FC = () => {
  const [classes, setClasses] = useState<ManagedClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<ManagedClass | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ClassStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setClasses(await classApi.getClasses());
    } catch (requestError: any) {
      setError(requestError.message || "Không thể tải danh sách lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return classes.filter((classRecord) => {
      const matchesStatus = status === "ALL" || classRecord.status === status;
      const matchesSearch =
        !keyword ||
        [
          classRecord.classCode,
          classRecord.name,
          classRecord.period.name,
          classRecord.period.course.title,
          classRecord.period.course.courseCode,
        ].some((value) => value.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [classes, search, status]);

  const openDetails = async (classRecord: ManagedClass) => {
    try {
      const [details, sessions] = await Promise.all([
        classApi.getClassById(classRecord.id),
        classApi.getSessions(classRecord.id),
      ]);
      setSelectedClass({ ...details, sessions });
    } catch (requestError: any) {
      setError(requestError.message || "Không thể tải chi tiết lớp học");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Quản Lý Danh Sách Lớp Học
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi lớp học, lịch khai giảng và danh sách học viên đã phân bổ
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700">
            {classes.length} lớp
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-2">
            {classes.reduce(
              (total, item) => total + item.enrollments.length,
              0,
            )}{" "}
            học viên
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Tạo lớp
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo mã lớp, tên lớp hoặc khóa học..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "ALL" | ClassStatus)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:w-52"
          aria-label="Lọc trạng thái lớp học"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <Button variant="ghost" size="sm" onClick={loadClasses}>
            Thử lại
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Lớp học</th>
                <th className="px-6 py-3 font-semibold">Khóa học / Đợt</th>
                <th className="px-6 py-3 font-semibold">Lịch & phòng</th>
                <th className="px-6 py-3 font-semibold">Sĩ số</th>
                <th className="px-6 py-3 font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-right font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <Clock3 className="mx-auto mb-2 h-6 w-6 animate-pulse" />
                    Đang tải danh sách lớp học...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-slate-400"
                  >
                    <GraduationCap className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      Chưa có lớp học phù hợp
                    </p>
                    <p className="mt-1 text-xs">
                      Thử thay đổi từ khóa hoặc bộ lọc trạng thái
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((classRecord) => {
                  const enrolled = classRecord.enrollments.length;
                  return (
                    <tr
                      key={classRecord.id}
                      className="transition hover:bg-blue-50/30"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-blue-700">
                          {classRecord.classCode}
                        </div>
                        <div className="mt-0.5 font-semibold text-slate-900">
                          {classRecord.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {classRecord.period.course.title}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {classRecord.period.course.courseCode} ·{" "}
                          {classRecord.period.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(classRecord.startDate)}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                          {classRecord.room || "Chưa xếp phòng"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {enrolled} / {classRecord.maxStudents}
                        </div>
                        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(100, (enrolled / classRecord.maxStudents) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariants[classRecord.status]}>
                          {statusLabels[classRecord.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronRight className="h-4 w-4" />}
                          onClick={() => openDetails(classRecord)}
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass?.name || "Chi tiết lớp học"}
        description={
          selectedClass
            ? `${selectedClass.classCode} · ${selectedClass.period.course.title}`
            : undefined
        }
        maxWidth="5xl"
      >
        {selectedClass && (
          <ClassDetail
            classRecord={selectedClass}
            onClose={() => setSelectedClass(null)}
            onAllocated={async (updatedClass) => {
              const sessions = await classApi.getSessions(updatedClass.id);
              setSelectedClass({ ...updatedClass, sessions });
              await loadClasses();
            }}
            onDeleted={async () => {
              setSelectedClass(null);
              await loadClasses();
            }}
          />
        )}
      </Modal>
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await loadClasses();
        }}
      />
    </div>
  );
};

const toIsoDate = (value: string) =>
  value ? `${value}T00:00:00.000Z` : undefined;

const CreateClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}> = ({ isOpen, onClose, onCreated }) => {
  const [periods, setPeriods] = useState<EnrollmentPeriod[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [classCode, setClassCode] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    enrollmentPeriodApi
      .getPeriods({ limit: 100 })
      .then((result) => {
        setPeriods(result.periods);
        if (!periodId && result.periods[0]) {
          setPeriodId(result.periods[0].id);
          setStartDate(result.periods[0].expectedStartDate?.slice(0, 10) || "");
        }
      })
      .catch((requestError: any) =>
        setError(requestError.message || "Không thể tải đợt tuyển sinh"),
      )
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const selectedPeriod = periods.find((period) => period.id === periodId);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!periodId || !classCode.trim() || !name.trim() || !startDate) {
      setError("Vui lòng chọn đợt và nhập mã lớp, tên lớp, ngày bắt đầu");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await classApi.createClass({
        periodId,
        classCode: classCode.trim().toUpperCase(),
        name: name.trim(),
        room: room.trim() || null,
        scheduleDescription: scheduleDescription.trim() || null,
        maxStudents,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
      });
      setClassCode("");
      setName("");
      await onCreated();
    } catch (requestError: any) {
      setError(requestError.message || "Không thể tạo lớp học");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo lớp học"
      description="Tạo lớp từ một đợt tuyển sinh đã có"
      maxWidth="xl"
    >
      <form className="space-y-4" onSubmit={save}>
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải đợt tuyển sinh...
          </div>
        ) : (
          <>
            <Field label="Đợt tuyển sinh *">
              <select
                value={periodId}
                onChange={(event) => {
                  setPeriodId(event.target.value);
                  const period = periods.find(
                    (item) => item.id === event.target.value,
                  );
                  if (period?.expectedStartDate)
                    setStartDate(period.expectedStartDate.slice(0, 10));
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Chọn đợt tuyển sinh</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.periodCode} · {period.name}
                  </option>
                ))}
              </select>
              {selectedPeriod && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Khóa học:{" "}
                  {selectedPeriod.course?.title || selectedPeriod.courseId}
                </p>
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mã lớp *">
                <Input
                  value={classCode}
                  onChange={(event) => setClassCode(event.target.value)}
                  placeholder="VD: WEB-K15-A"
                />
              </Field>
              <Field label="Tên lớp *">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Lập trình Web K15 - Lớp A"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phòng học">
                <Input
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="Phòng A101"
                />
              </Field>
              <Field label="Sĩ số tối đa">
                <Input
                  type="number"
                  min={1}
                  value={maxStudents}
                  onChange={(event) =>
                    setMaxStudents(Number(event.target.value))
                  }
                />
              </Field>
            </div>
            <Field label="Mô tả lịch học">
              <Input
                value={scheduleDescription}
                onChange={(event) => setScheduleDescription(event.target.value)}
                placeholder="Thứ 2, 4, 6 - 18:00"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngày bắt đầu *">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </Field>
              <Field label="Ngày kết thúc">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </Field>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            icon={<Plus className="h-4 w-4" />}
          >
            Tạo lớp
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-slate-700">
      {label}
    </span>
    {children}
  </label>
);

const GenerateSessionsModal: React.FC<{
  isOpen: boolean;
  classRecord: ManagedClass;
  onClose: () => void;
  onGenerated: (sessions: ClassSession[]) => void;
}> = ({ isOpen, classRecord, onClose, onGenerated }) => {
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [sessionCount, setSessionCount] = useState(12);
  const [startDate, setStartDate] = useState(
    classRecord.startDate?.slice(0, 10) || "",
  );
  const [topicPrefix, setTopicPrefix] = useState("Buổi học");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dayLabels = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "CN",
  ];

  useEffect(() => {
    if (isOpen && classRecord.startDate) {
      setStartDate(classRecord.startDate.slice(0, 10));
    }
  }, [isOpen, classRecord.startDate]);

  const toggleDay = (day: number) =>
    setWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort(),
    );
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!weekdays.length || !sessionCount || !startDate) {
      setError("Vui lòng chọn ít nhất một thứ, số buổi và ngày bắt đầu");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const sessions = await classApi.generateSessions(classRecord.id, {
        weekdays,
        sessionCount,
        startDate: toIsoDate(startDate),
        topicPrefix: topicPrefix.trim() || null,
      });
      onGenerated(sessions);
    } catch (requestError: any) {
      setError(requestError.message || "Không thể sinh lịch học");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sinh lịch học"
      description="Chọn các thứ trong tuần và số buổi cần tạo"
      maxWidth="md"
    >
      <form className="space-y-4" onSubmit={save}>
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        <Field label="Các ngày học trong tuần *">
          <div className="grid grid-cols-4 gap-2">
            {dayLabels.map((label, index) => {
              const day = index + 1;
              return (
                <label
                  key={day}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${weekdays.includes(day) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  <input
                    type="checkbox"
                    checked={weekdays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="h-3.5 w-3.5 text-blue-600"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Số buổi *">
            <Input
              type="number"
              min={1}
              max={200}
              value={sessionCount}
              onChange={(event) => setSessionCount(Number(event.target.value))}
            />
          </Field>
          <Field label="Ngày bắt đầu *">
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Tiêu đề buổi học">
          <Input
            value={topicPrefix}
            onChange={(event) => setTopicPrefix(event.target.value)}
            placeholder="Buổi học"
          />
        </Field>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          Lịch hiện tại: {classRecord.scheduleDescription || "Chưa mô tả"}. Lịch
          chỉ được sinh một lần cho mỗi lớp.
        </p>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            icon={<CalendarPlus className="h-4 w-4" />}
          >
            Sinh lịch
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const GradeComponentsModal: React.FC<{
  isOpen: boolean;
  classId: string;
  onClose: () => void;
  onConfigured: () => void;
}> = ({ isOpen, classId, onClose, onConfigured }) => {
  const [components, setComponents] = useState<
    Array<{ id?: string; name: string; weight: number }>
  >([
    { name: "Chuyên cần", weight: 0.1 },
    { name: "Giữa kỳ", weight: 0.3 },
    { name: "Cuối kỳ", weight: 0.6 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalWeight = components.reduce(
    (sum, component) => sum + Number(component.weight || 0),
    0,
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setIsLoading(true);
    classApi
      .getGradebook(classId)
      .then((gradebook) => {
        if (gradebook.gradeComponents.length)
          setComponents(
            gradebook.gradeComponents.map((component) => ({
              id: component.id,
              name: component.name,
              weight: component.weight,
            })),
          );
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [isOpen, classId]);

  const updateComponent = (
    index: number,
    field: "name" | "weight",
    value: string,
  ) =>
    setComponents((current) =>
      current.map((component, itemIndex) =>
        itemIndex === index
          ? {
              ...component,
              [field]: field === "weight" ? Number(value) : value,
            }
          : component,
      ),
    );
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      Math.abs(totalWeight - 1) > 0.0001 ||
      components.some((component) => !component.name.trim())
    ) {
      setError("Tên đầu điểm không được trống và tổng tỷ trọng phải bằng 100%");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await classApi.configureGradeComponents(classId, components);
      onConfigured();
    } catch (requestError: any) {
      setError(requestError.message || "Không thể lưu cấu hình đầu điểm");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình đầu điểm"
      description="Tổng tỷ trọng các đầu điểm phải bằng 100%"
      maxWidth="lg"
    >
      <form className="space-y-4" onSubmit={save}>
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center p-8 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {components.map((component, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_110px] items-end gap-3 rounded-lg border border-slate-200 p-3"
              >
                <Field label={`Đầu điểm ${index + 1}`}>
                  <Input
                    value={component.name}
                    onChange={(event) =>
                      updateComponent(index, "name", event.target.value)
                    }
                  />
                </Field>
                <Field label="Tỷ trọng">
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={component.weight}
                    onChange={(event) =>
                      updateComponent(index, "weight", event.target.value)
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
        )}
        <div
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${Math.abs(totalWeight - 1) < 0.0001 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
        >
          Tổng tỷ trọng: {Math.round(totalWeight * 100)}%
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            icon={<Settings2 className="h-4 w-4" />}
          >
            Lưu cấu hình
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ClassDetail: React.FC<{
  classRecord: ManagedClass;
  onClose: () => void;
  onAllocated: (updatedClass: ManagedClass) => Promise<void>;
  onDeleted: () => Promise<void>;
}> = ({ classRecord, onClose, onAllocated, onDeleted }) => {
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [candidates, setCandidates] = useState<Registration[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(
    null,
  );
  const [attendanceSession, setAttendanceSession] =
    useState<ClassSession | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isGradeConfigOpen, setIsGradeConfigOpen] = useState(false);
  const [gradebook, setGradebook] = useState<Gradebook | null>(null);
  const [isLoadingGradebook, setIsLoadingGradebook] = useState(false);
  const [gradebookError, setGradebookError] = useState<string | null>(null);
  const [removingEnrollmentId, setRemovingEnrollmentId] = useState<
    string | null
  >(null);
  const [removalCandidate, setRemovalCandidate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const remainingCapacity = Math.max(
    0,
    classRecord.maxStudents - classRecord.enrollments.length,
  );

  const loadCandidates = async () => {
    try {
      setIsAllocationOpen(true);
      setIsLoadingCandidates(true);
      setAllocationError(null);
      setAllocationSuccess(null);
      setSelectedIds([]);
      const result = await registrationApi.getRegistrations({
        periodId: classRecord.periodId,
        status: "APPROVED",
        limit: 100,
      });
      const enrolledStudentIds = new Set(
        classRecord.enrollments.map((enrollment) => enrollment.studentId),
      );
      setCandidates(
        result.registrations.filter(
          (registration) =>
            registration.invoice?.paymentStatus === "PAID" &&
            !enrolledStudentIds.has(registration.studentId),
        ),
      );
    } catch (requestError: any) {
      setAllocationError(
        requestError.message || "Không thể tải danh sách học viên đủ điều kiện",
      );
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const toggleCandidate = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const selectAllCandidates = () => {
    setSelectedIds(
      selectedIds.length === Math.min(candidates.length, remainingCapacity)
        ? []
        : candidates
            .slice(0, remainingCapacity)
            .map((candidate) => candidate.id),
    );
  };

  const allocate = async () => {
    if (!selectedIds.length) return;
    try {
      setIsAllocating(true);
      setAllocationError(null);
      const updatedClass = await classApi.allocateStudents(
        classRecord.id,
        selectedIds,
      );
      setAllocationSuccess(`Đã phân bổ ${selectedIds.length} học viên vào lớp`);
      setSelectedIds([]);
      setCandidates((current) =>
        current.filter((candidate) => !selectedIds.includes(candidate.id)),
      );
      await onAllocated(updatedClass);
    } catch (requestError: any) {
      setAllocationError(requestError.message || "Không thể phân bổ học viên");
    } finally {
      setIsAllocating(false);
    }
  };

  const selectedCandidates = candidates.filter((candidate) =>
    selectedIds.includes(candidate.id),
  );
  const availableCandidates = candidates.filter(
    (candidate) => !selectedIds.includes(candidate.id),
  );

  const loadGradebook = async () => {
    try {
      setIsLoadingGradebook(true);
      setGradebookError(null);
      setGradebook(await classApi.getGradebook(classRecord.id));
    } catch (requestError: any) {
      setGradebookError(requestError.message || "Không thể tải sổ điểm");
    } finally {
      setIsLoadingGradebook(false);
    }
  };

  const removeStudent = async () => {
    if (!removalCandidate) return;
    try {
      setRemovingEnrollmentId(removalCandidate.id);
      const updatedClass = await classApi.removeStudent(
        classRecord.id,
        removalCandidate.id,
      );
      setRemovalCandidate(null);
      await onAllocated(updatedClass);
    } catch (requestError: any) {
      setAllocationError(
        requestError.message || "Không thể xóa học viên khỏi lớp",
      );
    } finally {
      setRemovingEnrollmentId(null);
    }
  };

  const deleteClass = async () => {
    if (deleteConfirmation.trim() !== classRecord.classCode) return;
    try {
      setIsDeletingClass(true);
      setDeleteError(null);
      await classApi.deleteClass(classRecord.id);
      setIsDeleteOpen(false);
      await onDeleted();
    } catch (requestError: any) {
      setDeleteError(requestError.message || "Không thể xóa lớp học");
    } finally {
      setIsDeletingClass(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat label="Mã lớp" value={classRecord.classCode} />
        <DetailStat
          label="Sĩ số"
          value={`${classRecord.enrollments.length}/${classRecord.maxStudents}`}
        />
        <DetailStat
          label="Khai giảng"
          value={formatDate(classRecord.startDate)}
        />
        <DetailStat label="Phòng học" value={classRecord.room || "Chưa xếp"} />
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-b border-slate-100 pb-4">
        <Button
          variant="outline"
          size="sm"
          icon={<CalendarPlus className="h-4 w-4" />}
          onClick={() => setIsScheduleOpen(true)}
          disabled={Boolean(classRecord.sessions?.length)}
        >
          {classRecord.sessions?.length ? "Đã sinh lịch" : "Sinh lịch học"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Settings2 className="h-4 w-4" />}
          onClick={() => setIsGradeConfigOpen(true)}
        >
          Cấu hình đầu điểm
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => {
            setDeleteConfirmation("");
            setDeleteError(null);
            setIsDeleteOpen(true);
          }}
        >
          Xóa lớp học
        </Button>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">
            Danh sách học viên
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              {classRecord.enrollments.length} học viên
            </Badge>
            <Button variant="outline" size="sm" onClick={loadGradebook}>
              Sổ điểm
            </Button>
            {remainingCapacity > 0 &&
              classRecord.status !== "COMPLETED" &&
              classRecord.status !== "CANCELLED" && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<UserPlus className="h-3.5 w-3.5" />}
                  onClick={loadCandidates}
                >
                  Gán học viên
                </Button>
              )}
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200">
          {classRecord.enrollments.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">
              Chưa có học viên được phân bổ
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">STT</th>
                  <th className="px-3 py-2">Mã học viên</th>
                  <th className="px-3 py-2">Họ tên</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Chuyên cần</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classRecord.enrollments.map((enrollment, index) => {
                  const attendanceCounts: Record<AttendanceStatus, number> = {
                    PRESENT: 0,
                    LATE: 0,
                    ABSENT: 0,
                    EXCUSED: 0,
                  };
                  enrollment.attendances?.forEach((attendance) => {
                    if (
                      classRecord.sessions?.some(
                        (session) =>
                          session.id === attendance.sessionId &&
                          session.status === "COMPLETED",
                      )
                    ) {
                      attendanceCounts[attendance.status] += 1;
                    }
                  });
                  const studentName =
                    enrollment.student.user.profile?.fullName ||
                    enrollment.student.user.email;
                  return (
                    <tr key={enrollment.id}>
                      <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2 font-mono text-blue-700">
                        {enrollment.student.studentCode}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {studentName}
                      </td>
                      <td className="max-w-[190px] truncate px-3 py-2 text-slate-600">
                        {enrollment.student.user.email}
                      </td>
                      <td className="px-3 py-2">
                        <div
                          className="flex items-center gap-1.5"
                          title="Có mặt · Trễ · Vắng · Miễn"
                        >
                          {(
                            [
                              ["PRESENT", "bg-emerald-500", "Có mặt"],
                              ["LATE", "bg-amber-400", "Trễ"],
                              ["ABSENT", "bg-rose-500", "Vắng"],
                              ["EXCUSED", "bg-sky-500", "Miễn"],
                            ] as Array<[AttendanceStatus, string, string]>
                          ).map(([status, color, label]) => (
                            <span
                              key={status}
                              title={label}
                              className={`inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-1 text-[10px] font-semibold ${attendanceCounts[status] === 0 ? "opacity-35" : ""}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${color}`}
                              />
                              <span className="text-slate-700">
                                {attendanceCounts[status]}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            enrollment.status === "ACTIVE" ? "success" : "slate"
                          }
                        >
                          {enrollment.status === "ACTIVE"
                            ? "Đang học"
                            : enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={removingEnrollmentId === enrollment.id}
                          disabled={removingEnrollmentId !== null}
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() =>
                            setRemovalCandidate({
                              id: enrollment.id,
                              name: studentName,
                            })
                          }
                          title="Xóa học viên khỏi lớp"
                        >
                          Xóa khỏi lớp
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {isAllocationOpen && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Gán học viên vào lớp
              </h4>
              <p className="mt-1 text-[11px] text-slate-500">
                Chỉ hiển thị đơn đã duyệt và thanh toán đủ. Còn{" "}
                {remainingCapacity} chỗ trống.
              </p>
            </div>
            <button
              type="button"
              title="Đóng danh sách gán học viên"
              onClick={() => setIsAllocationOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {allocationError && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {allocationError}
            </div>
          )}
          {allocationSuccess && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <Check className="h-4 w-4" />
              {allocationSuccess}
            </div>
          )}
          {isLoadingCandidates ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-8 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách học viên...
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
              Không có học viên đã thanh toán nào đang chờ phân bổ.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <AllocationColumn
                title="Chưa chọn"
                count={availableCandidates.length}
                action={
                  <button
                    type="button"
                    onClick={selectAllCandidates}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                  >
                    {selectedIds.length ===
                    Math.min(candidates.length, remainingCapacity)
                      ? "Bỏ chọn tất cả"
                      : "Chọn tối đa"}
                  </button>
                }
              >
                {availableCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    checked={false}
                    disabled={selectedIds.length >= remainingCapacity}
                    onToggle={() => toggleCandidate(candidate.id)}
                  />
                ))}
                {!availableCandidates.length && (
                  <p className="p-4 text-center text-xs text-slate-400">
                    Tất cả ứng viên đã được chọn
                  </p>
                )}
              </AllocationColumn>
              <AllocationColumn
                title="Sẽ gán vào lớp"
                count={selectedCandidates.length}
              >
                {selectedCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    checked
                    onToggle={() => toggleCandidate(candidate.id)}
                  />
                ))}
                {!selectedCandidates.length && (
                  <p className="p-4 text-center text-xs text-slate-400">
                    Chưa chọn học viên
                  </p>
                )}
              </AllocationColumn>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2 border-t border-blue-100 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllocationOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isAllocating}
              disabled={!selectedIds.length || isLoadingCandidates}
              onClick={allocate}
              icon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Phân bổ {selectedIds.length || ""}
            </Button>
          </div>
        </div>
      )}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Lịch buổi học</h4>
          <span className="text-xs text-slate-500">
            {classRecord.sessions?.length || 0} buổi
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {classRecord.sessions?.length ? (
            classRecord.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Buổi {session.sessionNumber}
                    {session.topic ? ` · ${session.topic}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatDate(session.sessionDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      session.status === "COMPLETED"
                        ? "success"
                        : session.status === "CANCELLED"
                          ? "error"
                          : "primary"
                    }
                  >
                    {session.status === "COMPLETED"
                      ? "Đã học"
                      : session.status === "CANCELLED"
                        ? "Đã hủy"
                        : "Sắp học"}
                  </Badge>
                  {session.status !== "CANCELLED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttendanceSession(session)}
                    >
                      Điểm danh
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-400">
              Chưa sinh lịch học
            </p>
          )}
        </div>
      </div>
      {attendanceSession && (
        <Modal
          isOpen
          onClose={() => setAttendanceSession(null)}
          title={`Sổ điểm danh · Buổi ${attendanceSession.sessionNumber}`}
          description={`${formatDate(attendanceSession.sessionDate)}${attendanceSession.topic ? ` · ${attendanceSession.topic}` : ""}`}
          maxWidth="5xl"
        >
          <AttendanceGrid
            classRecord={classRecord}
            session={attendanceSession}
            onClose={() => setAttendanceSession(null)}
            onSaved={(updatedSession) => {
              setAttendanceSession(updatedSession);
              classRecord.sessions = classRecord.sessions?.map((session) =>
                session.id === updatedSession.id ? updatedSession : session,
              );
              classRecord.enrollments = classRecord.enrollments.map(
                (enrollment) => {
                  const savedAttendance = updatedSession.attendances?.find(
                    (attendance) => attendance.enrollmentId === enrollment.id,
                  );
                  if (!savedAttendance) return enrollment;
                  const existingAttendances =
                    enrollment.attendances?.filter(
                      (attendance) =>
                        attendance.sessionId !== updatedSession.id,
                    ) || [];
                  return {
                    ...enrollment,
                    attendances: [...existingAttendances, savedAttendance],
                  };
                },
              );
            }}
          />
        </Modal>
      )}
      {(isLoadingGradebook || gradebook || gradebookError) && (
        <Modal
          isOpen
          onClose={() => {
            setGradebook(null);
            setGradebookError(null);
          }}
          title="Sổ điểm lớp"
          description="Nhập điểm theo đầu điểm và theo dõi kết quả học tập"
          maxWidth="6xl"
        >
          <GradebookSheet
            classId={classRecord.id}
            gradebook={gradebook}
            isLoading={isLoadingGradebook}
            error={gradebookError}
            onRetry={loadGradebook}
            onClose={() => {
              setGradebook(null);
              setGradebookError(null);
            }}
          />
        </Modal>
      )}
      <GenerateSessionsModal
        isOpen={isScheduleOpen}
        classRecord={classRecord}
        onClose={() => setIsScheduleOpen(false)}
        onGenerated={(sessions) => {
          classRecord.sessions = sessions;
          setIsScheduleOpen(false);
        }}
      />
      <GradeComponentsModal
        isOpen={isGradeConfigOpen}
        classId={classRecord.id}
        onClose={() => setIsGradeConfigOpen(false)}
        onConfigured={() => setIsGradeConfigOpen(false)}
      />
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xóa lớp học"
        description="Thao tác này chỉ thực hiện được với lớp chưa có dữ liệu liên quan"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            Lớp có học viên, lịch học hoặc cấu hình đầu điểm sẽ không thể xóa.
            Dữ liệu đã xóa không thể khôi phục.
          </div>
          <p className="text-sm text-slate-700">
            Nhập mã lớp <strong>{classRecord.classCode}</strong> để xác nhận.
          </p>
          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={classRecord.classCode}
            autoComplete="off"
          />
          {deleteError && (
            <p className="text-xs text-rose-700">{deleteError}</p>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              isLoading={isDeletingClass}
              disabled={deleteConfirmation.trim() !== classRecord.classCode}
              onClick={deleteClass}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={Boolean(removalCandidate)}
        onClose={() => setRemovalCandidate(null)}
        title="Xóa học viên khỏi lớp"
        description="Lịch sử điểm danh và điểm số sẽ được giữ lại"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Bạn có chắc muốn xóa <strong>{removalCandidate?.name}</strong> khỏi
            lớp này?
          </p>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemovalCandidate(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={Boolean(removingEnrollmentId)}
              icon={<Trash2 className="h-4 w-4" />}
              onClick={removeStudent}
            >
              Xóa khỏi lớp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const AllocationColumn: React.FC<{
  title: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, count, action, children }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-xs font-bold text-slate-800">
        {title} <span className="font-normal text-slate-400">({count})</span>
      </span>
      {action}
    </div>
    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
      {children}
    </div>
  </div>
);

const attendanceLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Trễ",
  EXCUSED: "Miễn",
};

const attendanceVariants: Record<
  AttendanceStatus,
  "success" | "error" | "warning" | "info"
> = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  EXCUSED: "info",
};

const AttendanceGrid: React.FC<{
  classRecord: ManagedClass;
  session: ClassSession;
  onClose: () => void;
  onSaved: (session: ClassSession) => void;
}> = ({ classRecord, session, onClose, onSaved }) => {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () =>
      Object.fromEntries(
        classRecord.enrollments.map((enrollment) => [
          enrollment.id,
          session.attendances?.find(
            (attendance) => attendance.enrollmentId === enrollment.id,
          )?.status || "PRESENT",
        ]),
      ),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const attendances = await classApi.saveAttendance(
        classRecord.id,
        session.id,
        Object.entries(statuses).map(([enrollmentId, status]) => ({
          enrollmentId,
          status,
        })),
      );
      onSaved({ ...session, status: "COMPLETED", attendances });
    } catch (requestError: any) {
      setError(requestError.message || "Không thể lưu điểm danh");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {error && (
        <div className="m-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white text-[10px] uppercase text-slate-500 shadow-sm">
            <tr>
              <th className="px-4 py-2">Học viên</th>
              <th className="px-4 py-2">Mã học viên</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classRecord.enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className="px-4 py-2.5 font-semibold text-slate-800">
                  {enrollment.student.user.profile?.fullName ||
                    enrollment.student.user.email}
                </td>
                <td className="px-4 py-2.5 font-mono text-blue-700">
                  {enrollment.student.studentCode}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(attendanceLabels) as AttendanceStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setStatuses((current) => ({
                              ...current,
                              [enrollment.id]: status,
                            }))
                          }
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition ${statuses[enrollment.id] === status ? `border-transparent ring-2 ring-blue-100 ${status === "PRESENT" ? "bg-emerald-100 text-emerald-800" : status === "ABSENT" ? "bg-rose-100 text-rose-800" : status === "LATE" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}` : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                          {attendanceLabels[status]}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant={attendanceVariants[statuses[enrollment.id]]}
                    >
                      {attendanceLabels[statuses[enrollment.id]]}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50/50 px-4 py-3">
        <Button variant="primary" size="sm" isLoading={isSaving} onClick={save}>
          Lưu điểm danh
        </Button>
      </div>
    </div>
  );
};

const GradebookSheet: React.FC<{
  classId: string;
  gradebook: Gradebook | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}> = ({ classId, gradebook, isLoading, error, onRetry, onClose }) => {
  const [scores, setScores] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [savingEnrollmentId, setSavingEnrollmentId] = useState<string | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!gradebook) return;
    setScores(
      Object.fromEntries(
        gradebook.enrollments.map((enrollment) => [
          enrollment.id,
          Object.fromEntries(
            gradebook.gradeComponents.map((component) => [
              component.id,
              String(
                enrollment.grades?.find(
                  (grade) => grade.componentId === component.id,
                )?.score ?? "",
              ),
            ]),
          ),
        ]),
      ),
    );
  }, [gradebook]);

  const saveRow = async (enrollmentId: string) => {
    const row = scores[enrollmentId] || {};
    const grades = Object.entries(row)
      .filter(([, value]) => value !== "")
      .map(([componentId, value]) => ({ componentId, score: Number(value) }));
    if (!grades.length) return;
    try {
      setSavingEnrollmentId(enrollmentId);
      setSaveError(null);
      await classApi.saveGrades(classId, enrollmentId, grades);
      onRetry();
    } catch (requestError: any) {
      setSaveError(requestError.message || "Không thể lưu điểm");
    } finally {
      setSavingEnrollmentId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {(error || saveError) && (
        <div className="m-3 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span>{error || saveError}</span>
          {error && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          )}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải bảng điểm...
        </div>
      ) : !gradebook ? null : gradebook.gradeComponents.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          Lớp chưa cấu hình đầu điểm.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-white text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-3">
                  Học viên
                </th>
                {gradebook.gradeComponents.map((component) => (
                  <th key={component.id} className="px-3 py-3 text-center">
                    {component.name}
                    <span className="mt-0.5 block normal-case text-slate-400">
                      {Math.round(component.weight * 100)}%
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center">Tổng kết</th>
                <th className="px-3 py-3 text-center">Kết quả</th>
                <th className="px-4 py-3 text-right">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradebook.enrollments.map((enrollment) => {
                const resultIsFail = enrollment.academicResult === "FAIL";
                return (
                  <tr
                    key={enrollment.id}
                    className={
                      resultIsFail ? "bg-rose-50/40" : "hover:bg-blue-50/30"
                    }
                  >
                    <td
                      className={`sticky left-0 z-[1] px-4 py-3 ${resultIsFail ? "bg-rose-50/80" : "bg-white"}`}
                    >
                      <p className="font-semibold text-slate-800">
                        {enrollment.student.user?.profile?.fullName ||
                          enrollment.student.studentCode}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        {enrollment.student.studentCode}
                      </p>
                    </td>
                    {gradebook.gradeComponents.map((component) => {
                      const value = scores[enrollment.id]?.[component.id] ?? "";
                      const isWeak = value !== "" && Number(value) < 4;
                      return (
                        <td
                          key={component.id}
                          className="px-3 py-3 text-center"
                        >
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            value={value}
                            onChange={(event) =>
                              setScores((current) => ({
                                ...current,
                                [enrollment.id]: {
                                  ...current[enrollment.id],
                                  [component.id]: event.target.value,
                                },
                              }))
                            }
                            className={`w-16 rounded-md border px-2 py-1.5 text-center text-xs font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${isWeak ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-300 bg-white text-slate-700"}`}
                            aria-label={`${component.name} của ${enrollment.student.studentCode}`}
                          />
                        </td>
                      );
                    })}
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${enrollment.finalScore !== null && enrollment.finalScore !== undefined && enrollment.finalScore < 5 ? "text-rose-700" : "text-slate-900"}`}
                    >
                      {enrollment.finalScore ?? "--"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge
                        variant={
                          resultIsFail
                            ? "error"
                            : enrollment.academicResult === "DISTINCTION"
                              ? "success"
                              : enrollment.academicResult === "PASS"
                                ? "primary"
                                : "slate"
                        }
                      >
                        {enrollment.academicResult || "Chưa đủ điểm"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={savingEnrollmentId === enrollment.id}
                        disabled={savingEnrollmentId !== null}
                        onClick={() => saveRow(enrollment.id)}
                      >
                        Lưu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CandidateRow: React.FC<{
  candidate: Registration;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}> = ({ candidate, checked, disabled, onToggle }) => (
  <label
    className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-blue-50/50"}`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onToggle}
      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-semibold text-slate-800">
        {candidate.student?.user.profile?.fullName ||
          candidate.student?.user.email ||
          "Học viên"}
      </span>
      <span className="mt-0.5 block text-[10px] text-slate-500">
        {candidate.student?.studentCode || candidate.registrationCode}
      </span>
    </span>
    <Badge variant="success" size="sm">
      Đã đóng phí
    </Badge>
  </label>
);

const DetailStat: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 truncate text-xs font-bold text-slate-800">{value}</p>
  </div>
);

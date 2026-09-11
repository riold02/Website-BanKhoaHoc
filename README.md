# HỆ THỐNG QUẢN LÝ ĐĂNG KÝ KHÓA HỌC & HỌC VIÊN (CMS - COURSE MANAGEMENT SYSTEM)

### TRUNG TÂM ĐÀO TẠO & KHÓA HỌC NGẮN HẠN - ĐẠI HỌC ĐÀ LẠT (DLU)

Dự án được xây dựng theo mô hình **Monorepo với `pnpm workspaces`**, kiến trúc phân tầng chuẩn doanh nghiệp (**Layered Architecture**), tuân thủ thiết kế chi tiết tại [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

---

## 👥 PHÂN CÔNG THÀNH VIÊN 1 (TEAM LEAD & KIẾN TRÚC NỀN TẢNG)

Thành viên 1 đã hoàn thành trọn vẹn các trách nhiệm nền tảng và 2 phân hệ cốt lõi:

1. **Kiến trúc Monorepo & Môi trường**: Thiết lập `pnpm-workspace.yaml`, Root scripts, Docker Compose (PostgreSQL 16).
2. **Cơ sở dữ liệu toàn diện (Prisma ORM)**: Xây dựng Schema Prisma với đầy đủ 16 bảng chuẩn ERD cho cả 4 thành viên; Seed dữ liệu mẫu ban đầu.
3. **Phân hệ M01 - Authentication & RBAC**:
   - Đăng ký học viên (`/api/v1/auth/register`)
   - Đăng nhập JWT Token + Refresh Token (`/api/v1/auth/login`, `/api/v1/auth/refresh-token`)
   - Lấy thông tin user hiện tại (`/api/v1/auth/me`), cập nhật hồ sơ (`/api/v1/auth/profile`)
   - Quản lý tài khoản người dùng (`/api/v1/users`), khóa/mở khóa tài khoản (`/api/v1/users/:id/status`)
4. **Phân hệ M02 - Course Management**:
   - CRUD Khóa học có phân trang, tìm kiếm, lọc danh mục (`/api/v1/courses`)
   - Chi tiết khóa học và các đợt tuyển sinh đang mở (`/api/v1/courses/:id`)
   - Quản lý danh mục đào tạo (`/api/v1/courses/categories`)
5. **Frontend Web Application (React + TypeScript + Tailwind CSS)**:
   - Design System Enterprise (Deep Blue `#1E40AF`, Slate 50/900, Emerald `#10B981`, Amber, Crimson).
   - Trang Đăng nhập `/login` (tích hợp nút Đăng nhập nhanh Demo 3 quyền: Admin, Staff, Student).
   - Trang Đăng ký học viên `/register` kèm kiểm tra hợp lệ.
   - Admin Portal Layout (Sidebar responsive, Topbar, Breadcrumbs, User Menu, Protected Route Guard).
   - Màn hình Quản lý Khóa học `/admin/courses` (Data table, Drawer thêm/sửa, modal xác nhận xóa).
   - Màn hình Quản lý Tài khoản `/admin/users` (Xem danh sách, lọc theo quyền, khóa/mở khóa tài khoản).
   - Cổng Học viên `/courses` (Hero banner tuyển sinh, thẻ khóa học, modal chi tiết đề cương & học phí).
6. **Cơ chế Mock Auth Decoupling (Tháo gỡ điểm nghẽn cho TV2, TV3, TV4)**:
   - Trong môi trường `NODE_ENV=development`, các thành viên 2, 3, 4 có thể gọi API mà không cần JWT bằng cách gắn Header:
     - `x-mock-role: STAFF` (hoặc `ADMIN`, `STUDENT`)
     - `x-mock-user-id: 00000000-0000-0000-0000-000000000001`

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu môi trường

- **Node.js**: >= v20.x
- **pnpm**: >= v9.x (hoặc v12.x)

### 2. Cài đặt Dependencies

Tại thư mục gốc của dự án:

```bash
pnpm install
```

### 3. Khởi tạo Cơ sở dữ liệu & Dữ liệu mẫu (Database & Seed)

```bash
# Đẩy schema Prisma vào database
pnpm --filter @cms/backend prisma db push

# Chạy seed dữ liệu mẫu
pnpm --filter @cms/backend prisma db seed
```

### 4. Chạy ứng dụng đồng thời (Backend & Frontend)

```bash
# Chạy cả 2 services cùng lúc
pnpm dev

# Hoặc chạy riêng lẻ:
pnpm dev:backend   # Backend chạy tại: http://localhost:5000/api/v1
pnpm dev:frontend  # Frontend chạy tại: http://localhost:3000
```

---

## 🔑 TÀI KHOẢN MẪU HỆ THỐNG (DEMO ACCOUNTS)

| Vai trò     | Email đăng nhập          | Tên đăng nhập | Mật khẩu mặc định | Ghi chú                                           |
| :---------- | :----------------------- | :------------ | :---------------- | :------------------------------------------------ |
| **Admin**   | `admin@cms.dlu.edu.vn`   | `admin`       | `Password123@`    | Toàn quyền hệ thống, quản lý tài khoản & khóa học |
| **Staff**   | `staff@cms.dlu.edu.vn`   | `staff`       | `Password123@`    | Giáo vụ đào tạo, thêm/sửa khóa học, xét duyệt     |
| **Student** | `student@cms.dlu.edu.vn` | `student`     | `Password123@`    | Học viên (Mã: `HV-2026-001`), xem khóa học        |

_(Trên trang `/login`, bạn có thể bấm trực tiếp vào các nút Demo để tự động điền tài khoản)._

Seed cũng tạo 4 học viên demo để kiểm thử phân bổ lớp: `student101@cms.dlu.edu.vn`, `student102@cms.dlu.edu.vn`, `student103@cms.dlu.edu.vn`, `student104@cms.dlu.edu.vn`. Mật khẩu của các tài khoản này là `Password123@`; các đơn tương ứng đã ở trạng thái `APPROVED` và hóa đơn ở trạng thái `PAID`.

Tài khoản `student@cms.dlu.edu.vn` cũng được seed sẵn registration `APPROVED`, invoice `PAID` và xếp vào lớp `WEB-K15-A`. Mật khẩu: `Password123@`. Dùng tài khoản này để test trực tiếp `/my-learning`.

Seed cũng tạo sẵn 12 buổi học cho lớp `WEB-K15-A` vào các ngày Thứ 2, 4, 6 từ `15/10/2026`; nếu lớp đã có lịch thì seed giữ nguyên lịch hiện tại để không ảnh hưởng dữ liệu đã kiểm thử.

---

## 🌐 DANH SÁCH ENDPOINTS BACKEND (API REFERENCE)

### Authentication & Users

- `POST /api/v1/auth/register`: Đăng ký tài khoản học viên (Public)
- `POST /api/v1/auth/login`: Đăng nhập, nhận Access + Refresh Token (Public)
- `POST /api/v1/auth/refresh-token`: Cấp mới Access Token (Public)
- `GET /api/v1/auth/me`: Lấy thông tin user hiện tại (Yêu cầu Token)
- `PUT /api/v1/auth/profile`: Cập nhật thông tin cá nhân (Yêu cầu Token)
- `GET /api/v1/users`: Danh sách người dùng trong hệ thống (Quyền ADMIN)
- `PATCH /api/v1/users/:id/status`: Khóa hoặc mở khóa tài khoản (Quyền ADMIN)

### Course Management

- `GET /api/v1/courses`: Danh sách khóa học có phân trang & tìm kiếm (Public)
- `GET /api/v1/courses/categories`: Danh sách danh mục đào tạo (Public)
- `GET /api/v1/courses/:id`: Chi tiết khóa học & các đợt tuyển sinh đang mở (Public)
- `POST /api/v1/courses`: Thêm khóa học mới (Quyền ADMIN, STAFF)
- `PUT /api/v1/courses/:id`: Cập nhật khóa học (Quyền ADMIN, STAFF)
- `DELETE /api/v1/courses/:id`: Xóa/ngưng khóa học (Quyền ADMIN)

### Class Management (TASK-302)

- `GET /api/v1/classes?periodId=:periodId`: Danh sách lớp và học viên đã phân bổ (Quyền ADMIN, STAFF)
- `GET /api/v1/classes/:id`: Chi tiết lớp và danh sách học viên (Quyền ADMIN, STAFF)
- `POST /api/v1/classes`: Tạo lớp; truyền `allocate: true` để phân bổ ngay các đơn đã duyệt và thanh toán đủ (Quyền ADMIN, STAFF)
- `POST /api/v1/classes/:id/allocate`: Phân bổ học viên vào lớp. Có thể truyền `registrationIds`; bỏ qua trường này để lấy toàn bộ đơn đủ điều kiện trong đợt (Quyền ADMIN, STAFF)
- `DELETE /api/v1/classes/:id`: Xóa lớp trống; API từ chối nếu lớp đã có học viên, lịch học hoặc cấu hình đầu điểm (Quyền ADMIN, STAFF)
- `POST /api/v1/classes/:id/sessions/generate`: Sinh lịch theo `weekdays` (ISO `1=Thứ 2` đến `7=Chủ nhật`) và `sessionCount` (Quyền ADMIN, STAFF)
- `GET /api/v1/classes/:id/sessions`: Xem lịch các buổi học của lớp (Quyền ADMIN, STAFF)
- `PUT /api/v1/classes/:id/sessions/:sessionId/attendance`: Lưu/cập nhật điểm danh với trạng thái `PRESENT`, `ABSENT`, `LATE` hoặc `EXCUSED` (Quyền ADMIN, STAFF)
- `PUT /api/v1/classes/:id/grade-components`: Cấu hình các đầu điểm và tỷ trọng; tổng tỷ trọng phải bằng `1.0` (Quyền ADMIN, STAFF)
- `GET /api/v1/classes/:id/gradebook`: Xem bảng điểm lớp (Quyền ADMIN, STAFF)
- `PUT /api/v1/classes/:id/enrollments/:enrollmentId/grades`: Nhập/cập nhật điểm theo học viên (thang điểm `0..10`) (Quyền ADMIN, STAFF)
- `POST /api/v1/classes/:id/calculate-results`: Tính kết quả cho toàn lớp (Quyền ADMIN, STAFF)
- `POST /api/v1/classes/:id/enrollments/:enrollmentId/calculate-result`: Tính kết quả cho một học viên (Quyền ADMIN, STAFF)

Một registration đủ điều kiện phân bổ khi có trạng thái `APPROVED`, hóa đơn có `paymentStatus: PAID`, cùng `periodId` với lớp và chưa thuộc lớp đang hoạt động nào. API từ chối nếu vượt sĩ số hoặc không đủ điều kiện.

Điểm tổng kết được tính theo tổng `score * weight`, làm tròn 2 chữ số. Học viên bị `FAIL` nếu vắng trên 20% số buổi hoặc điểm cuối kỳ dưới 4.0; nếu chưa đủ tất cả đầu điểm thì kết quả vẫn để trống.

### Student Learning Portal (TASK-305)

- `GET /api/v1/students/me/schedule`: Học viên xem lịch học các lớp của mình (chỉ tài khoản STUDENT)
- `GET /api/v1/students/me/attendance`: Học viên xem lịch sử điểm danh và tỷ lệ vắng theo lớp (chỉ tài khoản STUDENT)
- `GET /api/v1/students/me/grades`: Học viên xem các đầu điểm, điểm tổng kết và kết quả cá nhân (chỉ tài khoản STUDENT)

Các endpoint này lấy học viên từ tài khoản JWT hiện tại, không nhận `studentId` từ request nên không thể xem dữ liệu của học viên khác.

### Class Management UI (TASK-306)

- Trang quản lý: `/admin/classes`
- Có danh sách lớp, tìm kiếm theo mã/tên/khóa học, lọc trạng thái và hiển thị sĩ số.
- Xem chi tiết lớp gồm thông tin khóa học, roster học viên và lịch các buổi học.
- Trong chi tiết lớp, nút `Gán học viên` mở transfer list; chỉ các đơn `APPROVED` có hóa đơn `PAID` được chọn và số lượng không vượt quá sức chứa còn lại.

### Student Allocation UI (TASK-307)

- Transfer list checkbox tại `/admin/classes` cho phép chọn/bỏ chọn nhiều học viên.
- Sau khi phân bổ thành công, roster và sĩ số lớp được tải lại tự động.

### Attendance UI (TASK-308)

- Trong chi tiết lớp tại `/admin/classes`, chọn `Điểm danh` ở từng buổi để mở matrix điểm danh.
- Matrix hiển thị toàn bộ học viên và cho phép chọn `Có mặt`, `Vắng`, `Trễ` hoặc `Miễn`.
- Nút `Lưu điểm danh` gửi trạng thái của cả buổi qua `PUT /api/v1/classes/:id/sessions/:sessionId/attendance`.

### Gradebook UI (TASK-309)

- Trong chi tiết lớp tại `/admin/classes`, nút `Sổ điểm` mở gradebook sheet theo hàng học viên và cột đầu điểm.
- Cho phép nhập/cập nhật điểm theo thang `0..10` và lưu từng học viên qua API TASK-304.
- Điểm dưới `4.0`, tổng kết thấp và kết quả `FAIL` được highlight bằng màu cảnh báo để giáo vụ rà soát nhanh.

### Class Workflow UI

- Nút `Tạo lớp` trên `/admin/classes` cho phép chọn đợt tuyển sinh, nhập mã/tên lớp, phòng, sĩ số và khoảng thời gian.
- Nút `Sinh lịch học` trong chi tiết lớp cho phép chọn thứ trong tuần, số buổi, ngày bắt đầu và tiêu đề buổi học.
- Nút `Cấu hình đầu điểm` cho phép nhập tên và tỷ trọng; tổng tỷ trọng phải đạt `100%`.

Seed tạo sẵn hai lớp mẫu `WEB-K15-A` và `WEB-K15-B` thuộc đợt `PERIOD-WEB-K15`. Vào `/admin/classes`, mở một lớp, bấm `Gán học viên`, chọn các học viên demo và bấm `Phân bổ` để kiểm thử.

### Student Learning Portal (TASK-310)

- Trang cổng học tập: `/my-learning`.
- Tab `Lịch học`: xem các lớp, phòng học, lịch từng buổi và trạng thái buổi học.
- Tab `Điểm danh`: xem trạng thái từng buổi, số buổi đã điểm danh và tỷ lệ vắng.
- Tab `Bảng điểm`: xem đầu điểm, tỷ trọng, điểm tổng kết và kết quả cá nhân.
- Chỉ tài khoản `STUDENT` đã đăng nhập mới truy cập được trang này.

---

## 📋 QUY ƯỚC COMMIT CHO DỰ ÁN (CONVENTIONAL COMMITS)

Tuân thủ mục 21.2 của tài liệu thiết kế: `<type>(<scope>): <mô tả ngắn>`

- `feat`: Tính năng mới (vd: `feat(auth): thêm API refresh token`)
- `fix`: Sửa lỗi (vd: `fix(course): sửa lỗi validate thời lượng khóa học`)
- `ui`: Giao diện (vd: `ui(admin): hoàn thiện màn hình quản lý khóa học`)
- `docs`: Tài liệu (vd: `docs(readme): hướng dẫn kết nối database`)
- `chore`: Cấu hình nền tảng (vd: `chore(monorepo): thiết lập pnpm workspaces`)

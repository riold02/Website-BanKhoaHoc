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

| Vai trò | Email đăng nhập | Tên đăng nhập | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@cms.dlu.edu.vn` | `admin` | `Password123@` | Toàn quyền hệ thống, quản lý tài khoản & khóa học |
| **Staff** | `staff@cms.dlu.edu.vn` | `staff` | `Password123@` | Giáo vụ đào tạo, thêm/sửa khóa học, xét duyệt |
| **Student** | `student@cms.dlu.edu.vn` | `student` | `Password123@` | Học viên (Mã: `HV-2026-001`), xem khóa học |

*(Trên trang `/login`, bạn có thể bấm trực tiếp vào các nút Demo để tự động điền tài khoản).*

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

---

## 📋 QUY ƯỚC COMMIT CHO DỰ ÁN (CONVENTIONAL COMMITS)

Tuân thủ mục 21.2 của tài liệu thiết kế: `<type>(<scope>): <mô tả ngắn>`
- `feat`: Tính năng mới (vd: `feat(auth): thêm API refresh token`)
- `fix`: Sửa lỗi (vd: `fix(course): sửa lỗi validate thời lượng khóa học`)
- `ui`: Giao diện (vd: `ui(admin): hoàn thiện màn hình quản lý khóa học`)
- `docs`: Tài liệu (vd: `docs(readme): hướng dẫn kết nối database`)
- `chore`: Cấu hình nền tảng (vd: `chore(monorepo): thiết lập pnpm workspaces`)

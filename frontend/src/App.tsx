import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { CourseCatalogPage } from "./pages/student/CourseCatalogPage";
import { MyRegistrationsPage } from "./pages/student/MyRegistrationsPage";
import { LearningPortalPage } from "./pages/student/LearningPortalPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { CourseManagementPage } from "./pages/admin/CourseManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { EnrollmentPeriodManagementPage } from "./pages/admin/EnrollmentPeriodManagementPage";
import { RegistrationManagementPage } from "./pages/admin/RegistrationManagementPage";
import { StudentManagementPage } from "./pages/admin/StudentManagementPage";
import { ClassManagementPage } from "./pages/admin/ClassManagementPage";
import { AdminLayout } from "./layouts/AdminLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Portal Routes */}
      <Route element={<StudentLayout />}>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        {/* Member 2 - M04: Đơn đăng ký của học viên */}
        <Route
          path="/my-registrations"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyRegistrationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <LearningPortalPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin & Staff Portal Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Member 2 - M03: Quản lý Đợt tuyển sinh */}
        <Route
          path="enrollment-periods"
          element={<EnrollmentPeriodManagementPage />}
        />
        {/* Member 2 - M04: Xét duyệt Đơn đăng ký */}
        <Route path="registrations" element={<RegistrationManagementPage />} />
        {/* Member 2 - M11: Quản lý Học viên */}
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="classes" element={<ClassManagementPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
};

export default App;

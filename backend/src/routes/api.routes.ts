import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { courseRoutes } from "./course.routes";
import { enrollmentPeriodRoutes } from "./enrollment-period.routes";
import { registrationRoutes } from "./registration.routes";
import { studentRoutes } from "./student.routes";
import { classRoutes } from "./class.routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Course & Student Management System API (CMS)",
    version: "1.0.0",
  });
});

// Member 1 Modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);

// Member 2 Modules (M03, M04, M11)
router.use("/enrollment-periods", enrollmentPeriodRoutes);
router.use("/registrations", registrationRoutes);
router.use("/students", studentRoutes);
router.use("/classes", classRoutes);

export const apiRoutes = router;

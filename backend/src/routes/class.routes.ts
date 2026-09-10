import { Router } from "express";
import { classController } from "../controllers/class.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { RoleEnum } from "../constants/roles.enum";
import { allocateClassSchema, createClassSchema } from "../dtos/class.dto";
import {
  generateSessionsSchema,
  saveAttendanceSchema,
} from "../dtos/attendance.dto";
import {
  configureGradeComponentsSchema,
  saveGradesSchema,
} from "../dtos/grade.dto";

const router = Router();
const staffRoles = [RoleEnum.ADMIN, RoleEnum.STAFF];

router.get(
  "/",
  authenticate,
  authorize(staffRoles),
  classController.listClasses,
);
router.get(
  "/:id",
  authenticate,
  authorize(staffRoles),
  classController.getClassById,
);
router.get(
  "/:id/sessions",
  authenticate,
  authorize(staffRoles),
  classController.listSessions,
);
router.post(
  "/",
  authenticate,
  authorize(staffRoles),
  validate(createClassSchema),
  classController.createClass,
);
router.post(
  "/:id/allocate",
  authenticate,
  authorize(staffRoles),
  validate(allocateClassSchema),
  classController.allocateStudents,
);
router.delete(
  "/:id/enrollments/:enrollmentId",
  authenticate,
  authorize(staffRoles),
  classController.removeStudent,
);
router.delete(
  "/:id",
  authenticate,
  authorize(staffRoles),
  classController.deleteClass,
);
router.post(
  "/:id/sessions/generate",
  authenticate,
  authorize(staffRoles),
  validate(generateSessionsSchema),
  classController.generateSessions,
);
router.put(
  "/:id/sessions/:sessionId/attendance",
  authenticate,
  authorize(staffRoles),
  validate(saveAttendanceSchema),
  classController.saveAttendance,
);
router.put(
  "/:id/grade-components",
  authenticate,
  authorize(staffRoles),
  validate(configureGradeComponentsSchema),
  classController.configureGradeComponents,
);
router.get(
  "/:id/gradebook",
  authenticate,
  authorize(staffRoles),
  classController.getGradebook,
);
router.put(
  "/:id/enrollments/:enrollmentId/grades",
  authenticate,
  authorize(staffRoles),
  validate(saveGradesSchema),
  classController.saveGrades,
);
router.post(
  "/:id/calculate-results",
  authenticate,
  authorize(staffRoles),
  classController.calculateResults,
);
router.post(
  "/:id/enrollments/:enrollmentId/calculate-result",
  authenticate,
  authorize(staffRoles),
  classController.calculateResults,
);

export const classRoutes = router;

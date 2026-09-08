import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import { updateStudentSchema, studentQuerySchema } from '../dtos/student.dto';

const router = Router();

// Admin / Staff - Danh sách học viên
router.get(
  '/',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(studentQuerySchema),
  studentController.listStudents
);

// Học viên xem hồ sơ của chính mình
router.get('/me', authenticate, authorize([RoleEnum.STUDENT]), studentController.getMyStudentProfile);

// Admin / Staff - Xem chi tiết học viên
router.get('/:id', authenticate, authorize([RoleEnum.ADMIN, RoleEnum.STAFF]), studentController.getStudentById);

// Admin / Staff - Cập nhật thông tin học viên
router.put(
  '/:id',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(updateStudentSchema),
  studentController.updateStudent
);

export const studentRoutes = router;

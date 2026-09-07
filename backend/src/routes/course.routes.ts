import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
} from '../dtos/course.dto';

const router = Router();

// Public Routes (Học viên tra cứu)
router.get('/', validate(courseQuerySchema), courseController.listCourses);
router.get('/categories', courseController.listCategories);
router.get('/:id', courseController.getCourseById);

// Admin / Staff Routes (Thêm, sửa)
router.post(
  '/',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(createCourseSchema),
  courseController.createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(updateCourseSchema),
  courseController.updateCourse
);

// Admin Only Routes (Xóa / Ẩn khóa học)
router.delete(
  '/:id',
  authenticate,
  authorize([RoleEnum.ADMIN]),
  courseController.deleteCourse
);

export const courseRoutes = router;

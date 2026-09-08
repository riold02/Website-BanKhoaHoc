import { Router } from 'express';
import { enrollmentPeriodController } from '../controllers/enrollment-period.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import {
  createEnrollmentPeriodSchema,
  updateEnrollmentPeriodSchema,
  updatePeriodStatusSchema,
  periodQuerySchema,
} from '../dtos/enrollment-period.dto';

const router = Router();

// Public - Xem danh sách đợt tuyển sinh
router.get('/', validate(periodQuerySchema), enrollmentPeriodController.listPeriods);
router.get('/:id', enrollmentPeriodController.getPeriodById);

// Admin / Staff - Tạo và cập nhật đợt tuyển sinh
router.post(
  '/',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(createEnrollmentPeriodSchema),
  enrollmentPeriodController.createPeriod
);

router.put(
  '/:id',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(updateEnrollmentPeriodSchema),
  enrollmentPeriodController.updatePeriod
);

// Admin / Staff - Thay đổi trạng thái đợt
router.patch(
  '/:id/status',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(updatePeriodStatusSchema),
  enrollmentPeriodController.updatePeriodStatus
);

export const enrollmentPeriodRoutes = router;

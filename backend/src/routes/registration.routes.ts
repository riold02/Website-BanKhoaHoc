import { Router } from 'express';
import { registrationController } from '../controllers/registration.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import {
  createRegistrationSchema,
  reviewRegistrationSchema,
  registrationQuerySchema,
} from '../dtos/registration.dto';

const router = Router();

// Tất cả routes đều yêu cầu đăng nhập
router.get('/', authenticate, validate(registrationQuerySchema), registrationController.listRegistrations);
router.get('/:id', authenticate, registrationController.getRegistrationById);

// Học viên tạo đơn đăng ký
router.post(
  '/',
  authenticate,
  authorize([RoleEnum.STUDENT]),
  validate(createRegistrationSchema),
  registrationController.createRegistration
);

// Admin / Staff xét duyệt đơn
router.patch(
  '/:id/review',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(reviewRegistrationSchema),
  registrationController.reviewRegistration
);

// Hủy đơn (học viên hủy đơn của mình hoặc Admin/Staff hủy bất kỳ)
router.patch('/:id/cancel', authenticate, registrationController.cancelRegistration);

export const registrationRoutes = router;

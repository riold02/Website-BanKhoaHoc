import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import {
  listUsersQuerySchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
} from '../dtos/user.dto';

const router = Router();

// Tất cả các route quản lý user yêu cầu quyền ADMIN
router.use(authenticate);
router.use(authorize([RoleEnum.ADMIN]));

router.get('/', validate(listUsersQuerySchema), userController.listUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', validate(updateUserStatusSchema), userController.updateUserStatus);
router.patch('/:id/role', validate(updateUserRoleSchema), userController.updateUserRole);

export const userRoutes = router;

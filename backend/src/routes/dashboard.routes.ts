import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { RoleEnum } from '../constants/roles.enum';

const router = Router();

router.get(
  '/overview',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  dashboardController.getOverview
);

export const dashboardRoutes = router;

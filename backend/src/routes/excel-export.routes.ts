import { Router } from 'express';
import { excelExportController } from '../controllers/excel-export.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { RoleEnum } from '../constants/roles.enum';

const router = Router();

router.get(
  '/classes',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  excelExportController.exportClassList
);

router.get(
  '/grades',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  excelExportController.exportGradeSheet
);

router.get(
  '/tuition-report',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  excelExportController.exportTuitionReport
);

export const excelExportRoutes = router;

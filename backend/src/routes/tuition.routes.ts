import { Router } from 'express';
import { tuitionController } from '../controllers/tuition.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RoleEnum } from '../constants/roles.enum';
import { createPaymentSchema, tuitionQuerySchema } from '../dtos/tuition.dto';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(tuitionQuerySchema),
  tuitionController.listTuitionInvoices
);

router.get('/my', authenticate, authorize([RoleEnum.STUDENT]), tuitionController.getMyTuitionInvoices);
router.get('/:id', authenticate, tuitionController.getTuitionInvoiceById);

router.post(
  '/:id/payments',
  authenticate,
  authorize([RoleEnum.ADMIN, RoleEnum.STAFF]),
  validate(createPaymentSchema),
  tuitionController.recordPayment
);

export const tuitionRoutes = router;

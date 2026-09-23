import { Router } from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Admin and PM can view client payments
router.get('/', authorize(['admin', 'project_manager']), getPayments);
router.get('/:id', authorize(['admin', 'project_manager']), getPaymentById);

// Admin only write
router.post('/', authorize(['admin']), createPayment);
router.put('/:id', authorize(['admin']), updatePayment);
router.delete('/:id', authorize(['admin']), deletePayment);

export default router;

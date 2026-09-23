import { Router } from 'express';
import {
  getRevenueReport,
  getPayrollReport,
  getProfitReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin'])); // Reports are Admin only

router.get('/revenue', getRevenueReport);
router.get('/payroll', getPayrollReport);
router.get('/profit', getProfitReport);

export default router;

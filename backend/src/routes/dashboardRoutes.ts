import { Router } from 'express';
import {
  getDashboardSummary,
  getRevenueChart,
  getProjectProfitabilityChart,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/revenue', getRevenueChart);
router.get('/profit', getProjectProfitabilityChart);

export default router;

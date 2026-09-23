import { Router } from 'express';
import {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/payrollController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Get payrolls (Admin sees all, PM sees assigned projects, Team Member sees self)
router.get('/', getPayrolls);
router.get('/:id', getPayrollById);

// Project member & payroll assignment (Admin only)
router.post('/', authorize(['admin']), createPayroll);
router.put('/:id', authorize(['admin']), updatePayroll);
router.delete('/:id', authorize(['admin']), deletePayroll);

// Milestone routes
router.post('/:payrollId/milestones', authorize(['admin']), addMilestone);
router.put('/milestones/:id', authorize(['admin']), updateMilestone);
router.delete('/milestones/:id', authorize(['admin']), deleteMilestone);

export default router;

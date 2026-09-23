import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Admin & PM can view expenses
router.get('/', authorize(['admin', 'project_manager']), getExpenses);
router.get('/:id', authorize(['admin', 'project_manager']), getExpenseById);

// Admin only write
router.post('/', authorize(['admin']), createExpense);
router.put('/:id', authorize(['admin']), updateExpense);
router.delete('/:id', authorize(['admin']), deleteExpense);

export default router;

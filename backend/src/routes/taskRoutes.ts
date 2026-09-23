import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', authorize(['admin', 'project_manager']), createTask);
router.put('/:id', updateTask); // All roles can update task status/details if assigned
router.delete('/:id', authorize(['admin', 'project_manager']), deleteTask);

export default router;

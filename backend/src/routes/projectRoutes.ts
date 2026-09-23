import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { getTasksByProject, createTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// List projects (filtered by role inside controller)
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Tasks under project
router.get('/:projectId/tasks', getTasksByProject);
router.post('/:projectId/tasks', authorize(['admin', 'project_manager']), createTask);

// Project write actions
router.post('/', authorize(['admin']), createProject);
router.put('/:id', authorize(['admin', 'project_manager']), updateProject);
router.delete('/:id', authorize(['admin']), deleteProject);

export default router;

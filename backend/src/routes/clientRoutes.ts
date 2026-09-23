import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Admin & Project Manager can view clients
router.get('/', authorize(['admin', 'project_manager']), getClients);
router.get('/:id', authorize(['admin', 'project_manager']), getClientById);

// Admin only CRUD
router.post('/', authorize(['admin']), createClient);
router.put('/:id', authorize(['admin']), updateClient);
router.delete('/:id', authorize(['admin']), deleteClient);

export default router;

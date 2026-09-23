import { Router } from 'express';
import {
  getTeam,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Admin and PM can view team directory; Team members can view team directory or own profile
router.get('/', getTeam);
router.get('/:id', getTeamMemberById);

// Admin only write
router.post('/', authorize(['admin']), createTeamMember);
router.put('/:id', authorize(['admin']), updateTeamMember);
router.delete('/:id', authorize(['admin']), deleteTeamMember);

export default router;

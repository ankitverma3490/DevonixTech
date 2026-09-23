import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  resetDemoData,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getCurrentUser);
router.post('/reset-demo-data', resetDemoData);

export default router;

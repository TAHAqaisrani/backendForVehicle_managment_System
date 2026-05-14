import { Router } from 'express';
import { getStats, getRecentActivity, getUsers } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.get('/stats', requireRole('admin', 'advisor'), getStats);
router.get('/recent', requireRole('admin', 'advisor'), getRecentActivity);
router.get('/users', requireRole('admin', 'advisor'), getUsers);
export default router;

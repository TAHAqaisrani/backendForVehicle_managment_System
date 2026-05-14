import { Router } from 'express';
import { addRepairLog, getRepairLogs } from '../controllers/repairLogController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.post('/', requireRole('technician', 'advisor', 'admin'), addRepairLog);
router.get('/:jobCardId', getRepairLogs);
export default router;

import { Router } from 'express';
import { createJobCard, getJobCards, getJobCardById, updateJobCard, getTechnicianQueue, deleteJobCard, approveJobCard } from '../controllers/jobCardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.post('/', requireRole('advisor', 'admin'), createJobCard);
router.get('/', getJobCards);
router.get('/technician/:techId', requireRole('advisor', 'admin', 'technician'), getTechnicianQueue);
router.get('/:id', getJobCardById);
router.patch('/:id', requireRole('advisor', 'technician', 'admin'), updateJobCard);
router.patch('/:id/approve', requireRole('admin'), approveJobCard);
router.delete('/:id', requireRole('admin'), deleteJobCard);
export default router;

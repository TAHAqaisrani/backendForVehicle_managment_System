import { Router } from 'express';
import { search } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('admin', 'advisor'), search);
export default router;

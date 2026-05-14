import { Router } from 'express';
import { getPackages } from '../controllers/packageController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/', getPackages);
export default router;

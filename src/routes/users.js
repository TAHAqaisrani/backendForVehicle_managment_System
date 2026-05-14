import { Router } from 'express';
import { getUsers, createUser, deleteUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

export default router;

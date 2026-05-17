import { Router } from 'express';
import { getMyVehicles, getAllVehicles, addVehicle, getVehicleHistory } from '../controllers/vehicleController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate); // <--- This blocks public access

router.get('/my', requireRole('customer'), getMyVehicles);
router.get('/all', requireRole('advisor', 'admin', 'technician'), getAllVehicles);
router.post('/', requireRole('customer'), addVehicle);
router.get('/:id/history', getVehicleHistory);

export default router;

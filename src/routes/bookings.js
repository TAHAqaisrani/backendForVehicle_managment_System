import { Router } from 'express';
import { createBooking, getBookings, getBookingById, updateBookingStatus, deleteBooking } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate);
router.post('/', requireRole('customer'), createBooking);
router.get('/', requireRole('customer', 'advisor', 'admin'), getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', requireRole('advisor', 'admin'), updateBookingStatus);
router.delete('/:id', requireRole('advisor', 'admin'), deleteBooking);
export default router;

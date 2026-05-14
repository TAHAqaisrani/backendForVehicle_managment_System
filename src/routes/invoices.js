import { Router } from 'express';
import { getInvoice, processPayment } from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/:jobCardId', getInvoice);
router.post('/pay', processPayment);
export default router;

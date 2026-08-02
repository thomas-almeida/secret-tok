import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';
import { createPaymentIntent, webhookNexusPag, checkTransactionStatus } from '../controllers/subscriptionController.js';

const router = Router();

router.post('/login', loginUser);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/nexuspag-webhook', webhookNexusPag);
router.get('/check-transaction/:gatewayId', checkTransactionStatus);

export default router;
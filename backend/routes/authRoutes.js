import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';
import { createPaymentIntent, webhookAbacatePay, checkTransactionStatus } from '../controllers/subscriptionController.js';

const router = Router();

router.post('/login', loginUser);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/abacate-webhook', webhookAbacatePay);
router.get('/check-transaction/:gatewayId', checkTransactionStatus);

export default router;
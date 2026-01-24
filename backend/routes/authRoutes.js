import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';
import { createPaymentIntent, webhookAbacatePay } from '../controllers/subscriptionController.js';

const router = Router();

router.post('/login', loginUser);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/abacate-webhook', webhookAbacatePay);

export default router;
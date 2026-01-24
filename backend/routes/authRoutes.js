import { Router } from 'express';
import { loginUser } from '../controllers/authController.js';
import { createPaymentIntent } from '../controllers/subscriptionController.js';

const router = Router();

router.post('/login', loginUser);
router.post('/create-payment-intent', createPaymentIntent);

export default router;
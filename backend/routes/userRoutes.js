import { Router } from 'express';
import { createUser, getUsers, getAfiliateBalance } from '../controllers/userController.js';

const router = Router();

router.post('/create', createUser);
router.get('/overview', getUsers);
router.get('/afiliate/:afiliateId', getAfiliateBalance)

export default router;
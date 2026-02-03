import { Router } from 'express';
import { createUser, getUsers, getAfiliateBalance } from '../controllers/userController.js';
import { logAffiliatePageAccess } from '../middleware/notificationLogger.js';

const router = Router();

router.post('/create', createUser);
router.get('/overview', getUsers);
router.get('/afiliate/:afiliateId', logAffiliatePageAccess, getAfiliateBalance)

export default router;
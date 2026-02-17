import { Router } from 'express';
import { createUser, getUsers, getAfiliateBalance, getUsersOverview, validateAdmin, checkIsAdmin, setAdmin } from '../controllers/userController.js';
import { logAffiliatePageAccess } from '../middleware/notificationLogger.js';

const router = Router();

router.post('/create', createUser);
router.get('/overview', getUsersOverview);
router.post('/check-admin', checkIsAdmin);
router.post('/set-admin', setAdmin);
router.post('/validate-admin', validateAdmin);
router.get('/afiliate/:afiliateId', logAffiliatePageAccess, getAfiliateBalance)

export default router;
import { Router } from 'express';
import { createUser, getUsers, getAfiliateBalance, getUsersOverview, validateAdmin, checkIsAdmin, setAdmin, updateUserCRM } from '../controllers/userController.js';
import { logAffiliatePageAccess } from '../middleware/notificationLogger.js';

const router = Router();

router.post('/create', createUser);
router.get('/overview', getUsersOverview);
router.post('/check-admin', checkIsAdmin);
router.post('/set-admin', setAdmin);
router.post('/validate-admin', validateAdmin);
router.put('/update-crm', updateUserCRM);
router.get('/afiliate/:afiliateId', logAffiliatePageAccess, getAfiliateBalance)

export default router;
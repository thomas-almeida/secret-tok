import { Router } from 'express';
import {
  createUser, createCustomer, getUsers, getAfiliateBalance, getUsersOverview, 
  validateAdmin, checkIsAdmin, setAdmin, updateUserCRM, getModelByUsername,
  updateCustomPlans, updateCustomModel, registerSession, createModelTransaction
} from '../controllers/userController.js';
import { logAffiliatePageAccess } from '../middleware/notificationLogger.js';

const router = Router();

router.post('/create', createUser);
router.post('/customer', createCustomer);
router.get('/overview', getUsersOverview);
router.post('/check-admin', checkIsAdmin);
router.post('/set-admin', setAdmin);
router.post('/validate-admin', validateAdmin);
router.put('/update-crm', updateUserCRM);
router.get('/afiliate/:afiliateId', logAffiliatePageAccess, getAfiliateBalance);
router.get('/model/:username', getModelByUsername);
router.put('/:userId/custom-plans', updateCustomPlans);
router.put('/:userId/custom-model', updateCustomModel);
router.post('/:userId/register-session', registerSession);
router.post('/model/:username/transactions', createModelTransaction);

export default router;
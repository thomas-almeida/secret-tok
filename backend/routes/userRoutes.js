import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController.js';

const router = Router();

router.post('/create', createUser);
router.get('/overview', getUsers);

export default router;
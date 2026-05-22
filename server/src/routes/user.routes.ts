import { Router } from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/:id', authenticate, getUserById);

export default router;

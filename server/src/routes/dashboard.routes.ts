import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/summary', authenticate, getSummary);

export default router;

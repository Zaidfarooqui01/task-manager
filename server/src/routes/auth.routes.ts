import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;

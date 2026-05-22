import { Router } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();

router.post('/', authenticate, requireAdmin, validate(createTaskSchema), createTask);
router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.patch('/:id', authenticate, validate(updateTaskSchema), updateTask);
router.delete('/:id', authenticate, requireAdmin, deleteTask);

export default router;

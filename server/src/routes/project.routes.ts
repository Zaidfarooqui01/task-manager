import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/project.validator';

const router = Router();

router.post('/', authenticate, requireAdmin, validate(createProjectSchema), createProject);
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id', authenticate, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);
router.post('/:id/members', authenticate, requireAdmin, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authenticate, requireAdmin, removeMember);

export default router;

import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string({ message: 'User ID is required' }),
});

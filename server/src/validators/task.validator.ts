import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
  projectId: z.string({ message: 'Project ID is required' }),
  assignedToId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
});

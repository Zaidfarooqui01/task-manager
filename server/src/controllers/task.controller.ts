import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function createTask(req: Request, res: Response) {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;
    const userId = req.user!.id;

    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // If assignedToId provided, validate user is a project member
    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToId } },
      });
      if (!isMember) {
        res.status(400).json({ success: false, message: 'Assigned user is not a member of this project.' });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: task });
    return;
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getTasks(req: Request, res: Response) {
  try {
    const user = req.user!;

    let tasks;

    if (user.role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assignedToId: user.id },
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({ success: true, data: tasks });
    return;
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    // Members can only see tasks assigned to them
    if (user.role !== 'ADMIN' && task.assignedToId !== user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({ success: true, data: task });
    return;
  } catch (error) {
    console.error('GetTaskById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    let updateData: any = {};

    if (user.role === 'ADMIN') {
      // Admin can update any field
      const { title, description, status, priority, dueDate, assignedToId } = req.body;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    } else {
      // Member can ONLY update status on tasks assigned to them
      if (task.assignedToId !== user.id) {
        res.status(403).json({ success: false, message: 'Access denied. You can only update tasks assigned to you.' });
        return;
      }

      const { status } = req.body;
      if (status === undefined) {
        res.status(400).json({ success: false, message: 'Members can only update the status field.' });
        return;
      }

      // Only allow status update for members
      updateData.status = status;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
    return;
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    return;
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getSummary(req: Request, res: Response) {
  try {
    const user = req.user!;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    if (user.role === 'ADMIN') {
      // Admin dashboard
      const totalProjects = await prisma.project.count();
      const totalTasks = await prisma.task.count();

      const todoCount = await prisma.task.count({ where: { status: 'TODO' } });
      const inProgressCount = await prisma.task.count({ where: { status: 'IN_PROGRESS' } });
      const doneCount = await prisma.task.count({ where: { status: 'DONE' } });

      const overdueTasks = await prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      });

      const tasksDueToday = await prisma.task.count({
        where: {
          dueDate: { gte: startOfToday, lt: endOfToday },
        },
      });

      // Project summaries
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          tasks: {
            select: { status: true },
          },
        },
      });

      const projectSummaries = projects.map((p) => ({
        projectId: p.id,
        projectName: p.name,
        todo: p.tasks.filter((t) => t.status === 'TODO').length,
        inProgress: p.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        done: p.tasks.filter((t) => t.status === 'DONE').length,
        total: p.tasks.length,
      }));

      res.status(200).json({
        success: true,
        data: {
          totalProjects,
          totalTasks,
          tasksByStatus: {
            todo: todoCount,
            inProgress: inProgressCount,
            done: doneCount,
          },
          overdueTasks,
          tasksDueToday,
          projectSummaries,
        },
      });
      return;
    } else {
      // Member dashboard
      const myTotalTasks = await prisma.task.count({
        where: { assignedToId: user.id },
      });

      const myTodo = await prisma.task.count({
        where: { assignedToId: user.id, status: 'TODO' },
      });
      const myInProgress = await prisma.task.count({
        where: { assignedToId: user.id, status: 'IN_PROGRESS' },
      });
      const myDone = await prisma.task.count({
        where: { assignedToId: user.id, status: 'DONE' },
      });

      const myOverdueTasks = await prisma.task.count({
        where: {
          assignedToId: user.id,
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
      });

      const myTasksDueToday = await prisma.task.count({
        where: {
          assignedToId: user.id,
          dueDate: { gte: startOfToday, lt: endOfToday },
        },
      });

      const recentTasks = await prisma.task.findMany({
        where: { assignedToId: user.id },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      res.status(200).json({
        success: true,
        data: {
          myTotalTasks,
          myTasksByStatus: {
            todo: myTodo,
            inProgress: myInProgress,
            done: myDone,
          },
          myOverdueTasks,
          myTasksDueToday,
          recentTasks,
        },
      });
      return;
    }
  } catch (error) {
    console.error('GetSummary error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

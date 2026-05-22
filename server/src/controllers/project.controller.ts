import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function createProject(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: userId,
        members: {
          create: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });

    res.status(201).json({ success: true, data: project });
    return;
  } catch (error) {
    console.error('CreateProject error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getProjects(req: Request, res: Response) {
  try {
    const user = req.user!;

    let projects;

    if (user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          _count: {
            select: { members: true, tasks: true },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId: user.id },
          },
        },
        include: {
          _count: {
            select: { members: true, tasks: true },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({ success: true, data: projects });
    return;
  } catch (error) {
    console.error('GetProjects error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // Members can only access projects they belong to
    if (user.role !== 'ADMIN') {
      const isMember = project.members.some((m: any) => m.userId === user.id);
      if (!isMember) {
        res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
        return;
      }
    }

    res.status(200).json({ success: true, data: project });
    return;
  } catch (error) {
    console.error('GetProjectById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.status(200).json({ success: true, data: updated });
    return;
  } catch (error) {
    console.error('UpdateProject error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
    return;
  } catch (error) {
    console.error('DeleteProject error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { userId } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });
    if (existingMember) {
      res.status(409).json({ success: false, message: 'User is already a member of this project.' });
      return;
    }

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: member });
    return;
  } catch (error) {
    console.error('AddMember error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.params.userId as string;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (!membership) {
      res.status(404).json({ success: false, message: 'Member not found in this project.' });
      return;
    }

    await prisma.projectMember.delete({
      where: { id: membership.id },
    });

    res.status(200).json({ success: true, message: 'Member removed successfully.' });
    return;
  } catch (error) {
    console.error('RemoveMember error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: users });
    return;
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, data: user });
    return;
  } catch (error) {
    console.error('GetUserById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

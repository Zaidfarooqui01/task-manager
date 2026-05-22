import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already in use.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'MEMBER',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
    return;
  }
}

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - support comma-separated origins for production
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrl.split(',').map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;

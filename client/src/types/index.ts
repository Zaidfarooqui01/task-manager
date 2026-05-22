export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdBy?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: { members: number; tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  project?: Project;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: { todo: number; inProgress: number; done: number };
  overdueTasks: number;
  tasksDueToday: number;
  projectSummaries?: Array<{
    projectId: string;
    projectName: string;
    todo: number;
    inProgress: number;
    done: number;
    total: number;
  }>;
  myTotalTasks?: number;
  myTasksByStatus?: { todo: number; inProgress: number; done: number };
  myOverdueTasks?: number;
  myTasksDueToday?: number;
  recentTasks?: Task[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

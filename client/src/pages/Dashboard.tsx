import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../api/dashboard';
import { UserRole, TaskStatus, type DashboardSummary, type Task } from '../types';
import { SkeletonStatCards, SkeletonTable } from '../components/ui/Skeleton';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import {
  FolderKanban,
  ListTodo,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await dashboardApi.getSummary();
        setSummary(res.data ?? null);
      } catch {
        // Silently handle — dashboard is optional
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statCards = isAdmin
    ? [
        {
          label: 'Total Projects',
          value: summary?.totalProjects ?? 0,
          icon: FolderKanban,
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'bg-indigo-500/10',
          textColor: 'text-indigo-400',
        },
        {
          label: 'Total Tasks',
          value: summary?.totalTasks ?? 0,
          icon: ListTodo,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400',
        },
        {
          label: 'Overdue Tasks',
          value: summary?.overdueTasks ?? 0,
          icon: AlertTriangle,
          color: 'from-rose-500 to-pink-500',
          bgColor: 'bg-rose-500/10',
          textColor: 'text-rose-400',
        },
        {
          label: 'Due Today',
          value: summary?.tasksDueToday ?? 0,
          icon: Clock,
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-400',
        },
      ]
    : [
        {
          label: 'My Tasks',
          value: summary?.myTotalTasks ?? summary?.totalTasks ?? 0,
          icon: ListTodo,
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'bg-indigo-500/10',
          textColor: 'text-indigo-400',
        },
        {
          label: 'Completed',
          value: summary?.myTasksByStatus?.done ?? summary?.tasksByStatus?.done ?? 0,
          icon: CheckCircle2,
          color: 'from-emerald-500 to-teal-500',
          bgColor: 'bg-emerald-500/10',
          textColor: 'text-emerald-400',
        },
        {
          label: 'Overdue',
          value: summary?.myOverdueTasks ?? summary?.overdueTasks ?? 0,
          icon: AlertTriangle,
          color: 'from-rose-500 to-pink-500',
          bgColor: 'bg-rose-500/10',
          textColor: 'text-rose-400',
        },
        {
          label: 'Due Today',
          value: summary?.myTasksDueToday ?? summary?.tasksDueToday ?? 0,
          icon: Clock,
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-400',
        },
      ];

  const tasksByStatus = isAdmin
    ? summary?.tasksByStatus
    : summary?.myTasksByStatus ?? summary?.tasksByStatus;

  const totalStatusTasks =
    (tasksByStatus?.todo ?? 0) +
    (tasksByStatus?.inProgress ?? 0) +
    (tasksByStatus?.done ?? 0);

  const getPercentage = (val: number) =>
    totalStatusTasks > 0 ? Math.round((val / totalStatusTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStatCards />
        <SkeletonTable rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 mt-1">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">{card.label}</p>
              <div className={`p-2.5 rounded-xl ${card.bgColor} transition-transform group-hover:scale-110`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-100">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalStatusTasks > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Tasks by Status
            </h3>
            <span className="text-sm text-slate-400">{totalStatusTasks} total</span>
          </div>

          {/* Progress bar */}
          <div className="h-4 rounded-full overflow-hidden bg-slate-700/50 flex">
            {(tasksByStatus?.done ?? 0) > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-700"
                style={{ width: `${getPercentage(tasksByStatus?.done ?? 0)}%` }}
              />
            )}
            {(tasksByStatus?.inProgress ?? 0) > 0 && (
              <div
                className="bg-blue-500 transition-all duration-700"
                style={{ width: `${getPercentage(tasksByStatus?.inProgress ?? 0)}%` }}
              />
            )}
            {(tasksByStatus?.todo ?? 0) > 0 && (
              <div
                className="bg-slate-500 transition-all duration-700"
                style={{ width: `${getPercentage(tasksByStatus?.todo ?? 0)}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-400">
                Done ({tasksByStatus?.done ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-400">
                In Progress ({tasksByStatus?.inProgress ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-sm text-slate-400">
                Todo ({tasksByStatus?.todo ?? 0})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom section */}
      {isAdmin && summary?.projectSummaries && summary.projectSummaries.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Project Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Todo</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">In Progress</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Done</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.projectSummaries.map((proj) => (
                  <tr
                    key={proj.projectId}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${proj.projectId}`)}
                  >
                    <td className="py-3 px-4 text-slate-200 font-medium">{proj.projectName}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{proj.todo}</td>
                    <td className="py-3 px-4 text-center text-blue-400">{proj.inProgress}</td>
                    <td className="py-3 px-4 text-center text-emerald-400">{proj.done}</td>
                    <td className="py-3 px-4 text-center text-slate-300 font-medium">{proj.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent tasks for members */}
      {!isAdmin && summary?.recentTasks && summary.recentTasks.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {summary.recentTasks.slice(0, 5).map((task: Task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 cursor-pointer transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{task.project?.name}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

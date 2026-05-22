import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tasksApi } from '../api/tasks';
import { UserRole, TaskStatus, TaskPriority, type Task } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  User,
  FolderKanban,
  AlertTriangle,
  Loader2,
  Save,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [editPriority, setEditPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [editDueDate, setEditDueDate] = useState('');

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchTask = useCallback(async () => {
    if (!id) return;
    try {
      const res = await tasksApi.getById(id);
      const t = res.data ?? null;
      setTask(t);
      if (t) {
        setEditTitle(t.title);
        setEditDesc(t.description ?? '');
        setEditStatus(t.status);
        setEditPriority(t.priority);
        setEditDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
      }
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await tasksApi.delete(id);
      toast.success('Task deleted');
      navigate(task?.projectId ? `/projects/${task.projectId}` : '/projects');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = isAdmin
        ? {
            title: editTitle,
            description: editDesc || undefined,
            status: editStatus,
            priority: editPriority,
            dueDate: editDueDate || undefined,
          }
        : { status: editStatus };

      await tasksApi.update(id, payload);
      toast.success('Task updated');
      setIsEditing(false);
      fetchTask();
    } catch {
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id) return;
    try {
      await tasksApi.update(id, { status: newStatus });
      toast.success('Status updated');
      fetchTask();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-700/50 rounded-lg animate-pulse" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!task) {
    return (
      <EmptyState
        title="Task not found"
        description="The task you're looking for doesn't exist."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() =>
              navigate(task.projectId ? `/projects/${task.projectId}` : '/projects')
            }
            className="mt-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Task Details</h2>
            <p className="text-slate-400 text-sm mt-1">
              {task.project?.name && (
                <span
                  className="cursor-pointer hover:text-primary-400 transition-colors"
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                >
                  {task.project.name}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overdue banner */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-slide-in">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <p className="text-sm text-rose-300">
            This task is overdue! Due date was{' '}
            {new Date(task.dueDate!).toLocaleDateString()}.
          </p>
        </div>
      )}

      {/* Task card */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6">
        {isEditing && isAdmin ? (
          /* Admin edit form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                >
                  <option value={TaskStatus.TODO}>Todo</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.DONE}>Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Read view */
          <>
            <div>
              <h3 className="text-xl font-semibold text-slate-100">{task.title}</h3>
              {task.description && (
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{task.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Member status toggle */}
            {!isAdmin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Update Status</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                >
                  <option value={TaskStatus.TODO}>Todo</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.DONE}>Done</option>
                </select>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700/30">
                  <FolderKanban className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Project</p>
                  <p className="text-sm text-slate-300">{task.project?.name ?? 'Unknown'}</p>
                </div>
              </div>

              {task.assignedTo && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/30">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    <p className="text-sm text-slate-300">{task.assignedTo.name}</p>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOverdue ? 'bg-rose-500/10' : 'bg-slate-700/30'}`}>
                    <Calendar className={`w-4 h-4 ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Due Date</p>
                    <p className={`text-sm ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {task.createdBy && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/30">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created By</p>
                    <p className="text-sm text-slate-300">{task.createdBy.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="text-xs text-slate-600 pt-4 border-t border-slate-700/50 flex gap-6">
              <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
      />
    </div>
  );
}

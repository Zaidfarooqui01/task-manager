import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { usersApi } from '../api/users';
import { UserRole, TaskStatus, TaskPriority, type Project, type Task, type User } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import RoleBadge from '../components/ui/RoleBadge';
import { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Users,
  ListTodo,
  Calendar,
  UserPlus,
  UserMinus,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const projRes = await projectsApi.getById(id);
      setProject(projRes.data ?? null);
      setTasks(projRes.data?.tasks ?? []);
      if (projRes.data) {
        setEditName(projRes.data.name);
        setEditDesc(projRes.data.description ?? '');
      }
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (isAdmin) {
      usersApi.getAll().then((res) => setAllUsers(res.data ?? [])).catch(() => {});
    }
  }, [isAdmin]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await projectsApi.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleUpdateProject = async () => {
    if (!id) return;
    try {
      await projectsApi.update(id, { name: editName, description: editDesc });
      toast.success('Project updated');
      setIsEditing(false);
      fetchProject();
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!id) return;
    try {
      await projectsApi.addMember(id, userId);
      toast.success('Member added');
      setShowAddMember(false);
      fetchProject();
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await projectsApi.removeMember(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskTitle.trim()) return;
    setTaskSubmitting(true);
    try {
      await tasksApi.create({
        title: taskTitle,
        description: taskDesc || undefined,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        projectId: id,
        assignedToId: taskAssignee || undefined,
      });
      toast.success('Task created');
      setShowTaskForm(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus(TaskStatus.TODO);
      setTaskPriority(TaskPriority.MEDIUM);
      setTaskDueDate('');
      setTaskAssignee('');
      fetchProject();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const filteredTasks =
    statusFilter === 'ALL' ? tasks : tasks.filter((t) => t.status === statusFilter);

  const memberIds = new Set(project?.members?.map((m) => m.userId) ?? []);
  const availableUsers = allUsers.filter((u) => !memberIds.has(u.id));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-700/50 rounded-lg animate-pulse" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="mt-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-sm bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProject}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-100">{project.name}</h2>
                {project.description && (
                  <p className="text-slate-400 mt-1">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {project.members?.length ?? 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5" />
                    {tasks.length} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {isAdmin && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
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
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 w-fit">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'tasks'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Tasks ({tasks.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'members'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members ({project.members?.length ?? 0})
          </span>
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none w-fit"
            >
              <option value="ALL">All Status</option>
              <option value={TaskStatus.TODO}>Todo</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>

            {isAdmin && (
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25"
              >
                {showTaskForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showTaskForm ? 'Cancel' : 'Add Task'}
              </button>
            )}
          </div>

          {/* Task Form */}
          {showTaskForm && (
            <form
              onSubmit={handleCreateTask}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-4 animate-slide-up"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
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
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignee</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {(project?.members ?? []).map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.name ?? m.userId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {taskSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Task
                </button>
              </div>
            </form>
          )}

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="w-12 h-12 text-slate-500" />}
              title="No tasks yet"
              description={
                statusFilter !== 'ALL'
                  ? 'No tasks with this status'
                  : 'Create the first task for this project'
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== TaskStatus.DONE;

                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all group hover:shadow-lg ${
                      isOverdue
                        ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {task.assignedTo && (
                          <span className="text-xs text-slate-500">{task.assignedTo.name}</span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              isOverdue ? 'text-rose-400' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {isAdmin && (
            <div>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25"
              >
                {showAddMember ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {showAddMember ? 'Cancel' : 'Add Member'}
              </button>

              {showAddMember && availableUsers.length > 0 && (
                <div className="mt-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2 animate-slide-up">
                  {availableUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(u.id)}
                        className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {showAddMember && availableUsers.length === 0 && (
                <p className="mt-3 text-sm text-slate-500">No more users available to add.</p>
              )}
            </div>
          )}

          {/* Member list */}
          {(project.members?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12 text-slate-500" />}
              title="No members yet"
              description="Add members to this project"
            />
          ) : (
            <div className="space-y-2">
              {project.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {member.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-200">
                          {member.user?.name ?? 'Unknown'}
                        </p>
                        {member.user?.role && <RoleBadge role={member.user.role} />}
                      </div>
                      <p className="text-xs text-slate-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setShowRemoveMember(member.userId)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all tasks and remove all members. This action cannot be undone."
        confirmLabel="Delete Project"
      />

      {/* Remove Member Confirm */}
      <ConfirmDialog
        isOpen={!!showRemoveMember}
        onClose={() => setShowRemoveMember(null)}
        onConfirm={() => {
          if (showRemoveMember) handleRemoveMember(showRemoveMember);
        }}
        title="Remove Member"
        message="Are you sure you want to remove this member from the project?"
        confirmLabel="Remove"
      />
    </div>
  );
}

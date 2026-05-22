import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { projectsApi } from '../api/projects';
import { UserRole, type Project } from '../types';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Plus, Search, FolderKanban, Users, ListTodo, Calendar } from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsApi.getAll();
        setProjects(res.data ?? []);
      } catch {
        // handled by axios interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
          <p className="text-slate-400 mt-1">Manage and track your team projects</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="w-12 h-12 text-slate-500" />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={
            search
              ? 'Try adjusting your search terms'
              : isAdmin
              ? 'Create your first project to get started'
              : 'You haven\'t been added to any projects yet'
          }
          actionLabel={isAdmin && !search ? 'Create Project' : undefined}
          onAction={isAdmin && !search ? () => navigate('/projects/new') : undefined}
        />
      )}

      {/* Project grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-slate-900/50"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                  <FolderKanban className="w-5 h-5 text-primary-400" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-100 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">{project.description}</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {project._count?.members ?? project.members?.length ?? 0} members
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5" />
                  {project._count?.tasks ?? project.tasks?.length ?? 0} tasks
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

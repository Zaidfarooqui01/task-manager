import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ui/ThemeToggle';
import RoleBadge from './ui/RoleBadge';
import {
  LayoutDashboard,
  FolderKanban,
  UserCircle,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects/new') return 'New Project';
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/tasks/')) return 'Task Details';
    if (path === '/profile') return 'Profile';
    return 'Dashboard';
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User card at bottom */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              {user?.role && <RoleBadge role={user.role} />}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors mr-4"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-semibold text-slate-100">{getPageTitle()}</h1>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm text-slate-300">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

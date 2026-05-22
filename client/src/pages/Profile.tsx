import { useAuth } from '../hooks/useAuth';
import RoleBadge from '../components/ui/RoleBadge';
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-200">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="text-sm text-slate-200">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <UserCircle className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">User ID</p>
                <p className="text-sm text-slate-200 font-mono">{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Calendar className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="text-sm text-slate-200">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { UserRole } from '../../types';
import { Shield, User } from 'lucide-react';

export default function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.ADMIN) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/30">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
      <User className="w-3 h-3" />
      Member
    </span>
  );
}

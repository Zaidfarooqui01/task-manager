import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-6">
        {icon || <Inbox className="w-12 h-12 text-slate-500" />}
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm text-center max-w-md">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

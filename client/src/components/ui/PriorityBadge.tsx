import { TaskPriority } from '../../types';

const priorityConfig: Record<TaskPriority, { label: string; classes: string }> = {
  [TaskPriority.LOW]: {
    label: 'Low',
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority] ?? priorityConfig[TaskPriority.LOW];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

import { TaskStatus } from '../../types';

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  [TaskStatus.TODO]: {
    label: 'Todo',
    classes: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status] ?? statusConfig[TaskStatus.TODO];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === TaskStatus.TODO
            ? 'bg-slate-400'
            : status === TaskStatus.IN_PROGRESS
            ? 'bg-blue-400'
            : 'bg-emerald-400'
        }`}
      />
      {config.label}
    </span>
  );
}

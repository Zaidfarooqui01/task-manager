export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-700/50 ${className}`}
      style={{ height: className.includes('h-') ? undefined : '16px' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-slate-700/50 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-700/50 rounded-lg w-full" />
      <div className="h-4 bg-slate-700/50 rounded-lg w-1/2" />
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-slate-700/50 rounded-full" />
        <div className="h-6 w-16 bg-slate-700/50 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl animate-pulse"
        >
          <div className="h-4 bg-slate-700/50 rounded-lg flex-1" />
          <div className="h-4 bg-slate-700/50 rounded-lg w-24" />
          <div className="h-4 bg-slate-700/50 rounded-lg w-20" />
          <div className="h-6 bg-slate-700/50 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-700/50 rounded-lg w-24" />
            <div className="h-10 w-10 bg-slate-700/50 rounded-xl" />
          </div>
          <div className="mt-4 h-8 bg-slate-700/50 rounded-lg w-16" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonProps {
  cantidad?: number;
  variant?: 'card' | 'row';
}

export function Skeleton({ cantidad = 6, variant = 'card' }: SkeletonProps) {
  const items = Array.from({ length: cantidad }, (_, i) => i);

  if (variant === 'row') {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="h-14 w-full animate-pulse rounded-xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 h-44 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mb-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

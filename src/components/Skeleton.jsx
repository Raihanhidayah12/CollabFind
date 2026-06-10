const pulse = 'animate-pulse rounded-lg bg-white/[0.06]';

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${pulse}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-3.5 w-2/3 ${pulse}`} />
          <div className={`h-2.5 w-1/3 ${pulse}`} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2.5 ${pulse}`} style={{ width: `${85 - i * 15}%` }} />
      ))}
      <div className={`h-9 w-full ${pulse}`} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-xl ${pulse}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-3 w-2/3 ${pulse}`} />
        <div className={`h-2.5 w-1/3 ${pulse}`} />
      </div>
    </div>
  );
}

export function SkeletonAvatar() {
  return <div className={`w-12 h-12 rounded-xl ${pulse}`} />;
}

export function SkeletonGrid({ count = 6, lines = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

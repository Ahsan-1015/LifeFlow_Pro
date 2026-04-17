const SkeletonCard = ({ className = "" }) => (
  <div className={`animate-pulse rounded-3xl bg-white/60 p-5 shadow-glass dark:bg-slate-900/60 ${className}`}>
    <div className="mb-4 h-4 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mb-3 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
    <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);

export default SkeletonCard;

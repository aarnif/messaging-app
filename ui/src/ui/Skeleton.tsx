const Skeleton = () => (
  <div className="flex animate-pulse gap-4 p-2">
    <div className="h-12 w-full max-w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
    <div className="flex w-full flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded-lg bg-slate-300 dark:bg-slate-600" />
        <div className="h-3 w-16 rounded-lg bg-slate-300 dark:bg-slate-600" />
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-48 rounded-lg bg-slate-300 dark:bg-slate-600" />
      </div>
    </div>
  </div>
);

export default Skeleton;

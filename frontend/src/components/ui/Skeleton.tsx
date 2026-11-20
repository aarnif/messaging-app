import { motion } from "motion/react";

const Skeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
    className="flex h-0 grow flex-col gap-2 overflow-hidden p-2"
  >
    {Array.from({ length: 15 }).map((_, index) => (
      <div key={index} className="flex gap-4 p-2">
        <div className="motion-safe:animate-shimmer h-12 w-full max-w-12 rounded-full bg-slate-300 dark:bg-slate-600 bg-linear-to-r from-slate-300 via-slate-200/70 to-slate-300 dark:from-slate-600 dark:via-slate-500/70 dark:to-slate-600 bg-size-[200%_100%]" />
        <div className="flex w-full flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="motion-safe:animate-shimmer h-4 w-32 rounded-lg bg-slate-300 dark:bg-slate-600 bg-linear-to-r from-slate-300 via-slate-200/70 to-slate-300 dark:from-slate-600 dark:via-slate-500/70 dark:to-slate-600 bg-size-[200%_100%]" />
            <div className="motion-safe:animate-shimmer h-3 w-16 rounded-lg bg-slate-300 dark:bg-slate-600 bg-linear-to-r from-slate-300 via-slate-200/70 to-slate-300 dark:from-slate-600 dark:via-slate-500/70 dark:to-slate-600 bg-size-[200%_100%]" />
          </div>
          <div className="flex justify-between">
            <div className="motion-safe:animate-shimmer h-3 w-48 rounded-lg bg-slate-300 dark:bg-slate-600 bg-linear-to-r from-slate-300 via-slate-200/70 to-slate-300 dark:from-slate-600 dark:via-slate-500/70 dark:to-slate-600 bg-size-[200%_100%]" />
          </div>
        </div>
      </div>
    ))}
  </motion.div>
);

export default Skeleton;

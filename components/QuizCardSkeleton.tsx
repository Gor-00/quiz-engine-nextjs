"use client";

type QuizCardSkeletonProps = {
  count?: number;
  className?: string;
};

export function QuizCardSkeleton({
  count = 6,
  className = "grid gap-4 sm:grid-cols-3"
}: QuizCardSkeletonProps) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
        >
          <div className="aspect-[16/9] animate-pulse bg-slate-950" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-900" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-900" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-8 w-24 animate-pulse rounded-full bg-slate-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-900" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

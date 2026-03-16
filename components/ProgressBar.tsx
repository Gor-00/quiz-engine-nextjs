"use client";

type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


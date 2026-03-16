type BadgeDisplayProps = {
  score: number;
  total: number;
};

export function BadgeDisplay({ score, total }: BadgeDisplayProps) {
  const ratio = score / total;

  let label = "Quiz Explorer";
  let color = "bg-slate-800 text-slate-100";

  if (ratio >= 0.8) {
    label = "Quiz Legend 🏆";
    color = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  } else if (ratio >= 0.5) {
    label = "Rising Star ✨";
    color = "bg-indigo-500/15 text-indigo-200 border-indigo-500/40";
  } else {
    label = "Nice Try 💪";
    color = "bg-slate-800 text-slate-200 border-slate-600";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${color}`}
    >
      {label}
    </span>
  );
}


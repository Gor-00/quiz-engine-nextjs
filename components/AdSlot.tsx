type AdSlotProps = {
  position: "top" | "inline" | "result" | "sticky";
};

export function AdSlot({ position }: AdSlotProps) {
  const labelMap: Record<AdSlotProps["position"], string> = {
    top: "Top Banner Ad",
    inline: "Inline Content Ad",
    result: "Result Page Ad",
    sticky: "Sticky Bottom Ad"
  };

  return (
    <div
      className="my-4 flex items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-xs uppercase tracking-wide text-slate-500"
      aria-label={labelMap[position]}
    >
      <div className="text-center">
        <div className="font-semibold text-slate-300">
          {labelMap[position]}
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          AdSense placeholder · 728x90 / 320x100
        </div>
      </div>
    </div>
  );
}


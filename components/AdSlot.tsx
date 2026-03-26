"use client";

import { useEffect } from "react";

type AdPosition = "top" | "inline" | "result" | "sticky" | "left" | "right";

type AdSlotProps = {
  position: AdPosition;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const labelMap: Record<AdPosition, string> = {
  top: "Top Banner Ad",
  inline: "Inline Content Ad",
  result: "Result Page Ad",
  sticky: "Sticky Bottom Ad",
  left: "Left Sidebar Ad",
  right: "Right Sidebar Ad"
};

const defaultSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT;

const slotMap: Record<AdPosition, string | undefined> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || defaultSlot,
  inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE || defaultSlot,
  result: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT || defaultSlot,
  sticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY || defaultSlot,
  left: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT || defaultSlot,
  right: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT || defaultSlot
};

const formatMap: Record<AdPosition, "auto" | "horizontal"> = {
  top: "horizontal",
  inline: "auto",
  result: "auto",
  sticky: "horizontal",
  left: "auto",
  right: "auto"
};

export function AdSlot({ position }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = slotMap[position];
  const canRenderAd = Boolean(client && slot);
  const isSide = position === "left" || position === "right";
  const wrapperClass =
    position === "sticky"
      ? "overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-2"
      : isSide
        ? "h-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-2"
      : "my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-2";

  useEffect(() => {
    if (!canRenderAd) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate push/render timing issues.
    }
  }, [canRenderAd, position]);

  if (!canRenderAd) {
    return (
      <div
        className={
          position === "sticky"
            ? "flex items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-4 py-3 text-xs uppercase tracking-wide text-slate-500"
            : isSide
              ? "flex h-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-xs uppercase tracking-wide text-slate-500"
            : "my-4 flex items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-xs uppercase tracking-wide text-slate-500"
        }
        aria-label={labelMap[position]}
      >
        <div className="text-center">
          <div className="font-semibold text-slate-300">{labelMap[position]}</div>
          <div className="mt-1 text-[10px] text-slate-500">
            Set NEXT_PUBLIC_ADSENSE_CLIENT and slot env vars
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <ins
        className="adsbygoogle block"
        style={isSide ? { display: "block", height: "100%" } : { display: "block", minHeight: 90 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={formatMap[position]}
        data-full-width-responsive="true"
        aria-label={labelMap[position]}
      />
    </div>
  );
}


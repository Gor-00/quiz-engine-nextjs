"use client";

import { AdSlot } from "./AdSlot";

export function StickyAd() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="pointer-events-auto w-full max-w-3xl px-3 pb-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 shadow-soft backdrop-blur">
          <AdSlot position="sticky" />
        </div>
      </div>
    </div>
  );
}


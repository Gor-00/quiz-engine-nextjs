"use client";

import { usePathname } from "next/navigation";
import { AdSlot } from "./AdSlot";

export function SideAds() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-4 top-20 z-20 hidden xl:block">
        <div className="pointer-events-auto h-full w-[180px] py-4">
          <AdSlot position="left" />
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-0 right-4 top-20 z-20 hidden xl:block">
        <div className="pointer-events-auto h-full w-[180px] py-4">
          <AdSlot position="right" />
        </div>
      </div>
    </>
  );
}

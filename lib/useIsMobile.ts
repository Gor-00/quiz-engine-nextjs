"use client";

import { useEffect, useState } from "react";

/**
 * True when the viewport is considered "mobile" (below Tailwind `sm` = 640px).
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");

    const update = () => setIsMobile(mql.matches);
    update();

    // Safari < 14 fallback.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return isMobile;
}


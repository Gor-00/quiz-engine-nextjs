"use client";

import Link from "next/link";
import { useIsMobile } from "@/lib/useIsMobile";

type PlayAnotherQuizLinkProps = {
  nextQuizSlug: string;
  nextQuizTitle: string;
  hrefBase?: string;
};

export function PlayAnotherQuizLink({
  nextQuizSlug,
  nextQuizTitle,
  hrefBase = "/quiz"
}: PlayAnotherQuizLinkProps) {
  const isMobile = useIsMobile();

  const href = isMobile
    ? `${hrefBase}/${nextQuizSlug}?start=1`
    : `${hrefBase}/${nextQuizSlug}`;

  return (
    <div className="flex justify-center">
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-fuchsia-400"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      >
        Play another quiz: {nextQuizTitle} ➡️
      </Link>
    </div>
  );
}


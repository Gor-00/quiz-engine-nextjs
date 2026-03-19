"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Quiz } from "@/lib/types";
import { useI18n } from "./LanguageProvider";
import type { ApiQuiz } from "@/lib/quizTransform";
import { apiQuizToUiQuiz } from "@/lib/quizTransform";
import { useIsMobile } from "@/lib/useIsMobile";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, localize } = useI18n();
  const isMobile = useIsMobile();

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/quizzes", { cache: "no-store" });
      if (!res.ok) {
        if (active) setLoading(false);
        return;
      }
      const data = (await res.json()) as ApiQuiz[];
      if (!active) return;
      setQuizzes(data.map(apiQuizToUiQuiz));
      setLoading(false);
    }

    void load().catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return quizzes
      .filter((quiz) => {
        const title = localize(quiz.title).toLowerCase();
        const desc = localize(quiz.description).toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          quiz.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [localize, query]);

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay so click on result still registers.
          setTimeout(() => setFocused(false), 120);
        }}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {showResults ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950/95 text-xs shadow-soft backdrop-blur">
          {loading ? (
            <div className="px-3 py-2 text-slate-400">Loading…</div>
          ) : results.length > 0 ? (
            <ul className="max-h-72 overflow-auto">
              {results.map((quiz) => (
                <li key={quiz.slug}>
                  <Link
                    href={
                      isMobile
                        ? `/quiz/${quiz.slug}?start=1`
                        : `/quiz/${quiz.slug}`
                    }
                    className="block px-3 py-2 text-slate-100 hover:bg-slate-800"
                  >
                    <span className="block text-[11px] uppercase tracking-wide text-slate-500">
                      {quiz.category}
                    </span>
                    <span className="line-clamp-1">
                      {localize(quiz.title)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-slate-400">No results</div>
          )}
        </div>
      ) : null}
    </div>
  );
}


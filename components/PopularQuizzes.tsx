"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "./LanguageProvider";
import { QuizCardSkeleton } from "./QuizCardSkeleton";
import { useIsMobile } from "@/lib/useIsMobile";
import type { Quiz } from "@/lib/types";
import type { ApiQuiz } from "@/lib/quizTransform";
import { apiQuizToUiQuiz } from "@/lib/quizTransform";

export function PopularQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, localize } = useI18n();
  const isMobile = useIsMobile();

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/quizzes", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ApiQuiz[];
      if (!active) return;
      const mapped = data.map(apiQuizToUiQuiz).slice(0, 5);
      setQuizzes(mapped);
      setLoading(false);
    }

    void load().catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {t("popularQuizzes")}
      </h2>
      {loading ? (
        <QuizCardSkeleton count={5} className="grid gap-3 sm:grid-cols-5" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-5">
          {quizzes.map((quiz) => {
            const title = localize(quiz.title);
            return (
              <Link
                key={quiz.slug}
                href={
                  isMobile ? `/quiz/${quiz.slug}?start=1` : `/quiz/${quiz.slug}`
                }
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80"
              >
                <div className="relative aspect-video">
                  <Image
                    src={quiz.image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 40vw, 16vw"
                    className="object-cover transition-transform duration-150 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-[11px] font-semibold text-slate-100">
                    {title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}


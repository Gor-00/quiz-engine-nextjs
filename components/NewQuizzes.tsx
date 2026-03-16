"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "./LanguageProvider";
import type { Quiz } from "@/lib/types";
import type { ApiQuiz } from "@/lib/quizTransform";
import { apiQuizToUiQuiz } from "@/lib/quizTransform";

export function NewQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const { t, localize } = useI18n();

  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch("/api/quizzes", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ApiQuiz[];
      if (!active) return;
      const mapped = data.map(apiQuizToUiQuiz).slice(0, 5);
      setQuizzes(mapped);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {t("newQuizzes")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-5">
        {quizzes.map((quiz) => {
          const title = localize(quiz.title);
          return (
            <Link
              key={quiz.slug}
              href={`/quiz/${quiz.slug}`}
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
    </section>
  );
}


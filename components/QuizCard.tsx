"use client";

import Image from "next/image";
import Link from "next/link";
import type { Quiz } from "@/lib/types";
import { useI18n } from "./LanguageProvider";
import { useIsMobile } from "@/lib/useIsMobile";

type QuizCardProps = {
  quiz: Quiz;
};

export function QuizCard({ quiz }: QuizCardProps) {
  const { localize, t } = useI18n();
  const title = localize(quiz.title);
  const description = localize(quiz.description);
  const isMobile = useIsMobile();
  const quizHref = isMobile ? `/quiz/${quiz.slug}?start=1` : `/quiz/${quiz.slug}`;

  return (
    <article className="quiz-card-hover flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <Link href={quizHref} className="relative block aspect-[16/9]">
        <Image
          src={quiz.image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-400">
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5">
            {quiz.category}
          </span>
          <span className="text-slate-500">Quiz</span>
        </div>
        <h2 className="line-clamp-2 text-base font-semibold leading-snug">
          {title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
          {description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={quizHref}
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400"
          >
            {t("startQuiz")}
          </Link>
          <span className="text-xs text-slate-500">10 questions · 2 options</span>
        </div>
      </div>
    </article>
  );
}


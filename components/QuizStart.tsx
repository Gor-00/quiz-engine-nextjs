"use client";

import { useRouter } from "next/navigation";
import type { Quiz } from "@/lib/types";
import Image from "next/image";
import { useI18n } from "./LanguageProvider";

type QuizStartProps = {
  quiz: Quiz;
};

export function QuizStart({ quiz }: QuizStartProps) {
  const router = useRouter();
  const { localize, t } = useI18n();

  const title = localize(quiz.title);
  const description = localize(quiz.description);

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft sm:grid-cols-[2fr,3fr] sm:p-6">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        <Image
          src={quiz.image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
            {t("viralQuiz")} · {quiz.category}
          </p>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
          <p className="mt-2 text-xs text-slate-500">
            10 questions · 2 answers each · mobile-first
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/quiz/${quiz.slug}?start=1`)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400 sm:flex-none sm:px-6 sm:text-base"
          >
            {t("startQuiz")}
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs text-slate-400 underline-offset-2 hover:underline"
          >
            {t("shareWithFriends")}
          </button>
        </div>
      </div>
    </section>
  );
}


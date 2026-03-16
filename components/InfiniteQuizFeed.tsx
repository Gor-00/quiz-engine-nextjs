"use client";

import { useMemo, useState } from "react";
import type { Quiz } from "@/lib/types";
import { QuizCard } from "./QuizCard";

type InfiniteQuizFeedProps = {
  quizzes: Quiz[];
  initialCount?: number;
  pageSize?: number;
};

export function InfiniteQuizFeed({
  quizzes,
  initialCount = 18,
  pageSize = 18
}: InfiniteQuizFeedProps) {
  const [visible, setVisible] = useState(initialCount);

  const canLoadMore = visible < quizzes.length;

  const visibleQuizzes = useMemo(
    () => quizzes.slice(0, visible),
    [quizzes, visible]
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {visibleQuizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
      {canLoadMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + pageSize)}
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 shadow-soft transition hover:bg-slate-700"
          >
            Load more quizzes ⬇️
          </button>
        </div>
      ) : null}
    </section>
  );
}


"use client";

import type { Quiz } from "@/lib/types";
import { useI18n } from "./LanguageProvider";

type ResultAnswersReviewProps = {
  quiz: Quiz;
  selectedAnswers: Array<number | null>;
};

export function ResultAnswersReview({
  quiz,
  selectedAnswers
}: ResultAnswersReviewProps) {
  const { localize } = useI18n();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft sm:p-6">
      <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
        Review your answers
      </h2>
      <div className="mt-4 space-y-4">
        {quiz.questions.map((question, questionIndex) => {
          const selected = selectedAnswers[questionIndex];

          return (
            <article
              key={`${quiz.slug}-q-${questionIndex}`}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <p className="text-sm font-semibold text-indigo-300">
                Question {questionIndex + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-100">
                {localize(question.question)}
              </h3>

              <div className="mt-3 space-y-2">
                {question.answers.map((answer, answerIndex) => {
                  const isSelected = selected === answerIndex;
                  const isCorrect = answer.correct;
                  const isWrongSelection = isSelected && !isCorrect;

                  const stateClass = isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                    : isWrongSelection
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                      : "border-slate-700 bg-slate-900 text-slate-300";

                  return (
                    <div
                      key={`${questionIndex}-${answerIndex}`}
                      className={`rounded-lg border px-3 py-2 text-sm ${stateClass}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{localize(answer.text)}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {isCorrect
                            ? "Correct"
                            : isWrongSelection
                              ? "Your answer"
                              : isSelected
                                ? "Selected"
                                : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

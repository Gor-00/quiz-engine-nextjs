"use client";

import type { Question } from "@/lib/types";
import { useI18n } from "./LanguageProvider";
import { AnswerButton } from "./AnswerButton";

type QuestionCardProps = {
  question: Question;
  currentIndex: number;
  total: number;
  selectedIndex: number | null;
  onSelect: (answerIndex: number) => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function QuestionCard({
  question,
  currentIndex,
  total,
  selectedIndex,
  onSelect,
  canGoBack,
  canGoNext,
  isLastQuestion,
  onBack,
  onNext
}: QuestionCardProps) {
  const { localize } = useI18n();

  return (
    <div className="animate-fadeUp rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
        Question {currentIndex + 1} of {total}
      </p>
      <h2 className="text-lg font-semibold leading-snug sm:text-xl">
        {localize(question.question)}
      </h2>
      <div className="mt-4 grid gap-3">
        {question.answers.map((answer, idx) => (
          <AnswerButton
            key={idx}
            text={localize(answer.text)}
            selected={selectedIndex === idx}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/70 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? "Finish Quiz" : "Next"}
        </button>
      </div>
    </div>
  );
}


"use client";

import type { Question } from "@/lib/types";
import { useI18n } from "./LanguageProvider";
import { AnswerButton } from "./AnswerButton";

type QuestionCardProps = {
  question: Question;
  currentIndex: number;
  total: number;
  selectedIndex: number | null;
  onSelect: (answerIndex: number, isCorrect: boolean) => void;
};

export function QuestionCard({
  question,
  currentIndex,
  total,
  selectedIndex,
  onSelect
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
            onClick={() => onSelect(idx, answer.correct)}
          />
        ))}
      </div>
    </div>
  );
}


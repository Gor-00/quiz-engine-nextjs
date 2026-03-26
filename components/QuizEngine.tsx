"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Quiz } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { InlineAd } from "./InlineAd";

type QuizEngineProps = {
  quiz: Quiz;
};

export function QuizEngine({ quiz }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | null>>(
    () => Array.from({ length: quiz.questions.length }, () => null)
  );

  const router = useRouter();

  const total = quiz.questions.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    trackEvent("quiz_start", { quizSlug: quiz.slug, category: quiz.category });
  }, [quiz.category, quiz.slug]);

  function handleSelect(answerIndex: number) {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answerIndex;
      return next;
    });
  }

  function goBack() {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  }

  function goNext() {
    const currentSelected = selectedAnswers[currentIndex];
    if (currentSelected === null) return;

    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const finalScore = selectedAnswers.reduce<number>(
      (acc, selected, questionIndex) => {
        if (selected === null) return acc;
        return quiz.questions[questionIndex].answers[selected]?.correct
          ? acc + 1
          : acc;
      },
      0
    );

    trackEvent("quiz_complete", {
      quizSlug: quiz.slug,
      category: quiz.category,
      score: finalScore,
      total
    });

    // Ensure the next page starts at the top on mobile.
    window.scrollTo({ top: 0, behavior: "auto" });

    router.push(
      `/result/${quiz.slug}?score=${encodeURIComponent(
        finalScore
      )}&total=${total}&answers=${encodeURIComponent(selectedAnswers.join(","))}`
    );
  }

  const question = quiz.questions[currentIndex];
  const selectedIndex = selectedAnswers[currentIndex];
  const canGoNext = selectedIndex !== null;

  return (
    <section className="mt-4 space-y-4">
      <ProgressBar current={currentIndex} total={total} />
      <QuestionCard
        question={question}
        currentIndex={currentIndex}
        total={total}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        canGoBack={currentIndex > 0}
        canGoNext={canGoNext}
        isLastQuestion={currentIndex === total - 1}
        onBack={goBack}
        onNext={goNext}
      />
      <InlineAd afterQuestion={currentIndex + 1} />
    </section>
  );
}


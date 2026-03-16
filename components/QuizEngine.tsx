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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const router = useRouter();

  const total = quiz.questions.length;

  const showAdAfter = useMemo(() => new Set([2, 5, 8]), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    trackEvent("quiz_start", { quizSlug: quiz.slug, category: quiz.category });
  }, [quiz.category, quiz.slug]);

  function handleSelect(answerIndex: number, isCorrect: boolean) {
    if (isTransitioning) return;

    setSelectedIndex(answerIndex);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsTransitioning(true);

    setTimeout(() => {
      const finalScore = score + (isCorrect ? 1 : 0);

      if (currentIndex + 1 >= total) {
        trackEvent("quiz_complete", {
          quizSlug: quiz.slug,
          category: quiz.category,
          score: finalScore,
          total
        });

        router.push(
          `/result/${quiz.slug}?score=${encodeURIComponent(
            finalScore
          )}&total=${total}`
        );
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setIsTransitioning(false);
    }, 500);
  }

  const question = quiz.questions[currentIndex];
  const afterIndex = currentIndex + 1;

  return (
    <section className="mt-4 space-y-4">
      <ProgressBar current={currentIndex} total={total} />
      <QuestionCard
        question={question}
        currentIndex={currentIndex}
        total={total}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
      />
      {showAdAfter.has(afterIndex) ? (
        <InlineAd afterQuestion={afterIndex} />
      ) : null}
    </section>
  );
}


import type { Quiz } from "@/lib/types";
import { QuizCard } from "./QuizCard";

type RelatedQuizzesProps = {
  quizzes: Quiz[];
  title?: string;
};

export function RelatedQuizzes({
  quizzes,
  title = "Related quizzes"
}: RelatedQuizzesProps) {
  if (!quizzes.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
    </section>
  );
}


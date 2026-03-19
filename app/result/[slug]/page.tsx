import { notFound } from "next/navigation";
import { seoGenerator } from "@/lib/seoGenerator";
import { buildScoreResult } from "@/lib/scoreCalculator";
import { ResultCard } from "@/components/ResultCard";
import { RelatedQuizzes } from "@/components/RelatedQuizzes";
import { PlayAnotherQuizLink } from "@/components/PlayAnotherQuizLink";
import { DEFAULT_LANGUAGE, getLocalizedText } from "@/lib/i18n";
import {
  fetchAllQuizzesFromApi,
  fetchQuizBySlugFromApi
} from "@/lib/serverQuizApi";

type ResultPageProps = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const quiz = await fetchQuizBySlugFromApi(params.slug);
  if (!quiz) return {};
  return seoGenerator.forQuiz(quiz);
}

export default async function ResultPage({
  params,
  searchParams
}: ResultPageProps) {
  const quiz = await fetchQuizBySlugFromApi(params.slug);
  if (!quiz) notFound();
  const allQuizzes = await fetchAllQuizzesFromApi();

  const score = Number(searchParams?.score ?? 0) || 0;
  const total = Number(searchParams?.total ?? quiz.questions.length) || 10;

  const scoreResult = buildScoreResult(score, total);
  const related = allQuizzes
    .filter((q) => q.slug !== quiz.slug && q.category === quiz.category)
    .slice(0, 3);
  const nextQuiz = related[0];

  return (
    <div className="space-y-6">
      <ResultCard quiz={quiz} scoreResult={scoreResult} />
      <RelatedQuizzes quizzes={related} />
      {nextQuiz ? (
        <PlayAnotherQuizLink
          nextQuizSlug={nextQuiz.slug}
          nextQuizTitle={getLocalizedText(nextQuiz.title, DEFAULT_LANGUAGE)}
        />
      ) : null}
    </div>
  );
}


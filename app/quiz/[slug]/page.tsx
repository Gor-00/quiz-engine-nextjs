import { notFound } from "next/navigation";
import { seoGenerator } from "@/lib/seoGenerator";
import { QuizStart } from "@/components/QuizStart";
import { QuizEngine } from "@/components/QuizEngine";
import { fetchQuizBySlugFromApi } from "@/lib/serverQuizApi";

type QuizPageProps = {
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

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const quiz = await fetchQuizBySlugFromApi(params.slug);
  if (!quiz) notFound();

  const start = searchParams?.start === "1";

  return (
    <div className="space-y-4">
      {!start && <QuizStart quiz={quiz} />}
      <QuizEngine quiz={quiz} />
    </div>
  );
}


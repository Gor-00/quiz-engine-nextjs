import { notFound } from "next/navigation";
import tagsData from "@/data/tags.json";
import { seoGenerator } from "@/lib/seoGenerator";
import { QuizCard } from "@/components/QuizCard";
import { fetchAllQuizzesFromApi } from "@/lib/serverQuizApi";

type TagMeta = {
  slug: string;
  name: string;
  description: string;
};

const tags = tagsData as TagMeta[];

type TagPageProps = {
  params: { tag: string };
};

export function generateMetadata({ params }: TagPageProps) {
  const tag = tags.find((t) => t.slug === params.tag);
  if (!tag) {
    return seoGenerator.base({
      title: `Quizzes tagged "${params.tag}"`,
      description: "Explore viral quizzes by tag.",
      url: `/tag/${params.tag}`
    });
  }

  return seoGenerator.base({
    title: `${tag.name} – Viral quizzes`,
    description: tag.description,
    url: `/tag/${tag.slug}`
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = tags.find((t) => t.slug === params.tag);
  if (!tag) notFound();

  const allQuizzes = await fetchAllQuizzesFromApi();
  const quizzes = allQuizzes.filter((q) => q.tags?.includes(tag.slug));

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Tag
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          {tag.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          {tag.description}
        </p>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Quizzes tagged &quot;{tag.slug}&quot;
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.slug} quiz={quiz} />
          ))}
        </div>
      </section>
    </div>
  );
}


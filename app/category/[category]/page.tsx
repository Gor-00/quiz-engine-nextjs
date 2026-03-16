import { notFound } from "next/navigation";
import categoriesData from "@/data/categories.json";
import { seoGenerator } from "@/lib/seoGenerator";
import { QuizCard } from "@/components/QuizCard";
import { fetchAllQuizzesFromApi } from "@/lib/serverQuizApi";

type Category = {
  slug: string;
  name: string;
  description: string;
};

const categories = categoriesData as Category[];

type CategoryPageProps = {
  params: { category: string };
};

export function generateMetadata({ params }: CategoryPageProps) {
  return seoGenerator.forCategory(params.category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find((c) => c.slug === params.category);
  if (!category) notFound();

  const allQuizzes = await fetchAllQuizzesFromApi();
  const quizzes = allQuizzes.filter((q) => q.category === category.slug);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft sm:p-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Category
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          {category.name} Quizzes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          {category.description}
        </p>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Quizzes in this category
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


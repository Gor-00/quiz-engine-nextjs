import type { MetadataRoute } from "next";
import categoriesData from "@/data/categories.json";
import quizzesData from "@/data/quizzes.json";
import type { Quiz } from "@/lib/types";
import type { ApiQuiz } from "@/lib/quizTransform";
import { uiQuizToApiQuiz } from "@/lib/quizTransform";

type Category = {
  slug: string;
};

const categories = categoriesData as Category[];

async function fetchSitemapQuizzes(base: string): Promise<ApiQuiz[]> {
  try {
    const res = await fetch(`${base}/api/quizzes`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ApiQuiz[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "https://example.com";

  const quizzes = await fetchSitemapQuizzes(base);
  const effectiveQuizzes =
    quizzes.length > 0 ? quizzes : (quizzesData as Quiz[]).map(uiQuizToApiQuiz);
  const tags = Array.from(
    new Set(effectiveQuizzes.flatMap((q) => q.tags ?? []))
  );

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${base}/popular`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9
    },
    {
      url: `${base}/new`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9
    }
  ];

  const quizPages: MetadataRoute.Sitemap = effectiveQuizzes.flatMap((quiz) => [
    {
      url: `${base}/quiz/${quiz.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${base}/result/${quiz.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    }
  ]);

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${base}/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticPages, ...quizPages, ...categoryPages, ...tagPages];
}


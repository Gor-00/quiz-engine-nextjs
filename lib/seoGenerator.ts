import type { Metadata } from "next";
import type { Quiz } from "./types";
import { getLocalizedText, DEFAULT_LANGUAGE } from "./i18n";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://example.com";

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function base(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
}): Metadata {
  const image = input.image ?? "/images/preview.jpg";

  return {
    title: input.title,
    description: input.description,
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.url),
      type: "website",
      images: [
        {
          url: absoluteUrl(image)
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [absoluteUrl(image)]
    }
  };
}

function forQuiz(quiz: Quiz): Metadata {
  const title = getLocalizedText(quiz.title, DEFAULT_LANGUAGE);
  const description = getLocalizedText(quiz.description, DEFAULT_LANGUAGE);

  return base({
    title,
    description,
    url: `/quiz/${quiz.slug}`,
    image: quiz.image
  });
}

function forCategory(categorySlug: string): Metadata {
  const pretty =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).toLowerCase();
  return base({
    title: `${pretty} Quizzes`,
    description: `Addictive viral quizzes in our ${pretty} category.`,
    url: `/category/${categorySlug}`
  });
}

export const seoGenerator = {
  base,
  forQuiz,
  forCategory
};


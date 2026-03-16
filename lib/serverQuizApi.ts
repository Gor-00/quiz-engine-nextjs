import { headers } from "next/headers";
import type { Quiz } from "./types";
import type { ApiQuiz } from "./quizTransform";
import { apiQuizToUiQuiz } from "./quizTransform";

function getRequestBaseUrl(): string {
  const headerStore = headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function fetchAllQuizzesFromApi(): Promise<Quiz[]> {
  const res = await fetch(`${getRequestBaseUrl()}/api/quizzes`, {
    cache: "no-store"
  });
  if (!res.ok) return [];
  const quizzes = (await res.json()) as ApiQuiz[];
  return quizzes.map(apiQuizToUiQuiz);
}

export async function fetchQuizBySlugFromApi(
  slug: string
): Promise<Quiz | undefined> {
  const res = await fetch(`${getRequestBaseUrl()}/api/quizzes/${slug}`, {
    cache: "no-store"
  });
  if (!res.ok) return undefined;
  const quiz = (await res.json()) as ApiQuiz;
  return apiQuizToUiQuiz(quiz);
}


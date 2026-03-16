import type { Quiz } from "./types";

export type ApiQuiz = {
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  tags?: string[];
  questions: Array<{
    question: string;
    answers: string[];
    correctIndex: number;
  }>;
  createdAt?: string;
};

function getText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in (value as any)) {
    return String((value as any).en ?? "");
  }
  return "";
}

export function apiQuizToUiQuiz(apiQuiz: ApiQuiz): Quiz {
  return {
    slug: apiQuiz.slug,
    title: { en: apiQuiz.title, am: apiQuiz.title, fr: apiQuiz.title },
    description: {
      en: apiQuiz.description,
      am: apiQuiz.description,
      fr: apiQuiz.description
    },
    image: apiQuiz.image,
    category: apiQuiz.category,
    tags: apiQuiz.tags ?? [],
    questions: apiQuiz.questions.map((q) => ({
      question: { en: q.question, am: q.question, fr: q.question },
      answers: q.answers.map((answer, index) => ({
        text: { en: answer, am: answer, fr: answer },
        correct: index === q.correctIndex
      })) as [any, any]
    }))
  };
}

export function uiQuizToApiQuiz(quiz: Quiz): ApiQuiz {
  return {
    slug: quiz.slug,
    title: getText(quiz.title),
    description: getText(quiz.description),
    category: quiz.category,
    image: quiz.image,
    tags: quiz.tags ?? [],
    questions: (quiz.questions ?? []).map((q) => {
      const answers = q.answers.map((a) => getText(a.text));
      const correctIndex = Math.max(
        0,
        q.answers.findIndex((a) => a.correct)
      );
      return {
        question: getText(q.question),
        answers,
        correctIndex
      };
    }),
    createdAt: new Date().toISOString()
  };
}

export function normalizeApiQuiz(payload: unknown): ApiQuiz {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid quiz payload");
  }
  const raw = payload as any;

  if (
    Array.isArray(raw.questions) &&
    raw.questions.length > 0 &&
    raw.questions[0]?.correctIndex !== undefined
  ) {
    return {
      slug: String(raw.slug ?? "").trim(),
      title: String(raw.title ?? "").trim(),
      description: String(raw.description ?? "").trim(),
      category: String(raw.category ?? "").trim(),
      image: String(raw.image ?? "").trim(),
      tags: Array.isArray(raw.tags) ? raw.tags.map((t: any) => String(t)) : [],
      questions: raw.questions.map((q: any) => ({
        question: String(q.question ?? "").trim(),
        answers: Array.isArray(q.answers) ? q.answers.map((a: any) => String(a)) : [],
        correctIndex: Number(q.correctIndex ?? 0)
      })),
      createdAt: raw.createdAt
        ? new Date(raw.createdAt).toISOString()
        : new Date().toISOString()
    };
  }

  return uiQuizToApiQuiz(raw as Quiz);
}

export function validateApiQuiz(quiz: ApiQuiz): void {
  if (!quiz.slug || !quiz.title || !quiz.description || !quiz.category) {
    throw new Error("Missing required fields");
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error("Quiz must have at least one question");
  }
  for (const q of quiz.questions) {
    if (!q.question || !Array.isArray(q.answers) || q.answers.length < 2) {
      throw new Error("Each question must have text and at least two answers");
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.answers.length) {
      throw new Error("correctIndex is out of bounds");
    }
  }
}


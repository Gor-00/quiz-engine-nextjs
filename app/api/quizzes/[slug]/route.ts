import { NextResponse } from "next/server";
import quizzesData from "@/data/quizzes.json";
import { connectMongo } from "@/lib/mongodb";
import QuizModel from "@/models/Quiz";
import type { Quiz } from "@/lib/types";
import { uiQuizToApiQuiz } from "@/lib/quizTransform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: { slug: string };
};

export async function GET(_req: Request, { params }: Params) {
  const slug = params.slug;

  try {
    await connectMongo();
    const quiz = await QuizModel.findOne({ slug }).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(quiz);
  } catch {
    const fallback = (quizzesData as Quiz[]).find((q) => q.slug === slug);
    if (!fallback) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(uiQuizToApiQuiz(fallback));
  }
}

import { NextResponse } from "next/server";
import quizzesData from "@/data/quizzes.json";
import { connectMongo } from "@/lib/mongodb";
import QuizModel from "@/models/Quiz";
import type { Quiz } from "@/lib/types";
import {
  normalizeApiQuiz,
  uiQuizToApiQuiz,
  validateApiQuiz,
  type ApiQuiz
} from "@/lib/quizTransform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const docs = await QuizModel.find({})
      .sort({ createdAt: -1 })
      .lean<ApiQuiz[]>();
    return NextResponse.json(docs);
  } catch {
    const fallback = (quizzesData as Quiz[]).map(uiQuizToApiQuiz);
    return NextResponse.json(fallback);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quiz = normalizeApiQuiz(body);
    validateApiQuiz(quiz);

    await connectMongo();
    const created = await QuizModel.create(quiz);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quiz";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

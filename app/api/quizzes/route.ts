import { NextResponse } from "next/server";
import quizzesData from "@/data/quizzes.json";
import { connectMongo } from "@/lib/mongodb";
import QuizModel from "@/models/Quiz";
import type { Quiz } from "@/lib/types";
import {
  normalizeApiQuiz,
  uiQuizToApiQuiz,
  validateApiQuiz,
  ApiQuizValidationError,
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

    if (error instanceof ApiQuizValidationError) {
      return NextResponse.json(
        { error: error.message, fieldErrors: error.fieldErrors },
        { status: 422 }
      );
    }

    const anyErr = error as any;
    if (anyErr?.code === 11000) {
      return NextResponse.json(
        {
          error: "Slug already exists",
          fieldErrors: { slug: "Slug must be unique" }
        },
        { status: 409 }
      );
    }

    const status =
      message.includes("MONGODB_URI is not set") ||
      message.includes("MongoDB connection")
        ? 500
        : 400;
    const hint =
      status === 500
        ? "Set MONGODB_URI in your .env.local (see .env.example), then restart the dev server."
        : undefined;

    return NextResponse.json(
      hint ? { error: message, hint } : { error: message },
      { status }
    );
  }
}

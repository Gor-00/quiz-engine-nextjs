import { NextResponse } from "next/server";
import quizzesData from "@/data/quizzes.json";
import { connectMongo } from "@/lib/mongodb";
import QuizModel from "@/models/Quiz";
import type { Quiz } from "@/lib/types";
import {
  normalizeApiQuiz,
  validateApiQuiz,
  uiQuizToApiQuiz,
  ApiQuizValidationError
} from "@/lib/quizTransform";

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

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const quiz = normalizeApiQuiz(body);
    validateApiQuiz(quiz);

    await connectMongo();

    const updated = await QuizModel.findOneAndUpdate(
      { slug: params.slug },
      {
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        image: quiz.image,
        tags: quiz.tags ?? [],
        questions: quiz.questions
      },
      { new: true, upsert: false }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update quiz";

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

export async function PATCH(req: Request, ctx: Params) {
  return PUT(req, ctx);
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectMongo();
    const deleted = await QuizModel.findOneAndDelete({ slug: params.slug }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete quiz";
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

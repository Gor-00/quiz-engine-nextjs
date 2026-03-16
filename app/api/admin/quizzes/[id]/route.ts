import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { DbQuiz } from "@/lib/adminTypes";

const COLLECTION = "quizzes";

type Params = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: Params) {
  const db = await getDb();
  const quiz = await db
    .collection<DbQuiz>(COLLECTION)
    .findOne({ _id: new ObjectId(params.id) });
  if (!quiz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(quiz);
}

export async function PUT(req: Request, { params }: Params) {
  const db = await getDb();
  const body = (await req.json()) as Partial<DbQuiz>;
  const updatedAt = new Date().toISOString();

  await db.collection<DbQuiz>(COLLECTION).updateOne(
    { _id: new ObjectId(params.id) },
    {
      $set: {
        ...body,
        updatedAt
      }
    }
  );

  const quiz = await db
    .collection<DbQuiz>(COLLECTION)
    .findOne({ _id: new ObjectId(params.id) });
  return NextResponse.json(quiz);
}

export async function DELETE(_req: Request, { params }: Params) {
  const db = await getDb();
  await db
    .collection<DbQuiz>(COLLECTION)
    .deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}


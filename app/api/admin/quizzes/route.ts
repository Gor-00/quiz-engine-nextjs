import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { DbQuiz } from "@/lib/adminTypes";

const COLLECTION = "quizzes";

export async function GET() {
  const db = await getDb();
  const quizzes = (await db
    .collection<DbQuiz>(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as DbQuiz[];

  return NextResponse.json(quizzes);
}

export async function POST(req: Request) {
  const body = (await req.json()) as DbQuiz;
  const db = await getDb();
  const now = new Date().toISOString();

  const doc: DbQuiz = {
    ...body,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<DbQuiz>(COLLECTION).insertOne(doc);
  return NextResponse.json({ _id: result.insertedId, ...doc });
}


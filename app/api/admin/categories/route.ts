import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { DbCategory } from "@/lib/adminTypes";

const COLLECTION = "categories";

export async function GET() {
  const db = await getDb();
  const categories = await db
    .collection<DbCategory>(COLLECTION)
    .find({})
    .sort({ slug: 1 })
    .toArray();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = (await req.json()) as DbCategory;
  const db = await getDb();
  await db.collection<DbCategory>(COLLECTION).updateOne(
    { slug: body.slug },
    {
      $set: body
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}


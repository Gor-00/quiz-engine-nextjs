import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { AnalyticsDoc } from "@/lib/adminTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION = "analytics";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<AnalyticsDoc>(COLLECTION)
      .find({})
      .toArray();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}


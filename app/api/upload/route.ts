import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3 MB

export async function POST(req: Request) {
  let uploadBuffer: Buffer | null = null;
  let uploadMimeType = "image/png";
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    uploadBuffer = buffer;
    uploadMimeType = file.type || "image/png";
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum size is 3 MB." },
        { status: 413 }
      );
    }

    // Serverless production (e.g. Vercel) has a read-only filesystem.
    // Use a data URL fallback so admin image updates still work.
    if (process.env.NODE_ENV === "production") {
      const mimeType = uploadMimeType;
      const base64 = buffer.toString("base64");
      const url = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const name =
      crypto.randomBytes(8).toString("hex") + "-" + Date.now().toString();
    const fileName = `${name}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    const anyErr = error as NodeJS.ErrnoException | null;
    if (anyErr?.code === "EROFS" && uploadBuffer) {
      const base64 = uploadBuffer.toString("base64");
      const url = `data:${uploadMimeType};base64,${base64}`;
      return NextResponse.json({ url });
    }
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


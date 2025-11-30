import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as File | null;
  const video = formData.get("video") as File | null;

  if (!image && !video) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const result: { imageUrl?: string; videoUrl?: string } = {};

  const saveFile = async (file: File, kind: "image" | "video") => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "";
    const extFromType = mime.includes("/") ? mime.split("/")[1] : "bin";
    const ext = "." + extFromType;
    const filename = crypto.randomUUID() + ext;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    const url = "/uploads/" + filename;
    if (kind === "image") result.imageUrl = url;
    else result.videoUrl = url;
  };

  if (image) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
    await saveFile(image, "image");
  }

  if (video) {
    if (!video.type.startsWith("video/")) {
      return NextResponse.json({ error: "Invalid video" }, { status: 400 });
    }
    await saveFile(video, "video");
  }

  return NextResponse.json(result, { status: 201 });
}

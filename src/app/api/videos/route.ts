// src/app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVideos } from "@/lib/data/videos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") ?? undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : undefined;

  if (page) {
    const result = await getVideos(group, limit ?? 9, page, true);
    return NextResponse.json(result);
  }

  const videos = await getVideos(group, limit);
  return NextResponse.json({ data: videos });
}

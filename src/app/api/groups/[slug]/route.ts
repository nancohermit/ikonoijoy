// src/app/api/groups/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGroupBySlug } from "@/lib/data/groups";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: group });
}

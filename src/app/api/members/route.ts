// src/app/api/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchMembers } from "@/lib/data/members";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const group = searchParams.get("group") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const result = await searchMembers({ search, group, page, limit });
  return NextResponse.json(result);
}

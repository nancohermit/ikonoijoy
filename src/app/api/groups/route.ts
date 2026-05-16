// src/app/api/groups/route.ts
import { NextResponse } from "next/server";
import { getAllGroups } from "@/lib/data/groups";

export async function GET() {
  const groups = await getAllGroups();
  return NextResponse.json({ data: groups });
}

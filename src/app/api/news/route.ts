import { NextRequest, NextResponse } from "next/server";
import { getNewsByGroup, getNewsLastWeek } from "@/lib/data/news";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const lastWeek = searchParams.get("lastWeek") === "true";
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const data = lastWeek
      ? await getNewsLastWeek(group || undefined)
      : await getNewsByGroup(group || "equal-love", limit);

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

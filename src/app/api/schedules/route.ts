import { NextRequest, NextResponse } from "next/server";
import {
  getSchedulesByGroup,
  getSchedulesLastWeek,
} from "@/lib/data/schedules";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const lastWeek = searchParams.get("lastWeek") === "true";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const data = lastWeek
      ? await getSchedulesLastWeek(group || undefined)
      : await getSchedulesByGroup(group || "equal-love", limit);

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

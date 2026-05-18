import { createClient } from "@/lib/supabase/server";
import type { NewsItem } from "@/types";

function getWeekRange() {
  const now = new Date();
  const jstOffset = 9 * 60;
  const localOffset = now.getTimezoneOffset();
  const jstNow = new Date(now.getTime() + (jstOffset + localOffset) * 60000);

  const start = new Date(jstNow);
  start.setDate(start.getDate() - 7);
  const end = new Date(jstNow);
  end.setDate(end.getDate() + 7);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

async function getGroupIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
}

export async function getNewsByGroup(
  slug: string,
  limit = 20
): Promise<NewsItem[]> {
  const supabase = await createClient();
  const groupId = await getGroupIdBySlug(slug);
  if (!groupId) return [];

  const { data } = await supabase
    .from("news")
    .select("*, group:groups(*)")
    .eq("group_id", groupId)
    .order("date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getNewsLastWeek(slug?: string): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { start, end } = getWeekRange();

  let query = supabase
    .from("news")
    .select("*, group:groups(*)")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (slug) {
    const groupId = await getGroupIdBySlug(slug);
    if (!groupId) return [];
    query = query.eq("group_id", groupId);
  }

  const { data } = await query;
  return data ?? [];
}

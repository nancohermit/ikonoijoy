// src/lib/data/videos.ts
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types";

export async function getVideos(groupSlug?: string, limit?: number): Promise<Video[]> {
  const supabase = await createClient();
  let query = supabase
    .from("videos")
    .select("*, group:groups(*)")
    .order("sort_order", { ascending: true });

  if (groupSlug) {
    query = query.eq("groups.slug", groupSlug);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data as Video[]) ?? [];
}

// src/lib/data/videos.ts
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types";

export interface VideosResponse {
  data: Video[];
  total: number;
  page: number;
}

export async function getVideos(
  groupSlug?: string,
  limit?: number,
  page?: number,
  paginated?: boolean,
): Promise<Video[] | VideosResponse> {
  const supabase = await createClient();

  if (paginated && page) {
    let query = supabase
      .from("videos")
      .select("*, group:groups(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (groupSlug) {
      query = query.eq("groups.slug", groupSlug);
    }

    const pageLimit = limit || 9;
    const from = (page - 1) * pageLimit;
    const to = from + pageLimit - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    return { data: (data as Video[]) ?? [], total: count ?? 0, page };
  }

  let query = supabase
    .from("videos")
    .select("*, group:groups(*)")
    .order("created_at", { ascending: false });

  if (groupSlug) {
    query = query.eq("groups.slug", groupSlug);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data as Video[]) ?? [];
}

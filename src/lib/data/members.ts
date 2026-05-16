// src/lib/data/members.ts
import { createClient } from "@/lib/supabase/server";
import type { Member, MembersResponse } from "@/types";

export async function searchMembers(params: {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}): Promise<MembersResponse> {
  const supabase = await createClient();
  const { search, group, page = 1, limit = 20 } = params;

  let query = supabase
    .from("members")
    .select("*, group:groups(*)", { count: "exact" })
    .order("sort_order", { ascending: true });

  if (search) {
    query = query.or(
      `name_ja.ilike.%${search}%,name_cn.ilike.%${search}%,name_en.ilike.%${search}%`
    );
  }

  if (group && group !== "all") {
    query = query.eq("groups.slug", group);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  return { data: (data as Member[]) ?? [], total: count ?? 0, page };
}

export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*, group:groups(*)")
    .eq("id", id)
    .single();
  return data as Member | null;
}

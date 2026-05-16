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
    .select("*, group:groups(*)", { count: "exact" });

  if (search) {
    const stripped = search.replace(/\s/g, "");
    const filters = [
      `name_ja.ilike.%${search}%`,
      `name_cn.ilike.%${search}%`,
      `name_en.ilike.%${search}%`,
    ];
    if (stripped !== search) {
      filters.push(`name_ja.ilike.%${stripped}%`);
      filters.push(`name_cn.ilike.%${stripped}%`);
    }
    query = query.or(filters.join(","));
  }

  if (group && group !== "all") {
    const { data: groupData } = await supabase
      .from("groups").select("id").eq("slug", group).single();
    if (groupData) {
      query = query.eq("group_id", groupData.id);
    }
  }

  // Always order by group sort_order first, then member name
  query = query.order("groups(sort_order)", { ascending: true })
               .order("name_en", { ascending: true });

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

// src/lib/data/groups.ts
import { createClient } from "@/lib/supabase/server";
import type { Group } from "@/types";

export async function getAllGroups(): Promise<Group[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

// src/lib/data/carousel.ts
import { createClient } from "@/lib/supabase/server";
import type { CarouselImage } from "@/types";

export async function getCarouselsByGroup(groupId: string): Promise<CarouselImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("carousel_images")
    .select("*")
    .eq("group_id", groupId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

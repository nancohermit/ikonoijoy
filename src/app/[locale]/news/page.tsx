import { getAllGroups } from "@/lib/data/groups";
import NewsPageClient from "./NewsPageClient";

export default async function NewsPage() {
  const groups = await getAllGroups();
  return (
    <NewsPageClient
      groups={groups.map((g) => ({
        slug: g.slug,
        name_ja: g.name_ja,
        name_cn: g.name_cn,
        color: g.color,
      }))}
    />
  );
}

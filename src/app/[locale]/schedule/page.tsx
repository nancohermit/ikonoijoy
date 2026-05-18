import { getAllGroups } from "@/lib/data/groups";
import SchedulePageClient from "./SchedulePageClient";

export default async function SchedulePage() {
  const groups = await getAllGroups();
  return (
    <SchedulePageClient
      groups={groups.map((g) => ({
        slug: g.slug,
        name_ja: g.name_ja,
        name_cn: g.name_cn,
        color: g.color,
      }))}
    />
  );
}

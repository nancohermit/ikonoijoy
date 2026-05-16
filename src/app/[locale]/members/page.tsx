// src/app/[locale]/members/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import MemberGrid from "@/components/member/MemberGrid";

export default async function MembersPage() {
  const groups = await getAllGroups();

  return (
    <MemberGrid
      groups={groups.map((g) => ({
        slug: g.slug,
        name_ja: g.name_ja,
        name_cn: g.name_cn,
        color: g.color,
      }))}
    />
  );
}

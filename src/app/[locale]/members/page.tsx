// src/app/[locale]/members/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import MemberGrid from "@/components/member/MemberGrid";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const groups = await getAllGroups();

  return (
    <MemberGrid
      groups={groups.map((g) => ({
        slug: g.slug,
        name_ja: g.name_ja,
        color: g.color,
      }))}
      locale={locale}
    />
  );
}

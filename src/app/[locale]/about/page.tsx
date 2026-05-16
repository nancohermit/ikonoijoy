import { getAllGroups } from "@/lib/data/groups";
import GroupTabs from "@/components/about/GroupTabs";

export default async function AboutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { locale } = await params;
  const { group } = await searchParams;
  const groups = await getAllGroups();

  return <GroupTabs groups={groups} locale={locale} defaultGroup={group} />;
}

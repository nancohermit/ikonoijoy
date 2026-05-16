import { getAllGroups } from "@/lib/data/groups";
import GroupTabs from "@/components/about/GroupTabs";

export default async function AboutPage({
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const groups = await getAllGroups();

  return <GroupTabs groups={groups} defaultGroup={group} />;
}

import { getAllGroups } from "@/lib/data/groups";
import { getVideos } from "@/lib/data/videos";
import GroupCarousel from "@/components/carousel/GroupCarousel";
import GroupInfoCards from "@/components/home/GroupInfoCards";
import VideoRow from "@/components/video/VideoRow";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [groups, videos] = await Promise.all([
    getAllGroups(),
    getVideos(undefined, 8),
  ]);

  return (
    <div>
      <GroupCarousel groups={groups} />
      <GroupInfoCards groups={groups} locale={locale} />
      <VideoRow videos={videos} locale={locale} />
    </div>
  );
}

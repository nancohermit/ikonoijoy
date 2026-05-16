import { getAllGroups } from "@/lib/data/groups";
import { getVideos } from "@/lib/data/videos";
import { getAllCarouselImages } from "@/lib/data/carousel";
import GroupCarousel from "@/components/carousel/GroupCarousel";
import GroupInfoCards from "@/components/home/GroupInfoCards";
import VideoRow from "@/components/video/VideoRow";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [groups, videosResult, carouselImages] = await Promise.all([
    getAllGroups(),
    getVideos(undefined, 8),
    getAllCarouselImages(),
  ]);
  const videos = videosResult as import("@/types").Video[];

  return (
    <div>
      <GroupCarousel groups={groups} carouselImages={carouselImages} />
      <GroupInfoCards groups={groups} locale={locale} />
      <VideoRow videos={videos} locale={locale} />
    </div>
  );
}

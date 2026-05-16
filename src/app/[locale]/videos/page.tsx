import { getVideos } from "@/lib/data/videos";
import VideoCard from "@/components/video/VideoCard";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (await import(`@/../messages/${locale}.json`)).default;

  const videos = await getVideos();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        ♡ {t.videos.title}
      </h1>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

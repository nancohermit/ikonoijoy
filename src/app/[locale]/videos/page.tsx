"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Video } from "@/types";
import VideoCard from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";

interface VideosResponse {
  data: Video[];
  total: number;
  page: number;
}

const PAGE_SIZE = 9;

export default function VideosPage() {
  const t = useTranslations("videos");
  const locale = useLocale();
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchVideos = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos?page=${p}&limit=${PAGE_SIZE}`);
      const json: VideosResponse = await res.json();
      setVideos(json.data);
      setTotal(json.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(page);
  }, [page, fetchVideos]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        {t("title")}
      </h1>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No videos yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} locale={locale} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full"
              >
                ←
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .map((p, i, arr) => {
                  const items: React.ReactNode[] = [];
                  if (i > 0 && p - (arr[i - 1] ?? 0) > 1) {
                    items.push(
                      <span key={`dots-${p}`} className="px-1 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  items.push(
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? "bg-love text-white hover:bg-love/90 rounded-full min-w-[2rem]"
                          : "rounded-full min-w-[2rem]"
                      }
                    >
                      {p}
                    </Button>
                  );
                  return items;
                })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full"
              >
                →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

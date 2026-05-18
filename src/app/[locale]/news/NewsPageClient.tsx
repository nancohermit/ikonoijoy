"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import type { NewsItem } from "@/types";

interface GroupInfo {
  slug: string;
  name_ja: string;
  name_cn: string;
  color: string;
}

interface Props {
  groups: GroupInfo[];
  defaultGroup?: string;
}

export default function NewsPageClient({ groups, defaultGroup }: Props) {
  const locale = useLocale();
  const t = useTranslations("news");
  const defaultTab = defaultGroup || groups[0]?.slug;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchNews = useCallback(
    async (slug: string) => {
      if (newsData[slug] && newsData[slug].length > 0) return;
      setLoading((prev) => ({ ...prev, [slug]: true }));
      try {
        const res = await fetch(
          `/api/news?group=${slug}&lastWeek=true&limit=30`
        );
        const json = await res.json();
        setNewsData((prev) => ({ ...prev, [slug]: json.data || [] }));
      } catch {
        setNewsData((prev) => ({ ...prev, [slug]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [slug]: false }));
      }
    },
    [newsData]
  );

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    if (value) {
      setActiveTab(value);
      fetchNews(value);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        {t("title")}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="items-center"
      >
        <TabsList className="flex justify-center gap-2 bg-transparent mb-8">
          {groups.map((group) => (
            <TabsTrigger
              key={group.slug}
              value={group.slug}
              className="rounded-full px-6 py-2.5 data-active:text-white text-base font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "transparent",
                color: group.color,
                border: `2px solid ${group.color}`,
              }}
            >
              {locale === "zh" ? group.name_cn : group.name_ja}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => (
          <TabsContent
            key={group.slug}
            value={group.slug}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
          >
            {loading[group.slug] ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : !newsData[group.slug] ||
              newsData[group.slug]?.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl text-gray-300">📰</span>
                </div>
                <p className="text-gray-400 text-sm">{t("noNews")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {newsData[group.slug]?.map((item, index) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    index={index}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

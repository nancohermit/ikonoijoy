"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Group } from "@/types";

interface Props {
  groups: Group[];
  locale: string;
  defaultGroup?: string;
}

export default function GroupTabs({ groups, locale, defaultGroup }: Props) {
  const t = useTranslations("about");
  const defaultTab = defaultGroup || groups[0]?.slug;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-love">
        ♡ {t("title")}
      </h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex justify-center gap-2 bg-transparent mb-8">
          {groups.map((group) => (
            <TabsTrigger
              key={group.slug}
              value={group.slug}
              className="rounded-full px-5 py-2 data-[state=active]:text-white text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                color: group.color,
                border: `2px solid ${group.color}`,
              }}
            />
          ))}
        </TabsList>
        {groups.map((group) => (
          <TabsContent key={group.slug} value={group.slug}>
            <div className="text-center">
              {group.logo_url && (
                <img
                  src={group.logo_url}
                  alt={group.name_ja}
                  className="max-h-20 mx-auto mb-6"
                />
              )}
              <div className="text-4xl mb-4">♡</div>
              <h2 className="text-xl font-bold mb-4" style={{ color: group.color }}>
                {group.name_ja}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-8">
                {locale === "ja" ? group.description_ja : group.description_cn}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {group.official_url && (
                  <a
                    href={group.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: group.color }}
                  >
                    {t("officialSite")} →
                  </a>
                )}
                {group.youtube_url && (
                  <a
                    href={group.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#ff0000" }}
                  >
                    {t("youtube")} →
                  </a>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

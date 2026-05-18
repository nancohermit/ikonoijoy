"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import ScheduleItem from "@/components/schedule/ScheduleItem";
import type { ScheduleItem as ScheduleItemType } from "@/types";

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

export default function SchedulePageClient({ groups, defaultGroup }: Props) {
  const locale = useLocale();
  const t = useTranslations("schedule");
  const defaultTab = defaultGroup || groups[0]?.slug;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [scheduleData, setScheduleData] = useState<
    Record<string, ScheduleItemType[]>
  >({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchSchedules = useCallback(
    async (slug: string) => {
      if (scheduleData[slug] && scheduleData[slug].length > 0) return;
      setLoading((prev) => ({ ...prev, [slug]: true }));
      try {
        const res = await fetch(
          `/api/schedules?group=${slug}&lastWeek=true&limit=50`
        );
        const json = await res.json();
        setScheduleData((prev) => ({ ...prev, [slug]: json.data || [] }));
      } catch {
        setScheduleData((prev) => ({ ...prev, [slug]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [slug]: false }));
      }
    },
    [scheduleData]
  );

  useEffect(() => {
    fetchSchedules(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    if (value) {
      setActiveTab(value);
      fetchSchedules(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
            ) : !scheduleData[group.slug] ||
              scheduleData[group.slug]?.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl text-gray-300">📅</span>
                </div>
                <p className="text-gray-400 text-sm">{t("noSchedules")}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-brand-border-soft bg-white overflow-hidden divide-y divide-brand-border-soft/50">
                {scheduleData[group.slug]?.map((item) => (
                  <ScheduleItem
                    key={item.id}
                    item={item}
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

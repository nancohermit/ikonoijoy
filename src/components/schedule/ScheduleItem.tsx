"use client";

import type { ScheduleItem as ScheduleItemType } from "@/types";
import { ExternalLink } from "lucide-react";
import { getCategoryColor } from "@/lib/design/categories";

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"];

function formatScheduleDate(
  isoDate: string,
  locale: string
): { dayOfWeek: string; displayDate: string } {
  const d = new Date(isoDate + "T00:00:00");
  const dow = d.getUTCDay();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const dayOfWeek = locale === "zh" ? WEEKDAY_ZH[dow] : WEEKDAY_JA[dow];
  return { dayOfWeek, displayDate: `${mm}/${dd}` };
}

function getTodayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000);
  return jst.toISOString().split("T")[0];
}

interface Props {
  item: ScheduleItemType;
  locale: string;
}

export default function ScheduleItem({ item, locale }: Props) {
  const catColor = getCategoryColor(item.category);
  const { dayOfWeek, displayDate } = formatScheduleDate(item.date, locale);
  const isToday = getTodayJST() === item.date;

  return (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group transition-all duration-200 border-b border-brand-border-soft/50
        ${isToday ? "bg-love/5" : ""}
        hover:bg-gray-50`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl
            ${isToday ? "bg-love text-white" : "bg-gray-100 text-gray-600"}`}
        >
          <span className="text-xs leading-none">{dayOfWeek}</span>
          <span className="text-lg font-bold leading-none">{displayDate}</span>
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {item.category && (
            <span
              className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: catColor.bg,
                color: catColor.text,
              }}
            >
              {item.category}
            </span>
          )}
          <span className="text-sm text-gray-800 truncate group-hover:text-love transition-colors">
            {item.title}
          </span>
        </div>

        <ExternalLink className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-love transition-colors" />
      </div>
    </a>
  );
}

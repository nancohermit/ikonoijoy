"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.startsWith("/zh") ? "zh" : "ja";
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-love"
        : "text-gray-500 hover:text-love"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border-soft">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-lg font-bold">
            <span className="text-love">イコ</span>
            <span className="text-me">ノイ</span>
            <span className="text-joy">ジョイ</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <Link href={`/${locale}`} className={linkClass("")}>
            {t("home")}
          </Link>
          <Link href={`/${locale}/members`} className={linkClass("/members")}>
            {t("members")}
          </Link>
          <Link href={`/${locale}/about`} className={linkClass("/about")}>
            {t("about")}
          </Link>
          <Link href={`/${locale}/news`} className={linkClass("/news")}>
            {t("news")}
          </Link>
          <Link href={`/${locale}/schedule`} className={linkClass("/schedule")}>
            {t("schedule")}
          </Link>
          <Link href={`/${locale}/videos`} className={linkClass("/videos")}>
            {t("videos")}
          </Link>
        </div>

        <button
          className="sm:hidden p-2 text-gray-500"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="メニュー"
        >
          <Menu
            className={`w-5 h-5 transition-all duration-300 ${
              mobileOpen ? "opacity-0 rotate-90 absolute" : "opacity-100 rotate-0"
            }`}
          />
          <X
            className={`w-5 h-5 transition-all duration-300 ${
              mobileOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90 absolute"
            }`}
          />
        </button>

        <LanguageSwitcher />
      </div>

      {mobileOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 bg-white border-b border-border-soft shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-4 gap-3">
            <Link href={`/${locale}`} className={linkClass("")} onClick={() => setMobileOpen(false)}>
              {t("home")}
            </Link>
            <Link href={`/${locale}/members`} className={linkClass("/members")} onClick={() => setMobileOpen(false)}>
              {t("members")}
            </Link>
            <Link href={`/${locale}/about`} className={linkClass("/about")} onClick={() => setMobileOpen(false)}>
              {t("about")}
            </Link>
            <Link href={`/${locale}/news`} className={linkClass("/news")} onClick={() => setMobileOpen(false)}>
              {t("news")}
            </Link>
            <Link href={`/${locale}/schedule`} className={linkClass("/schedule")} onClick={() => setMobileOpen(false)}>
              {t("schedule")}
            </Link>
            <Link href={`/${locale}/videos`} className={linkClass("/videos")} onClick={() => setMobileOpen(false)}>
              {t("videos")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

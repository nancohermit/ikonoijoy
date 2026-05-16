// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "zh"],
  defaultLocale: "ja",
  localePrefix: "always",
});

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

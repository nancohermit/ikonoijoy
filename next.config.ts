// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "equal-love.jp" },
      { protocol: "https", hostname: "**.equal-love.jp" },
      { protocol: "https", hostname: "not-equal-me.jp" },
      { protocol: "https", hostname: "**.not-equal-me.jp" },
      { protocol: "https", hostname: "nearly-equal-joy.jp" },
      { protocol: "https", hostname: "**.nearly-equal-joy.jp" },
    ],
  },
};

export default withNextIntl(nextConfig);

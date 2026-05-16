import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イコノイジョイ",
  description: "=LOVE・≠ME・≒JOY 総合サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export type CategoryKey =
  | "media"
  | "release"
  | "live"
  | "event"
  | "notice"
  | "handshake"
  | "goods"
  | "birthday"
  | "other";

const CATEGORY_MAP: Record<string, CategoryKey> = {
  "メディア": "media",
  "リリース": "release",
  "ライブ": "live",
  "イベント": "event",
  "ライブ/イベント": "live",
  "お知らせ": "notice",
  "握手会": "handshake",
  "グッズ": "goods",
  "誕生日": "birthday",
  "その他": "other",
};

const CATEGORY_COLORS: Record<CategoryKey, { bg: string; text: string }> = {
  media: { bg: "#dbeafe", text: "#1d4ed8" },
  release: { bg: "#f3e8ff", text: "#7c3aed" },
  live: { bg: "#fee2e2", text: "#dc2626" },
  event: { bg: "#ffedd5", text: "#ea580c" },
  notice: { bg: "#dcfce7", text: "#16a34a" },
  handshake: { bg: "#fce7f3", text: "#db2777" },
  goods: { bg: "#fef9c3", text: "#ca8a04" },
  birthday: { bg: "#fae8ff", text: "#c026d3" },
  other: { bg: "#f3f4f6", text: "#6b7280" },
};

export function getCategoryKey(raw: string | null): CategoryKey {
  if (!raw) return "other";
  return CATEGORY_MAP[raw.trim()] || "other";
}

export function getCategoryColor(raw: string | null): { bg: string; text: string } {
  return CATEGORY_COLORS[getCategoryKey(raw)];
}

export function getCategoryLabel(
  raw: string | null,
  t: (key: string) => string
): string {
  const key = getCategoryKey(raw);
  return t(`category.${key}`);
}

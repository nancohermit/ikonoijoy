export interface GroupColorClasses {
  text: string;
  bg: string;
  bgLight: string;
  bgSoft: string;
  border: string;
  ring: string;
  gradientFrom: string;
  gradientTo: string;
  cssVar: string;
}

const COLOR_MAP: Record<string, GroupColorClasses> = {
  "#dc7280": {
    text: "text-love",
    bg: "bg-love",
    bgLight: "bg-love-light",
    bgSoft: "bg-love-soft",
    border: "border-love/20",
    ring: "ring-love",
    gradientFrom: "from-love-light",
    gradientTo: "to-love",
    cssVar: "var(--brand-love)",
  },
  "#8bcabe": {
    text: "text-me",
    bg: "bg-me",
    bgLight: "bg-me-light",
    bgSoft: "bg-me-soft",
    border: "border-me/20",
    ring: "ring-me",
    gradientFrom: "from-me-light",
    gradientTo: "to-me",
    cssVar: "var(--brand-me)",
  },
  "#fae06d": {
    text: "text-joy",
    bg: "bg-joy",
    bgLight: "bg-joy-light",
    bgSoft: "bg-joy-soft",
    border: "border-joy/20",
    ring: "ring-joy",
    gradientFrom: "from-joy-light",
    gradientTo: "to-joy",
    cssVar: "var(--brand-joy)",
  },
};

const DEFAULT = COLOR_MAP["#dc7280"];

export function getGroupColor(hex: string): GroupColorClasses {
  return COLOR_MAP[hex] ?? DEFAULT;
}

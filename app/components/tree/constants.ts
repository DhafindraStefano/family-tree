import { Person, Gender, Generation } from "../../types/family";

export function formatDate(iso: string): string {
  if (!iso) return "Tidak Diketahui";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export const genPalette: Record<Generation, {
  accent: string;
  avatarBg: string;
  avatarText: string;
  badgeBg: string;
  badgeText: string;
  badgeBgDark: string;
  badgeTextDark: string;
  cardBorder: string;
  connectorColor: string;
  cardBg: string;
  cardBgDark: string;
}> = {
  4: {
    accent:         "#5c5082",
    avatarBg:       "#f3f0f9",
    avatarText:     "#5c5082",
    badgeBg:        "#f3f0f9",
    badgeText:      "#5c5082",
    badgeBgDark:    "#3a3250",
    badgeTextDark:  "#b9a5e0",
    cardBorder:     "#a797ce",
    connectorColor: "#8e7db9",
    cardBg:         "#f8f5ff",
    cardBgDark:     "#1b1825",
  },
  3: {
    accent:         "#7a6124",
    avatarBg:       "#fdf6e3",
    avatarText:     "#7a6124",
    badgeBg:        "#fdf6e3",
    badgeText:      "#7a6124",
    badgeBgDark:    "#413516",
    badgeTextDark:  "#d4c08a",
    cardBorder:     "#c4af76",
    connectorColor: "#b29b5e",
    cardBg:         "#fffcf3",
    cardBgDark:     "#222018",
  },
  2: {
    accent:         "#1f5e5e",
    avatarBg:       "#edf7f7",
    avatarText:     "#1f5e5e",
    badgeBg:        "#edf7f7",
    badgeText:      "#1f5e5e",
    badgeBgDark:    "#123939",
    badgeTextDark:  "#7ec0c0",
    cardBorder:     "#7eb4b4",
    connectorColor: "#679d9d",
    cardBg:         "#f4fbfb",
    cardBgDark:     "#152222",
  },
  1: {
    accent:         "#6d2d2d",
    avatarBg:       "#fdf0f0",
    avatarText:     "#6d2d2d",
    badgeBg:        "#fdf0f0",
    badgeText:      "#6d2d2d",
    badgeBgDark:    "#471d1d",
    badgeTextDark:  "#d48a8a",
    cardBorder:     "#c78e8e",
    connectorColor: "#b47a7a",
    cardBg:         "#fff9f9",
    cardBgDark:     "#241717",
  },
};

export const GEN_DIMS: Record<Generation, {
  cardW: number; avatar: number; fontLg: number; fontMd: number; fontSm: number; icon: number;
}> = {
  4: { cardW: 212, avatar: 72, fontLg: 17, fontMd: 14, fontSm: 12, icon: 15 },
  3: { cardW: 192, avatar: 64, fontLg: 16, fontMd: 13, fontSm: 12, icon: 14 },
  2: { cardW: 182, avatar: 56, fontLg: 15, fontMd: 13, fontSm: 11, icon: 14 },
  1: { cardW: 162, avatar: 48, fontLg: 14, fontMd:  11, fontSm:  10, icon: 12 },
};

export const GEN_HEADING: Record<Generation, string> = {
  4: "Generasi 0",
  3: "Generasi 1",
  2: "Generasi 2",
  1: "Generasi 3",
};

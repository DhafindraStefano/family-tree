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
  cardBorder: string;
  connectorColor: string;
}> = {
  4: {
    accent:         "#7c6f9f",
    avatarBg:       "#f3f0f9",
    avatarText:     "#7c6f9f",
    badgeBg:        "#f3f0f9",
    badgeText:      "#7c6f9f",
    cardBorder:     "#e0d8f0",
    connectorColor: "#c9c0e0",
  },
  3: {
    accent:         "#9a7b2e",
    avatarBg:       "#fdf6e3",
    avatarText:     "#9a7b2e",
    badgeBg:        "#fdf6e3",
    badgeText:      "#9a7b2e",
    cardBorder:     "#ecdba8",
    connectorColor: "#e8d08a",
  },
  2: {
    accent:         "#2e7f7f",
    avatarBg:       "#edf7f7",
    avatarText:     "#2e7f7f",
    badgeBg:        "#edf7f7",
    badgeText:      "#2e7f7f",
    cardBorder:     "#a8d8d8",
    connectorColor: "#8ecece",
  },
  1: {
    accent:         "#8b3a3a",
    avatarBg:       "#fdf0f0",
    avatarText:     "#8b3a3a",
    badgeBg:        "#fdf0f0",
    badgeText:      "#8b3a3a",
    cardBorder:     "#e8b0b0",
    connectorColor: "#dca0a0",
  },
};

export const GEN_DIMS: Record<Generation, {
  cardW: number; avatar: number; fontLg: number; fontMd: number; fontSm: number; icon: number;
}> = {
  4: { cardW: 192, avatar: 64, fontLg: 16, fontMd: 13, fontSm: 11, icon: 14 },
  3: { cardW: 172, avatar: 56, fontLg: 15, fontMd: 12, fontSm: 11, icon: 13 },
  2: { cardW: 152, avatar: 48, fontLg: 13, fontMd: 11, fontSm: 10, icon: 12 },
  1: { cardW: 132, avatar: 40, fontLg: 11, fontMd:  9, fontSm:  9, icon: 10 },
};

export const GEN_HEADING: Record<Generation, string> = {
  4: "Generasi 0",
  3: "Generasi 1",
  2: "Generasi 2",
  1: "Generasi 3",
};

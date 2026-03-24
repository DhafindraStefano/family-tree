import React from "react";
import { Person } from "../../types/family";
import { genPalette } from "./constants";

import { useAuth } from "../../../lib/AuthContext";

export function Avatar({ person, size, fontSize }: { person: Person; size: number; fontSize: number }) {
  const { theme } = useAuth();
  const p = genPalette[person.generation];
  const initials = (person.firstName[0] + (person.lastName ? person.lastName[0] : "")).toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: theme === 'light' ? p.avatarBg : p.badgeBgDark,
      color: theme === 'light' ? p.avatarText : p.badgeTextDark,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Playfair Display', serif",
      fontSize: fontSize,
      fontWeight: 500,
      margin: "0 auto 10px",
      border: `1.5px solid ${p.cardBorder}`,
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {person.imageUrl ? (
        <img src={person.imageUrl} alt={person.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  );
}

import React from "react";
import { Generation } from "../../types/family";
import { genPalette, GEN_DIMS, GEN_HEADING } from "./constants";

export function AddCard({ generation, onAdd }: { generation: Generation; onAdd: () => void }) {
  const p = genPalette[generation];
  const dims = GEN_DIMS[generation];
  return (
    <button
      onClick={onAdd}
      aria-label={`Add to ${GEN_HEADING[generation]}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: dims.cardW,
        padding: "16px",
        background: "transparent",
        border: `1px dashed ${p.cardBorder}`,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = p.avatarBg;
        (e.currentTarget as HTMLButtonElement).style.borderColor = p.accent;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.borderColor = p.cardBorder;
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `1.5px dashed ${p.cardBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: p.accent,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 20,
        marginBottom: 8,
      }}>+</div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#a8a29e",
      }}>
        Tambah
      </span>
    </button>
  );
}

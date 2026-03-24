"use client";

import React, { useEffect } from "react";
import { Person, Generation } from "../../types/family";
import { GenderIcon } from "../tree/GenderIcon";
import { formatDate, genPalette, GEN_HEADING } from "../tree/constants";

interface Props {
  person: Person | null;
  people: Person[];
  onClose: () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "block",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#a8a29e",
      marginBottom: 4,
    }}>
      {children}
    </span>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "block",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      color: "#1c1917",
    }}>
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <Value>{children}</Value>
    </div>
  );
}

export function PersonViewModal({ person, people, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!person) return null;

  const p = genPalette[person.generation];

  const genderLabel =
    person.gender === "male" ? "Laki-laki" :
    person.gender === "female" ? "Perempuan" : "Lainnya";

  const genderColor =
    person.gender === "male" ? "#3b82f6" :
    person.gender === "female" ? "#ec4899" : "#8b5cf6";

  const parents = people.filter(pe => person.parents?.includes(pe.id));
  const spouses = people.filter(pe => person.spouses?.includes(pe.id) || pe.spouses?.includes(person.id));
  const children = people.filter(pe => pe.parents?.includes(person.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .pvm-overlay { animation: pvm-fade 0.2s ease; }
        .pvm-panel   { animation: pvm-up   0.25s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes pvm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pvm-up   { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .pvm-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          background: #f5f4f2;
          color: #57534e;
          border: 1px solid #e7e5e4;
        }
      `}</style>

      <div
        className="pvm-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          background: "rgba(245,244,242,0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="pvm-panel"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
            maxHeight: "90vh",
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.12)",
          }}
        >
          {/* Accent bar */}
          <div style={{ height: 4, background: p.accent, flexShrink: 0 }} />

          {/* Header with avatar */}
          <div style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f5f4f2",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}>
            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              background: p.avatarBg, color: p.avatarText,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500,
              border: `2px solid ${p.cardBorder}`,
              overflow: "hidden",
            }}>
              {person.imageUrl ? (
                <img src={person.imageUrl} alt={person.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (person.firstName[0] + (person.lastName ? person.lastName[0] : "")).toUpperCase()
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 500,
                color: "#1c1917",
                margin: 0, lineHeight: 1.2,
              }}>
                {person.firstName} {person.lastName}
              </h2>
              {person.alias && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontStyle: "italic",
                  color: "#78716c", margin: "4px 0 0",
                }}>
                  "{person.alias}"
                </p>
              )}
              <span style={{
                display: "inline-block", marginTop: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10, fontWeight: 500,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: p.badgeBg, color: p.badgeText,
                padding: "3px 10px", borderRadius: 20,
                border: `1px solid ${p.cardBorder}`,
              }}>
                {GEN_HEADING[person.generation as Generation]}
              </span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Tutup"
              style={{
                alignSelf: "flex-start",
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none", cursor: "pointer",
                color: "#c4bfbb", fontSize: 16, flexShrink: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#44403c")}
              onMouseLeave={e => (e.currentTarget.style.color = "#c4bfbb")}
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Core details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Row label="Tanggal Lahir">
                {person.dateOfBirth ? formatDate(person.dateOfBirth) : <span style={{ color: "#a8a29e" }}>Tidak diketahui</span>}
              </Row>
              <Row label="Jenis Kelamin">
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: genderColor }}>
                  <GenderIcon gender={person.gender} size={14} />
                  {genderLabel}
                </span>
              </Row>
              <Row label="Status">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: person.isAlive ? "#34d399" : "#d6d3d1",
                    display: "inline-block",
                  }} />
                  <span style={{ color: person.isAlive ? "#15803d" : "#a8a29e" }}>
                    {person.isAlive ? "Hidup" : "Sudah meninggal"}
                  </span>
                </span>
              </Row>
            </div>

            {/* Parents */}
            {parents.length > 0 && (
              <div>
                <Label>Orang Tua</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {parents.map(par => (
                    <span key={par.id} className="pvm-tag">
                      {par.firstName} {par.lastName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spouses */}
            {spouses.length > 0 && (
              <div>
                <Label>Pasangan</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {spouses.map(sp => (
                    <span key={sp.id} className="pvm-tag">
                      {sp.firstName} {sp.lastName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div>
                <Label>Anak</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {children.map(ch => (
                    <span key={ch.id} className="pvm-tag">
                      {ch.firstName} {ch.lastName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

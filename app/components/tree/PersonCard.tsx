import React, { useState, useRef, useEffect } from "react";
import { Person } from "../../types/family";
import { genPalette, GEN_DIMS, formatDate } from "./constants";
import { Avatar } from "./Avatar";
import { GenderIcon } from "./GenderIcon";
import { useAuth } from "../../../lib/AuthContext";
export function PersonCard({ person, onEdit, onQuickAdd, onView, isAdmin }: { 
  person: Person; 
  onEdit?: (p: Person) => void; 
  onQuickAdd?: (type: 'child'|'sibling'|'sibling-before'|'spouse', p: Person) => void;
  onView?: (p: Person) => void;
  isAdmin?: boolean;
}) {
  const { theme } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isHeld, setIsHeld] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasHeldRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dismiss tap-selection when user taps elsewhere
  useEffect(() => {
    if (!isHeld) return;
    function handleOutside(e: TouchEvent | MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsHeld(false);
      }
    }
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [isHeld]);

  const showButtons = isHovered || isHeld;

  const p = genPalette[person.generation];
  const dims = GEN_DIMS[person.generation];
  const genderColor =
    person.gender === "male" ? "#3b82f6" :
    person.gender === "female" ? "#ec4899" : "#8b5cf6";
  const genderLbl =
    person.gender === "male" ? "Laki-laki" : person.gender === "female" ? "Perempuan" : "Lainnya";

  return (
    <div 
      ref={cardRef}
      id={`person-node-${person.id}`}
      style={{ position: "relative", width: dims.cardW }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={(e) => {
          if (wasHeldRef.current) {
            wasHeldRef.current = false;
            e.preventDefault();
            return;
          }
          if (isAdmin) {
            setIsHeld(false);
            onEdit?.(person);
          } else {
            onView?.(person);
          }
        }}
        onTouchStart={() => {
          // Start hold timer
          wasHeldRef.current = false;
          if (!isHeld) {
            holdTimerRef.current = setTimeout(() => {
              setIsHeld(true);
              wasHeldRef.current = true;
              holdTimerRef.current = null;
            }, 350); // 350ms hold to show menu
          }
        }}
        onTouchEnd={() => {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }}
        onTouchMove={() => {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }}
        onContextMenu={(e) => {
          if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) {
            e.preventDefault(); // Prevent native browser context menu on mobile long-press
          }
        }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          padding: "16px", background: theme === 'light' ? p.cardBg : p.cardBgDark,
          border: `1px solid ${p.cardBorder}`, borderTop: `3px solid ${p.accent}`,
          width: "100%", flexShrink: 0, cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.2s, background 0.3s ease",
          boxShadow: isHovered ? "0 6px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)"
        }}
      >
        <Avatar person={person} size={dims.avatar} fontSize={dims.fontLg} />

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: dims.fontLg,
          fontWeight: 500,
          color: "var(--ft-text-primary)",
          lineHeight: 1.3,
          margin: 0,
          marginBottom: person.alias ? 4 : 16,
        }}>
          {person.firstName} {person.lastName}
        </p>

        {person.alias && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: dims.fontMd,
            fontStyle: "italic",
            color: "var(--ft-text-secondary)",
            margin: 0,
            marginBottom: 16,
          }}>
            "{person.alias}"
          </p>
        )}

        <div style={{ width: "100%", height: 1, background: "var(--ft-border)", marginBottom: 10 }} />

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a8a29e" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 style={{ width: dims.icon, height: dims.icon, flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, color: "#a8a29e" }}>
              {formatDate(person.dateOfBirth)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, color: genderColor }}>
            <GenderIcon gender={person.gender} size={dims.icon} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm }}>{genderLbl}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: person.isAlive ? "#34d399" : "#d6d3d1",
            }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: dims.fontSm,
              color: person.isAlive ? "#15803d" : "#a8a29e",
            }}>
              {person.isAlive ? "Hidup" : "Meninggal"}
            </span>
          </div>
        </div>
      </div>

      { /* Quick Add Buttons */ }
      {isAdmin && showButtons && (
        <>
          {/* Top Left -> Sibling Before */}
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd?.("sibling-before", person); }}
            onMouseEnter={() => setActiveZone("sibling-before")}
            onMouseLeave={() => setActiveZone(null)}
            style={{
              position: "absolute", top: -14, left: -14,
              background: theme === 'light' ? p.cardBg : p.cardBgDark, border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "sibling-before" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: isAdmin ? "pointer" : "default", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s, background 0.3s ease", whiteSpace: "nowrap"
            }}
          >
            {activeZone === "sibling-before" ? "Saudara +" : "+"}
          </button>

          {/* Top Right -> Sibling After */}
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd?.("sibling", person); }}
            onMouseEnter={() => setActiveZone("sibling")}
            onMouseLeave={() => setActiveZone(null)}
            style={{
              position: "absolute", top: -14, right: -14,
              background: theme === 'light' ? p.cardBg : p.cardBgDark, border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "sibling" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: isAdmin ? "pointer" : "default", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s, background 0.3s ease", whiteSpace: "nowrap"
            }}
          >
            {activeZone === "sibling" ? "+ Saudara" : "+"}
          </button>
          
          {/* Bottom Right -> Spouse */}
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd?.("spouse", person); }}
            onMouseEnter={() => setActiveZone("spouse")}
            onMouseLeave={() => setActiveZone(null)}
            style={{
              position: "absolute", bottom: 20, right: -14,
              background: theme === 'light' ? p.cardBg : p.cardBgDark, border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "spouse" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: isAdmin ? "pointer" : "default", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s, background 0.3s ease", whiteSpace: "nowrap"
            }}
          >
            {activeZone === "spouse" ? "+ Pasangan" : "+"}
          </button>

          {/* Bottom Middle -> Descendant */}
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd?.("child", person); }}
            onMouseEnter={() => setActiveZone("child")}
            onMouseLeave={() => setActiveZone(null)}
            style={{
              position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
              background: theme === 'light' ? p.cardBg : p.cardBgDark, border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "child" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: isAdmin ? "pointer" : "default", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s, background 0.3s ease", whiteSpace: "nowrap"
            }}
          >
            {activeZone === "child" ? "+ Keturunan" : "+"}
          </button>
        </>
      )}
    </div>
  );
}

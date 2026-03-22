"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Person, Gender, Generation } from "../types/family";
import { initialFamily } from "../data/familyData";
import AddMemberModal from "./AddMemberModal";

/* ── Helpers ──────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  if (!iso) return "Tidak Diketahui";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

/* ── Generation palette — warm neutrals per generation ───────────── */
const genPalette: Record<Generation, {
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

const GEN_DIMS: Record<Generation, {
  cardW: number; avatar: number; fontLg: number; fontMd: number; fontSm: number; icon: number;
}> = {
  4: { cardW: 192, avatar: 64, fontLg: 16, fontMd: 13, fontSm: 11, icon: 14 },
  3: { cardW: 172, avatar: 56, fontLg: 15, fontMd: 12, fontSm: 11, icon: 13 },
  2: { cardW: 152, avatar: 48, fontLg: 13, fontMd: 11, fontSm: 10, icon: 12 },
  1: { cardW: 132, avatar: 40, fontLg: 11, fontMd:  9, fontSm:  9, icon: 10 },
};

const GEN_HEADING: Record<Generation, string> = {
  4: "Generasi 0",
  3: "Generasi 1",
  2: "Generasi 2",
  1: "Generasi 3",
};

/* ── Gender icon ──────────────────────────────────────────────────── */
function GenderIcon({ gender, size = 12 }: { gender: Gender; size?: number }) {
  if (gender === "male") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         style={{ width: size, height: size }} aria-label="Male">
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.5 5.5M19 5h-5M19 5v5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (gender === "female") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         style={{ width: size, height: size }} aria-label="Female">
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         style={{ width: size, height: size }} aria-label="Other">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

/* ── Avatar ───────────────────────────────────────────────────────── */
function Avatar({ person, size, fontSize }: { person: Person; size: number; fontSize: number }) {
  const p = genPalette[person.generation];
  const initials = (person.firstName[0] + (person.lastName ? person.lastName[0] : "")).toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: p.avatarBg,
      color: p.avatarText,
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

/* ── Person card ──────────────────────────────────────────────────── */
function PersonCard({ person, onEdit, onQuickAdd }: { person: Person; onEdit?: (p: Person) => void; onQuickAdd?: (type: 'child'|'sibling'|'spouse', p: Person) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const p = genPalette[person.generation];
  const dims = GEN_DIMS[person.generation];
  const genderColor =
    person.gender === "male" ? "#3b82f6" :
    person.gender === "female" ? "#ec4899" : "#8b5cf6";
  const genderLbl =
    person.gender === "male" ? "Laki-laki" : person.gender === "female" ? "Perempuan" : "Lainnya";

  return (
    <div 
      id={`person-node-${person.id}`}
      style={{ position: "relative", width: dims.cardW }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={() => onEdit?.(person)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          padding: "16px", background: "#fff",
          border: `1px solid ${p.cardBorder}`, borderTop: `3px solid ${p.accent}`,
          width: "100%", flexShrink: 0, cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.2s",
          boxShadow: isHovered ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)"
        }}
      >
        <Avatar person={person} size={dims.avatar} fontSize={dims.fontLg} />

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: dims.fontLg,
        fontWeight: 500,
        color: "#1c1917",
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
          color: "#78716c",
          margin: 0,
          marginBottom: 16,
        }}>
          "{person.alias}"
        </p>
      )}

      <div style={{ width: "100%", height: 1, background: "#f5f4f2", marginBottom: 10 }} />

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
      {isHovered && (
        <>
          {/* Top Right -> Sibling */}
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd?.("sibling", person); }}
            onMouseEnter={() => setActiveZone("sibling")}
            onMouseLeave={() => setActiveZone(null)}
            style={{
              position: "absolute", top: -14, right: -14,
              background: "#fff", border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "sibling" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: "pointer", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s", whiteSpace: "nowrap"
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
              background: "#fff", border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "spouse" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: "pointer", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s", whiteSpace: "nowrap"
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
              background: "#fff", border: `1.5px solid ${p.cardBorder}`, color: p.accent,
              borderRadius: 20, padding: activeZone === "child" ? "6px 10px" : "6px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", cursor: "pointer", zIndex: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: dims.fontSm, fontWeight: 500,
              transition: "all 0.15s", whiteSpace: "nowrap"
            }}
          >
            {activeZone === "child" ? "+ Keturunan" : "+"}
          </button>
        </>
      )}
    </div>
  );
}

/* ── Add ghost card ───────────────────────────────────────────────── */
function AddCard({ generation, onAdd }: { generation: Generation; onAdd: () => void }) {
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

/* ── Tree CSS ─────────────────────────────────────────────────────── */
const treeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

body, html {
  background: #faf9f7 !important;
}

.ftc-page {
  min-height: 100vh;
  background: #faf9f7;
  font-family: 'DM Sans', sans-serif;
}

.family-tree {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding-bottom: 2rem;
}
.family-tree ul {
  padding-top: 36px;
  position: relative;
  display: flex;
  justify-content: center;
  padding-left: 0;
  margin: 0;
}
.family-tree li {
  text-align: center;
  list-style-type: none;
  position: relative;
  padding: 36px 12px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.family-tree li::before, .family-tree li::after {
  content: '';
  position: absolute; top: 0; right: 50%;
  border-top: 1.5px solid #d6d3d1;
  width: 50%; height: 36px;
}
.family-tree li::after {
  right: auto; left: 50%;
  border-left: 1.5px solid #d6d3d1;
}
.family-tree li:only-child::after,
.family-tree li:only-child::before { display: none; }
.family-tree li:only-child { padding-top: 0; }
.family-tree li:first-child::before,
.family-tree li:last-child::after { border: 0 none; }
.family-tree li:last-child::before {
  border-right: 1.5px solid #d6d3d1;
  border-radius: 0 10px 0 0;
}
.family-tree li:first-child::after {
  border-radius: 10px 0 0 0;
}
.family-tree ul ul::before {
  content: '';
  position: absolute; top: 0; left: 50%;
  border-left: 1.5px solid #d6d3d1;
  width: 0; height: 36px;
  margin-left: -1px;
}
`;

/* ── Tree data ────────────────────────────────────────────────────── */
type ComputedFamily = {
  id: string;
  primary: Person;
  spouse: Person | null;
  children: ComputedFamily[];
  isDuplicatePrimary?: boolean;
};

function buildTree(people: Person[]): ComputedFamily[] {
  const processedFamilies = new Set<string>();

  function getFamiliesForPerson(person: Person): ComputedFamily[] {
    const spouses = people.filter(p => person.spouses?.includes(p.id) || p.spouses?.includes(person.id));
    const allChildren = people.filter(p => p.parents?.includes(person.id));
    
    const families: ComputedFamily[] = [];
    const childrenBySpouse = new Map<string, Person[]>();
    const unassignedChildren: Person[] = [];

    allChildren.forEach(child => {
       const childSpouseParents = child.parents?.filter(pid => pid !== person.id && spouses.some(s => s.id === pid)) || [];
       if (childSpouseParents.length > 0) {
          const sId = childSpouseParents[0];
          if (!childrenBySpouse.has(sId)) childrenBySpouse.set(sId, []);
          childrenBySpouse.get(sId)!.push(child);
       } else if (spouses.length === 1) {
          const sId = spouses[0].id;
          if (!childrenBySpouse.has(sId)) childrenBySpouse.set(sId, []);
          childrenBySpouse.get(sId)!.push(child);
       } else {
          unassignedChildren.push(child);
       }
    });

    let foundPrimary = false;

    spouses.forEach(spouse => {
       const famId = [person.id, spouse.id].sort().join("_");
       if (processedFamilies.has(famId)) return;
       processedFamilies.add(famId);

       const famChildren = childrenBySpouse.get(spouse.id) || [];
       const childFams: ComputedFamily[] = [];
       const sortedFamChildren = people.filter(p => famChildren.some(fc => fc.id === p.id));
       
       sortedFamChildren.forEach(child => {
          childFams.push(...getFamiliesForPerson(child));
       });

       families.push({
          id: famId,
          primary: person,
          spouse: spouse,
          children: childFams,
          isDuplicatePrimary: foundPrimary,
       });
       foundPrimary = true;
    });

    if (unassignedChildren.length > 0 || spouses.length === 0) {
       const famId = `single_${person.id}`;
       if (!processedFamilies.has(famId)) {
          processedFamilies.add(famId);
          const childFams: ComputedFamily[] = [];
          const sortedUnassigned = people.filter(p => unassignedChildren.some(uc => uc.id === p.id));
          sortedUnassigned.forEach(child => {
             childFams.push(...getFamiliesForPerson(child));
          });
          families.push({
             id: famId,
             primary: person,
             spouse: null,
             children: childFams,
             isDuplicatePrimary: foundPrimary,
          });
       }
    }

    return families;
  }

  const rootPeople = people.filter(p => {
     if (p.parents && p.parents.length > 0) return false;
     const spouses = people.filter(s => p.spouses?.includes(s.id) || s.spouses?.includes(p.id));
     const hasSpouseWithParents = spouses.some(s => s.parents && s.parents.length > 0);
     if (hasSpouseWithParents) return false;
     return true;
  });
  
  const rootFamilies: ComputedFamily[] = [];
  
  rootPeople.forEach(r => {
     rootFamilies.push(...getFamiliesForPerson(r));
  });

  return rootFamilies;
}

function TreeNode({ node, onEdit, onQuickAdd }: { node: ComputedFamily; onEdit?: (p: Person) => void, onQuickAdd?: (type: 'child'|'sibling'|'spouse', p: Person) => void }) {
  const dims = GEN_DIMS[node.primary.generation];
  return (
    <li>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
        {node.isDuplicatePrimary ? (
           <div style={{ width: dims.cardW, height: dims.cardW, position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", right: -12, width: "65%", height: 1.5, background: "#d6d3d1" }} />
           </div>
        ) : (
           <PersonCard person={node.primary} onEdit={onEdit} onQuickAdd={onQuickAdd} />
        )}
        
        {node.spouse && (
          <>
            <div style={{ width: 24, height: 1, background: "#d6d3d1", flexShrink: 0 }} />
            <PersonCard person={node.spouse} onEdit={onEdit} onQuickAdd={onQuickAdd} />
          </>
        )}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onEdit={onEdit} onQuickAdd={onQuickAdd} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Legend ───────────────────────────────────────────────────────── */
function Legend() {
  const items: [string, string][] = [
    [genPalette[4].accent, "Generasi 0"],
    [genPalette[3].accent, "Generasi 1"],
    [genPalette[2].accent, "Generasi 2"],
    [genPalette[1].accent, "Generasi 3"],
    ["#34d399", "Hidup"],
    ["#d6d3d1", "Meninggal"],
  ];
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px 20px",
      justifyContent: "center",
      marginTop: 48,
      paddingTop: 24,
      borderTop: "1px solid #e7e5e4",
    }}>
      {items.map(([color, label], i) => (
        <React.Fragment key={label}>
          {i === 4 && (
            <div style={{ width: 1, height: 14, background: "#e7e5e4", alignSelf: "center" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#a8a29e", letterSpacing: "0.03em" }}>
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ══ Main ═════════════════════════════════════════════════════════ */
export default function FamilyTreeClient() {
  const [people, setPeople]       = useState<Person[]>(initialFamily);
  const [modalOpen, setModalOpen] = useState(false);
  const [preselect, setPreselect] = useState<Generation>(3);
  const [isLoaded, setIsLoaded]   = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [quickAddData, setQuickAddData] = useState<{ type: 'child'|'sibling'|'spouse', source: Person } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const transformRef = useRef<any>(null);

  const searchResults = useMemo(() => {
     if (!searchQuery.trim()) return [];
     const q = searchQuery.toLowerCase();
     return people.filter(p => 
        p.firstName.toLowerCase().includes(q) || 
        p.lastName.toLowerCase().includes(q) || 
        (p.alias && p.alias.toLowerCase().includes(q))
     ).slice(0, 5);
  }, [searchQuery, people]);

  function handleSelectSearchResult(id: string) {
     if (transformRef.current) {
        transformRef.current.zoomToElement(`person-node-${id}`, 1.2, 400);
        const el = document.getElementById(`person-node-${id}`);
        if (el) {
           el.style.transition = "box-shadow 0.3s";
           el.style.boxShadow = "0 0 0 4px #fbbf24";
           el.style.borderRadius = "12px";
           setTimeout(() => { 
              el.style.boxShadow = "none"; 
              el.style.borderRadius = "0"; 
           }, 2000);
        }
     }
     setSearchQuery("");
     setIsSearchExpanded(false);
  }

  useEffect(() => {
    const saved = localStorage.getItem("familyTreeSettings");
    if (saved) {
      try {
        setPeople(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("familyTreeSettings", JSON.stringify(people));
    }
  }, [people, isLoaded]);

  function handleSave(person: Person) {
    if (editTarget) {
      setPeople((prev) => prev.map(p => p.id === person.id ? person : p));
    } else {
      setPeople((prev) => [...prev, person]);
    }
  }

  function handleDelete(id: string) {
    setPeople(prev => 
      prev
        .filter(p => p.id !== id)
        .map(p => ({
          ...p,
          spouses: p.spouses?.filter(sId => sId !== id) || [],
          parents: p.parents?.filter(pId => pId !== id) || [],
        }))
    );
    setModalOpen(false);
    setEditTarget(null);
  }

  function moveSibling(id: string, targetOrder: number) {
    setPeople(prev => {
      const person = prev.find(p => p.id === id);
      if (!person) return prev;
      
      const myParents = JSON.stringify([...(person.parents ?? [])].sort());
      const siblings = prev.filter(p => p.generation === person.generation && JSON.stringify([...(p.parents ?? [])].sort()) === myParents);
      if (siblings.length <= 1) return prev;
      
      const siblingIndex = siblings.findIndex(s => s.id === id);
      const targetIndex = Math.max(0, Math.min(siblings.length - 1, targetOrder - 1));
      
      if (siblingIndex === targetIndex) return prev;
      
      const nextSiblings = [...siblings];
      nextSiblings.splice(siblingIndex, 1);
      nextSiblings.splice(targetIndex, 0, person);
      
      const next = [...prev];
      const siblingIndicesInMain = siblings.map(s => next.findIndex(p => p.id === s.id)).sort((a,b) => a - b);
      
      siblingIndicesInMain.forEach((mainIdx, i) => {
        next[mainIdx] = nextSiblings[i];
      });
      
      return next;
    });
  }

  function moveSpouse(wifeId: string, husbandId: string, targetOrder: number) {
    setPeople(prev => {
      const wife = prev.find(p => p.id === wifeId);
      const husband = prev.find(p => p.id === husbandId);
      if (!wife || !husband) return prev;
      
      const wives = prev.filter(p => husband.spouses?.includes(p.id) || p.spouses?.includes(husband.id));
      if (wives.length <= 1) return prev;
      
      const wifeIndex = wives.findIndex(s => s.id === wifeId);
      if (wifeIndex === -1) return prev;

      const targetIndex = Math.max(0, Math.min(wives.length - 1, targetOrder - 1));
      if (wifeIndex === targetIndex) return prev;
      
      const nextWives = [...wives];
      nextWives.splice(wifeIndex, 1);
      nextWives.splice(targetIndex, 0, wife);
      
      const next = [...prev];
      const wifeIndicesInMain = wives.map(w => next.findIndex(p => p.id === w.id)).sort((a,b) => a - b);
      
      wifeIndicesInMain.forEach((mainIdx, i) => {
        next[mainIdx] = nextWives[i];
      });
      
      return next;
    });
  }

  function openFor(gen: Generation) {
    setPreselect(gen);
    setModalOpen(true);
    setEditTarget(null);
    setQuickAddData(null);
  }

  function handleQuickAdd(type: 'child'|'sibling'|'spouse', source: Person) {
    setQuickAddData({ type, source });
    setModalOpen(true);
    setEditTarget(null);
  }

  const treeData = useMemo(() => buildTree(people), [people]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="ftc-page">
      <style dangerouslySetInnerHTML={{ __html: treeStyles }} />

      {/* Top nav bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "rgba(250,249,247,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e7e5e4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 60,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 16,
          fontWeight: 500,
          color: "#44403c",
          letterSpacing: "-0.01em",
        }}>
          Keluarga Ikadam
        </span>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search container */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center",
              background: isSearchExpanded ? "#fff" : "transparent",
              border: isSearchExpanded ? "1px solid #d6d3d1" : "1px solid transparent",
              borderRadius: 20,
              padding: "4px 8px",
              transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
              width: isSearchExpanded ? 240 : 36,
              height: 36,
            }}>
               <button 
                 onClick={() => setIsSearchExpanded(true)}
                 style={{ 
                   background: "none", border: "none", color: isSearchExpanded ? "#a8a29e" : "#44403c", 
                   cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                   flexShrink: 0, width: 20, height: 20, padding: 0
                 }}
               >
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                   <circle cx="11" cy="11" r="8"/>
                   <path d="M21 21l-4.3-4.3" strokeLinecap="round"/>
                 </svg>
               </button>
               {isSearchExpanded && (
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Cari nama..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   onBlur={() => {
                     setTimeout(() => { if (!searchQuery) setIsSearchExpanded(false); }, 200);
                   }}
                   style={{
                     border: "none", background: "transparent", outline: "none",
                     width: "100%", padding: "0 8px", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                     color: "#44403c"
                   }}
                 />
               )}
            </div>

            {/* Dropdown for results */}
            {isSearchExpanded && searchQuery && searchResults.length > 0 && (
               <div style={{
                 position: "absolute", top: "100%", right: 0, marginTop: 8,
                 background: "#fff", border: "1px solid #d6d3d1", borderRadius: 12,
                 boxShadow: "0 4px 12px rgba(0,0,0,0.05)", width: 240, overflow: "hidden",
                 zIndex: 50
               }}>
                  {searchResults.map(p => (
                     <button
                       key={p.id}
                       onClick={() => handleSelectSearchResult(p.id)}
                       style={{
                         width: "100%", padding: "10px 16px",
                         display: "flex", flexDirection: "column", alignItems: "flex-start",
                         background: "transparent", border: "none", borderBottom: "1px solid #f5f4f2",
                         cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                       }}
                       onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                     >
                       <span style={{ fontSize: 13, fontWeight: 500, color: "#1c1917" }}>
                         {p.firstName} {p.lastName}
                       </span>
                       {p.alias && <span style={{ fontSize: 10, color: "#a8a29e", marginTop: 2 }}>{`"${p.alias}"`}</span>}
                     </button>
                  ))}
               </div>
            )}
            {isSearchExpanded && searchQuery && searchResults.length === 0 && (
               <div style={{
                 position: "absolute", top: "100%", right: 0, marginTop: 8,
                 background: "#fff", border: "1px solid #d6d3d1", borderRadius: 12,
                 boxShadow: "0 4px 12px rgba(0,0,0,0.05)", width: 240, padding: "12px 16px",
                 zIndex: 50, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#a8a29e", textAlign: "center"
               }}>
                 Tidak ada hasil
               </div>
            )}
          </div>

          <button
            id="add-member-btn"
            onClick={() => openFor(3)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "#fff",
              background: "#44403c",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
              borderRadius: 20,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1c1917"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#44403c"; }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            Tambah Anggota
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: 60, paddingBottom: 80, minHeight: "100vh" }}>

        {/* Header */}
        <header style={{ textAlign: "center", padding: "56px 24px 40px" }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#a8a29e",
            marginBottom: 10,
          }}>
            Family Tree
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 500,
            color: "#1c1917",
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Keluarga Ikadam
          </h1>
          <div style={{
            width: 40, height: 2, background: "#44403c",
            margin: "16px auto 0",
          }} />
        </header>

        {/* Tree Canvas */}
        <div style={{ width: "100%", height: "calc(100vh - 240px)", position: "relative", background: "#fdfdfb", borderRadius: "16px", overflow: "hidden", border: "1px solid #e7e5e4", margin: "0 auto", maxWidth: "98%", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)" }}>
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={3}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10, display: "flex", flexDirection: "column", gap: 8, background: "#fff", padding: 8, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e7e5e4" }}>
                  <button onClick={() => zoomIn()} title="Perbesar" style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "none", cursor: "pointer", fontSize: 18, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f5f4f2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>+</button>
                  <div style={{ width: "100%", height: 1, background: "#e7e5e4" }} />
                  <button onClick={() => zoomOut()} title="Perkecil" style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "none", cursor: "pointer", fontSize: 18, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f5f4f2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>-</button>
                  <div style={{ width: "100%", height: 1, background: "#e7e5e4" }} />
                  <button onClick={() => resetTransform()} title="Pusatkan" style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "none", cursor: "pointer", fontSize: 16, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f5f4f2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>⌂</button>
                </div>
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }}>
                  <div className="family-tree" style={{ padding: "80px 120px", display: "inline-block", minWidth: "100%" }}>
                    <ul>
                      {treeData.map(rootNode => (
                        <TreeNode key={rootNode.id} node={rootNode} onEdit={(p) => { setEditTarget(p); setQuickAddData(null); }} onQuickAdd={handleQuickAdd} />
                      ))}
                    </ul>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
        <Legend />
      </div>

      {/* Modal */}
      <AddMemberModal
        isOpen={modalOpen || !!editTarget || !!quickAddData}
        onClose={() => { setModalOpen(false); setEditTarget(null); setQuickAddData(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
        onMoveSibling={moveSibling}
        onMoveSpouse={moveSpouse}
        preselect={preselect}
        people={people}
        editPerson={editTarget}
        quickAddData={quickAddData}
      />
    </div>
  );
}
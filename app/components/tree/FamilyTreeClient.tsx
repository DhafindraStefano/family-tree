"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Person, Gender, Generation } from "../../types/family";
import { db } from "../../../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { initialFamily } from "../../data/familyData";
import AddMemberModal from "../modal/AddMemberModal";
import { useAuth } from "../../../lib/AuthContext";

import { treeStyles } from "./treeStyles";
import { buildTree } from "./buildTree";
import { TreeNode } from "./TreeNode";
import { PersonViewModal } from "../modal/PersonViewModal";

/* ══ Main ═════════════════════════════════════════════════════════ */
export default function FamilyTreeClient() {
  const { user, isAdmin, login, logout, theme, toggleTheme } = useAuth();

  const [people, setPeople]       = useState<Person[]>(initialFamily);
  const [modalOpen, setModalOpen] = useState(false);
  const [preselect, setPreselect] = useState<Generation>(3);
  const [isLoaded, setIsLoaded]   = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [quickAddData, setQuickAddData] = useState<{ type: 'child'|'sibling'|'sibling-before'|'spouse', source: Person } | null>(null);
  const [viewTarget, setViewTarget] = useState<Person | null>(null);

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
  const el = document.getElementById(`person-node-${id}`);
  
  if (el && transformRef.current) {
    // Read position BEFORE closing dropdown (which could cause layout shifts)
    const rect = el.getBoundingClientRect();
    const wrapperEl = el.closest(".react-transform-wrapper") as HTMLElement;
    
    if (wrapperEl) {
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const state = transformRef.current.instance.transformState;
      const scale = state.scale;

      // Calculate where the element is in the transform content space
      const contentX = (rect.left - wrapperRect.left - state.positionX) / scale;
      const contentY = (rect.top  - wrapperRect.top  - state.positionY) / scale;

      // Target scale
      const targetScale = 1.2;

      // Center of viewport
      const vpW = wrapperRect.width;
      const vpH = wrapperRect.height;

      const newX = vpW / 2 - (contentX + rect.width  / scale / 2) * targetScale;
      const newY = vpH / 2 - (contentY + rect.height / scale / 2) * targetScale;

      transformRef.current.setTransform(newX, newY, targetScale, 600, "easeOutCubic");
    }

    // Highlight ring
    el.style.transition = "box-shadow 0.3s";
    el.style.boxShadow = "0 0 0 4px #fbbf24";
    el.style.borderRadius = "12px";
    setTimeout(() => {
      el.style.boxShadow = "none";
      el.style.borderRadius = "0";
    }, 2000);
  }

  // Close dropdown AFTER capturing position
  setSearchQuery("");
  setIsSearchExpanded(false);
}

  // ── Firestore sync ────────────────────────────────────────────────
  const TREE_DOC = doc(db, "familyTrees", "ikadam");

  // Load: subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsub = onSnapshot(TREE_DOC, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.people)) {
          setPeople(data.people as Person[]);
        }
      }
      setIsLoaded(true);
    }, (err) => {
      console.error("Firestore read error:", err);
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  // Save: write back to Firestore whenever `people` changes (debounced 800ms)
  // Only admins are allowed to persist changes.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isLoaded || !isAdmin) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // Strip undefined fields — Firestore does not accept them
      const sanitized = JSON.parse(JSON.stringify(people));
      setDoc(TREE_DOC, { people: sanitized }, { merge: true }).catch((err) =>
        console.error("Firestore write error:", err)
      );
    }, 800);
  }, [people, isLoaded, isAdmin]);

  function handleSave(person: Person) {
    if (editTarget) {
      setPeople((prev) => prev.map(p => p.id === person.id ? person : p));
    } else {
      setPeople((prev) => {
        const next = [...prev, person];
        // If adding a sibling-before, immediately move the new sibling
        // to one position before the source person
        if (quickAddData?.type === 'sibling-before') {
          const source = quickAddData.source;
          const myParents = JSON.stringify([...(person.parents ?? [])].sort());
          const siblings = next.filter(p =>
            p.generation === person.generation &&
            JSON.stringify([...(p.parents ?? [])].sort()) === myParents
          );
          const sourceIndex = siblings.findIndex(s => s.id === source.id);
          const newPersonIndex = siblings.findIndex(s => s.id === person.id);
          const targetIndex = Math.max(0, sourceIndex); // insert at source's current position (source shifts right)
          if (newPersonIndex !== -1 && targetIndex !== newPersonIndex) {
            const reordered = [...siblings];
            reordered.splice(newPersonIndex, 1);
            reordered.splice(targetIndex, 0, person);
            const result = [...next];
            const siblingIndices = siblings.map(s => result.findIndex(p => p.id === s.id)).sort((a,b) => a - b);
            siblingIndices.forEach((mainIdx, i) => { result[mainIdx] = reordered[i]; });
            return result;
          }
        }
        return next;
      });
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
    if (!isAdmin) return;
    setPreselect(gen);
    setModalOpen(true);
    setEditTarget(null);
    setQuickAddData(null);
  }

  function handleQuickAdd(type: 'child'|'sibling'|'sibling-before'|'spouse', source: Person) {
    if (!isAdmin) return;
    setQuickAddData({ type, source });
    setModalOpen(true);
    setEditTarget(null);
  }

  const treeData = useMemo(() => buildTree(people), [people]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className={`ftc-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: treeStyles }} />

      {/* Top nav bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "var(--ft-nav-bg)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--ft-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 56,
        transition: "background 0.3s ease, border-bottom 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--ft-text-primary)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 140,
          }}>
            Keluarga Ikadam
          </span>

          <button
            onClick={toggleTheme}
            title={theme === 'light' ? "Mode Gelap" : "Mode Terang"}
            style={{
              background: "none",
              border: "1px solid var(--ft-border)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--ft-text-primary)",
              transition: "all 0.2s",
              padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--ft-border)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>

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
                   className="ftc-search-input"
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
                     width: "100%", padding: "0 8px", fontFamily: "'DM Sans', sans-serif",
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

          {/* Auth button */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ""}
                  title={user.displayName ?? ""}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e7e5e4", cursor: "default" }}
                />
              )}
              <button
                onClick={logout}
                style={{
                  padding: "6px 12px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#78716c",
                  background: "none",
                  border: "1px solid #e7e5e4",
                  cursor: "pointer",
                  borderRadius: 20,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f4f2"; e.currentTarget.style.color = "#44403c"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#78716c"; }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
                color: "#44403c",
                background: "#fff",
                border: "1px solid #e7e5e4",
                cursor: "pointer",
                borderRadius: 20,
                flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f5f4f2"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
            >
              Masuk
            </button>
          )}

          {/* Add button — admins only */}
          {isAdmin && (
            <button
              id="add-member-btn"
              onClick={() => openFor(3)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
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
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1c1917"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#44403c"; }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              <span className="add-btn-label">Tambah Anggota</span>
            </button>
          )}
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: 56, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >

        {/* Tree Canvas */}
        <div style={{ flex: 1, position: "relative", background: "var(--ft-canvas-bg)", overflow: "hidden", transition: "background 0.3s ease" }}>
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={3}
            centerOnInit
            limitToBounds={false}
            wheel={{ step: 0.08, activationKeys: ["Control"] }}
            panning={{ wheelPanning: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div style={{ position: "absolute", bottom: 20, right: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 0, background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", border: "1px solid #e7e5e4", overflow: "hidden" }}>
                  <button onClick={() => zoomIn()} title="Perbesar" style={{ width: 44, height: 44, background: "#fff", border: "none", borderBottom: "1px solid #e7e5e4", cursor: "pointer", fontSize: 20, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  <button onClick={() => zoomOut()} title="Perkecil" style={{ width: 44, height: 44, background: "#fff", border: "none", borderBottom: "1px solid #e7e5e4", cursor: "pointer", fontSize: 20, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <button onClick={() => resetTransform()} title="Pusatkan" style={{ width: 44, height: 44, background: "#fff", border: "none", cursor: "pointer", fontSize: 16, color: "#44403c", display: "flex", alignItems: "center", justifyContent: "center" }}>⌂</button>
                </div>
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }}>
                  <div className="family-tree" style={{ padding: "80px 120px", display: "inline-block", minWidth: "100%" }}>
                    <ul>
                      {treeData.map(rootNode => (
                        <TreeNode
  key={rootNode.id}
  node={rootNode}
  onEdit={(p) => { setEditTarget(p); setQuickAddData(null); }}
  onQuickAdd={handleQuickAdd}
  onView={(p) => setViewTarget(p)}
  isAdmin={isAdmin}
/>
                      ))}
                    </ul>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      {/* Edit Modal (admins only) */}
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

      {/* View Modal (all visitors) */}
      <PersonViewModal
        person={viewTarget}
        people={people}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
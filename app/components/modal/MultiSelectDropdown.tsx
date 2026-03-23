"use client";

import { useState } from "react";

export function MultiSelectDropdown({ 
  label, options, selected, onChange 
}: { 
  label: string; 
  options: { id: string; label: string }[]; 
  selected: string[]; 
  onChange: (ids: string[]) => void 
}) {
  const [open, setOpen] = useState(false);
  const text = selected.length === 0 
    ? "Tidak Ada" 
    : selected.map(id => options.find(o => o.id === id)?.label || "Tidak Diketahui").join(", ");

  return (
    <div style={{ position: "relative" }}>
      <label className="amm-label">{label}</label>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "10px 0", borderBottom: "1px solid #e7e5e4",
          fontSize: 13, color: selected.length === 0 ? "#a8a29e" : "#44403c",
          cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'DM Sans', sans-serif",
          userSelect: "none"
        }}
      >
        {text}
      </div>
      {open && (
         <>
           <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
           <div style={{
             position: "absolute", top: "100%", left: 0, right: 0, zIndex: 70,
             background: "#fff", border: "1px solid #e7e5e4", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
             maxHeight: 160, overflowY: "auto"
           }}>
             {options.length === 0 && <div style={{ padding: "8px 12px", fontSize: 13, color: "#a8a29e" }}>Tidak ada kerabat yang sesuai</div>}
             {options.map(o => (
               <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "#44403c", cursor: "pointer", borderBottom: "1px solid #f5f4f2", margin: 0 }}>
                 <input
                   type="checkbox"
                   checked={selected.includes(o.id)}
                   onChange={(e) => {
                     if (e.target.checked) onChange([...selected, o.id]);
                     else onChange(selected.filter(id => id !== o.id));
                   }}
                   style={{ accentColor: "#44403c" }}
                 />
                 {o.label}
               </label>
             ))}
           </div>
         </>
      )}
    </div>
  );
}

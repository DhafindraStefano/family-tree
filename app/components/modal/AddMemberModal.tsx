"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Person, Gender, Generation } from "../../types/family";

interface Props {
  isOpen:     boolean;
  onClose:    () => void;
  onSave:     (person: Person) => void;
  onDelete?:  (id: string) => void;
  onMoveSibling?: (id: string, targetOrder: number) => void;
  onMoveSpouse?: (wifeId: string, husbandId: string, targetOrder: number) => void;
  preselect?: Generation;
  people:     Person[];
  editPerson?: Person | null;
  quickAddData?: { type: 'child'|'sibling'|'sibling-before'|'spouse', source: Person } | null;
}

const GEN_LABELS: Record<Generation, string> = {
  4: "Generasi 0",
  3: "Generasi 1",
  2: "Generasi 2",
  1: "Generasi 3",
};

const emptyForm = {
  firstName:   "",
  lastName:    "",
  alias:       "",
  gender:      "male" as Gender,
  dateOfBirth: "",
  isAlive:     true,
  generation:  3 as Generation,
  parents:     [] as string[],
  spouses:     [] as string[],
  imageUrl:    "",
};

import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { AddMemberPhotoPicker } from "./AddMemberPhotoPicker";
export default function AddMemberModal({ isOpen, onClose, onSave, onDelete, onMoveSibling, onMoveSpouse, preselect, people, editPerson, quickAddData }: Props) {
  const [form,  setForm]  = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editPerson) {
        // eslint-disable-next-line
        setForm({
          ...emptyForm,
          ...editPerson,
          parents: editPerson.parents || [],
          spouses: editPerson.spouses || [],
          imageUrl: editPerson.imageUrl || "",
          alias: editPerson.alias || "",
        });
      } else if (quickAddData) {
        const baseForm = { ...emptyForm, generation: quickAddData.source.generation };
        if (quickAddData.type === 'child') {
          const spousePool = people.filter(p => quickAddData.source.spouses?.includes(p.id) || p.spouses?.includes(quickAddData.source.id));
          baseForm.parents = spousePool.length > 0 
              ? [quickAddData.source.id, spousePool[0].id]
              : [quickAddData.source.id];
          baseForm.generation = Math.max(1, quickAddData.source.generation - 1) as Generation;
        } else if (quickAddData.type === 'sibling' || quickAddData.type === 'sibling-before') {
          baseForm.parents = quickAddData.source.parents || [];
          baseForm.generation = quickAddData.source.generation;
        } else if (quickAddData.type === 'spouse') {
          baseForm.spouses = [quickAddData.source.id];
          baseForm.generation = quickAddData.source.generation;
          // Auto-assign opposite gender to speed up data entry
          if (quickAddData.source.gender === 'male') baseForm.gender = 'female';
          else if (quickAddData.source.gender === 'female') baseForm.gender = 'male';
        }
        setForm(baseForm);
      } else {
        setForm({ ...emptyForm, generation: preselect ?? 3 });
      }
      setError("");
    }
  }, [isOpen, preselect, editPerson, quickAddData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) { setError("Nama depan wajib diisi.");    return; }

    const person: Person = {
      id:          editPerson ? editPerson.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      firstName:   form.firstName.trim(),
      lastName:    form.lastName.trim(),
      alias:       form.alias.trim() || undefined,
      generation:  form.generation,
      gender:      form.gender,
      dateOfBirth: form.dateOfBirth,
      isAlive:     form.isAlive,
      parents:     form.parents,
      spouses:     form.spouses,
      imageUrl:    form.imageUrl,
    };

    onSave(person);
    onClose();
  }


  const inputClass = `
    w-full border-0 border-b border-[var(--ft-border)] bg-transparent text-[var(--ft-text-primary)]
    text-base py-2.5 px-0 placeholder-[var(--ft-text-secondary)]
    focus:outline-none focus:border-[var(--ft-text-primary)]
    transition-colors duration-200
  `;

  const selectClass = `
    w-full border-0 border-b border-[var(--ft-border)] bg-transparent text-[var(--ft-text-primary)]
    text-base py-2.5 px-0
    focus:outline-none focus:border-[var(--ft-text-primary)]
    transition-colors duration-200
  `;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        .amm-overlay {
          animation: amm-fade-in 0.2s ease;
        }
        .amm-panel {
          animation: amm-slide-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes amm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes amm-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .amm-toggle-btn {
          flex: 1;
          padding: 8px 0;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          letter-spacing: 0.02em;
          border: 1px solid var(--ft-border);
          background: transparent;
          color: var(--ft-text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .amm-toggle-btn:hover:not(.active) {
          background: var(--ft-border);
          color: var(--ft-text-primary);
        }
        .amm-toggle-btn.active-male   { border-color: #60a5fa; background: rgba(96, 165, 250, 0.1); color: #3b82f6; }
        .amm-toggle-btn.active-female { border-color: #f9a8d4; background: rgba(249, 168, 212, 0.1); color: #ec4899; }
        .amm-toggle-btn.active-alive  { border-color: #86efac; background: rgba(134, 239, 172, 0.1); color: #10b981; }
        .amm-toggle-btn.active-deceased { border-color: var(--ft-border); background: var(--ft-border); color: var(--ft-text-secondary); }

        .amm-multi-select {
          width: 100%;
          height: 100px;
          border: 1px solid var(--ft-border);
          background: var(--ft-canvas-bg);
          color: var(--ft-text-primary);
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          padding: 8px;
          focus: outline-none;
          transition: border-color 0.2s;
        }
        .amm-multi-select:focus {
          outline: none;
          border-color: #a8a29e;
        }
        .amm-multi-select option {
          padding: 4px 6px;
        }

        .amm-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ft-text-secondary);
          margin-bottom: 10px;
        }

        @media (max-width: 600px) {
          .amm-actions {
            order: -1;
            padding-top: 0 !important;
            padding-bottom: 8px;
            border-bottom: 1px dashed #e7e5e4;
          }
        }
      `}</style>

      <div
        className="amm-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="amm-panel relative w-full max-w-sm bg-[var(--ft-card-bg)]"
          style={{
            boxShadow: "0 2px 4px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.2)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            overflow: "hidden",
            transition: "background 0.3s ease"
          }}
        >
          {/* Top rule */}
          <div style={{ height: 3, background: "var(--ft-text-primary)", flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-start justify-between px-10 pt-6 pb-6" style={{ flexShrink: 0 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, marginTop: 10, marginLeft: 32, color: "var(--ft-text-primary)", letterSpacing: "-0.01em"}}>
                {editPerson ? "Edit Anggota Keluarga" : "Tambah Anggota Keluarga"}
              </h2>
            </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  marginTop: 2,
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--ft-text-secondary)", fontSize: 16, lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ft-text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ft-text-secondary)")}
              >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--ft-border)", margin: "0 32px", flexShrink: 0 }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ 
            padding: "24px 32px 32px", 
            display: "flex", flexDirection: "column", gap: 28,
            overflowY: "auto",
            flex: 1
          }}>

            {/* Photo */}
            <AddMemberPhotoPicker 
               imageUrl={form.imageUrl || ""} 
               onImageChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))} 
               isOpen={isOpen} 
            />

            {/* Generation */}
            <div>
              <label className="amm-label">Generasi</label>
              <select
                value={form.generation}
                onChange={(e) => setForm({ 
                  ...form, 
                  generation: Number(e.target.value) as Generation,
                  parents: [],
                  spouses: []
                })}
                className={selectClass}
              >
                {([4, 3, 2, 1] as Generation[]).map((g) => (
                  <option key={g} value={g}>{GEN_LABELS[g]}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label htmlFor="firstName" className="amm-label">Nama Depan</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="mis. Budi"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="amm-label">Nama Belakang</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="mis. Santoso"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Alias */}
            <div>
              <label htmlFor="alias" className="amm-label">Alias (Opsional)</label>
              <input
                id="alias"
                type="text"
                placeholder="mis. Nama panggilan, dll."
                value={form.alias}
                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="amm-label">Tanggal Lahir</label>
              <input
                id="dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="amm-label">Jenis Kelamin</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`amm-toggle-btn ${form.gender === g ? `active-${g}` : ""}`}
                  >
                    {g === "male" ? "Laki-laki" : "Perempuan"}
                  </button>
                ))}
              </div>
            </div>

            {/* Vital Status */}
            <div>
              <label className="amm-label">Status</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[true, false].map((alive) => (
                  <button
                    key={String(alive)}
                    type="button"
                    onClick={() => setForm({ ...form, isAlive: alive })}
                    className={`amm-toggle-btn ${form.isAlive === alive ? (alive ? "active-alive" : "active-deceased") : ""}`}
                  >
                    {alive ? "Hidup" : "Meninggal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Parents & Spouses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <MultiSelectDropdown
                label="Orang Tua"
                options={people
                  .filter(p => p.generation === form.generation + 1)
                  .map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName || ""}`.trim() }))}
                selected={form.parents}
                onChange={vals => setForm({ ...form, parents: vals })}
              />
              <MultiSelectDropdown
                label="Pasangan"
                options={people
                  .filter(p => {
                    if (p.id === editPerson?.id) return false;
                    if (p.generation !== form.generation) return false;
                    
                    // No siblings
                    if (form.parents.length > 0 && p.parents?.some(pid => form.parents.includes(pid))) {
                      return false;
                    }
                    
                    return true;
                  })
                  .map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName || ""}`.trim() }))}
                selected={form.spouses}
                onChange={vals => setForm({ ...form, spouses: vals })}
              />
            </div>

            {/* Sibling Order */}
            {editPerson && (() => {
              const myParents = JSON.stringify([...(form.parents ?? [])].sort());
              if (myParents === "[]") return null;
              
              const siblings = people.filter(p => p.generation === form.generation && JSON.stringify([...(p.parents ?? [])].sort()) === myParents);
              if (siblings.length <= 1) return null;
              
              const myIndex = siblings.findIndex(s => s.id === editPerson.id);
              const currentPosition = myIndex + 1;

              return (
                <div style={{ padding: "16px", background: "var(--ft-canvas-bg)", border: "1px solid var(--ft-border)" }}>
                  <label className="amm-label" style={{ marginBottom: 12 }}>Posisi Saudara (Kiri ke Kanan)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ft-text-primary)" }}>
                    <span>Urutan:</span>
                    <input
                      type="number"
                      min={1}
                      max={siblings.length}
                      value={currentPosition}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= siblings.length && onMoveSibling) {
                          onMoveSibling(editPerson.id, val);
                        }
                      }}
                      style={{
                        width: 60,
                        padding: "6px 8px",
                        border: "1px solid var(--ft-border)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        outline: "none",
                        background: "transparent",
                        color: "inherit"
                      }}
                    />
                    <span style={{ color: "var(--ft-text-secondary)" }}>dari {siblings.length} saudara</span>
                  </div>
                </div>
              );
            })()}

            {/* Spouse Order */}
            {editPerson && (() => {
               const mySpouses = people.filter(p => editPerson.spouses?.includes(p.id) || p.spouses?.includes(editPerson.id));
               const polySpouses = mySpouses.filter(ms => {
                  const theirSpouses = people.filter(p => ms.spouses?.includes(p.id) || p.spouses?.includes(ms.id));
                  return theirSpouses.length > 1;
               });
               
               if (polySpouses.length === 0) return null;

               return polySpouses.map(polySpouse => {
                  const theirSpouses = people.filter(p => polySpouse.spouses?.includes(p.id) || p.spouses?.includes(polySpouse.id));
                  const myIndex = theirSpouses.findIndex(s => s.id === editPerson.id);
                  const currentPosition = myIndex + 1;

                  return (
                    <div key={polySpouse.id} style={{ padding: "16px", background: "var(--ft-canvas-bg)", border: "1px solid var(--ft-border)" }}>
                      <label className="amm-label" style={{ marginBottom: 12 }}>
                        Urutan Pernikahan (dengan {polySpouse.firstName} {polySpouse.lastName})
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ft-text-primary)" }}>
                        <span>Urutan:</span>
                        <input
                          type="number"
                          min={1}
                          max={theirSpouses.length}
                          value={currentPosition}
                          onChange={e => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= theirSpouses.length && onMoveSpouse) {
                              onMoveSpouse(editPerson.id, polySpouse.id, val);
                            }
                          }}
                          style={{
                            width: 60, padding: "6px 8px", border: "1px solid var(--ft-border)",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none",
                            background: "transparent", color: "inherit"
                          }}
                        />
                        <span style={{ color: "var(--ft-text-secondary)" }}>dari {theirSpouses.length} pasangan</span>
                      </div>
                    </div>
                  );
               });
            })()}

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#b91c1c",
                borderLeft: "2px solid #fca5a5",
                paddingLeft: 10,
                margin: 0,
              }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="amm-actions" style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              {editPerson && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Anda yakin ingin menghapus orang ini?")) {
                      onDelete(editPerson.id);
                    }
                  }}
                  style={{
                    flex: 0.5,
                    padding: "11px 0",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#dc2626",
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; }}
                >
                  Hapus
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--ft-text-secondary)",
                  background: "none",
                  border: "1px solid var(--ft-border)",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--ft-border)"; e.currentTarget.style.color = "var(--ft-text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ft-text-secondary)"; }}
              >
                Batal
              </button>
              <button
                type="submit"
                id="add-member-submit"
                style={{
                  flex: 1,
                  padding: "11px 0",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  background: "var(--ft-text-primary)",
                  border: "1px solid var(--ft-text-primary)",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                {editPerson ? "Simpan Perubahan" : "Tambah Anggota"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Person, Gender, Generation } from "../types/family";

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

function MultiSelectDropdown({ 
  label, options, selected, onChange 
}: { 
  label: string; options: { id: string; label: string }[]; selected: string[]; onChange: (ids: string[]) => void 
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

export default function AddMemberModal({ isOpen, onClose, onSave, onDelete, onMoveSibling, onMoveSpouse, preselect, people, editPerson, quickAddData }: Props) {
  const [form,  setForm]  = useState(emptyForm);
  const [error, setError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user'|'environment'>('environment');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setCameraFacing(navigator.maxTouchPoints > 0 ? 'environment' : 'user');
    }
  }, []);

async function startCamera(overrideFacing?: 'user'|'environment') {
  try {
    const facingMode = overrideFacing || cameraFacing;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        videoRef.current!.onloadedmetadata = () => resolve();
        videoRef.current!.onerror = reject;
      });
      await videoRef.current.play();
    }
    setIsCameraOpen(true);
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Kamera tidak dapat diakses. Periksa izin akses.");
  }
}

  function stopCamera() {
    // Stop all tracks via the stored stream ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }

  function capturePhoto() {
  if (!videoRef.current) return;
  const video = videoRef.current;

  // Wait for a real frame to be available
  requestAnimationFrame(() => {
    const canvas = document.createElement("canvas");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const srcX = (video.videoWidth - minDim) / 2;
    const srcY = (video.videoHeight - minDim) / 2;

    ctx.drawImage(video, srcX, srcY, minDim, minDim, 0, 0, size, size);
    setForm(prev => ({ ...prev, imageUrl: canvas.toDataURL("image/jpeg", 0.7) }));
    stopCamera();
  });
}

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Stop camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editPerson) {
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
    else stopCamera();
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const minDim = Math.min(img.width, img.height);
        const srcX = (img.width - minDim) / 2;
        const srcY = (img.height - minDim) / 2;
        ctx.drawImage(img, srcX, srcY, minDim, minDim, 0, 0, size, size);
        setForm(prev => ({ ...prev, imageUrl: canvas.toDataURL("image/jpeg", 0.7) }));
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  const inputClass = `
    w-full border-0 border-b border-stone-200 bg-transparent text-stone-800
    text-sm py-2.5 px-0 placeholder-stone-300
    focus:outline-none focus:border-stone-500
    transition-colors duration-200
    [color-scheme:light]
  `;

  const selectClass = `
    w-full border-0 border-b border-stone-200 bg-transparent text-stone-800
    text-sm py-2.5 px-0
    focus:outline-none focus:border-stone-500
    transition-colors duration-200
    [color-scheme:light]
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
          border: 1px solid #e7e5e4;
          background: transparent;
          color: #a8a29e;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .amm-toggle-btn:hover:not(.active) {
          background: #fafaf9;
          color: #78716c;
        }
        .amm-toggle-btn.active-male   { border-color: #60a5fa; background: #eff6ff; color: #2563eb; }
        .amm-toggle-btn.active-female { border-color: #f9a8d4; background: #fdf2f8; color: #be185d; }
        .amm-toggle-btn.active-alive  { border-color: #86efac; background: #f0fdf4; color: #15803d; }
        .amm-toggle-btn.active-deceased { border-color: #d6d3d1; background: #fafaf9; color: #57534e; }

        .amm-multi-select {
          width: 100%;
          height: 100px;
          border: 1px solid #e7e5e4;
          background: #fafaf9;
          color: #44403c;
          font-size: 12.5px;
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
          color: #a8a29e;
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
        style={{ background: "rgba(245,244,242,0.85)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="amm-panel relative w-full max-w-sm bg-white"
          style={{
            boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.10)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            overflow: "hidden"
          }}
        >
          {/* Top rule */}
          <div style={{ height: 3, background: "#44403c", flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-start justify-between px-10 pt-6 pb-6" style={{ flexShrink: 0 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, marginTop: 10, marginLeft: 32, color: "#1c1917", letterSpacing: "-0.01em"}}>
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
                color: "#c4bfbb", fontSize: 16, lineHeight: 1,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#44403c")}
              onMouseLeave={e => (e.currentTarget.style.color = "#c4bfbb")}
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f5f4f2", margin: "0 32px", flexShrink: 0 }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ 
            padding: "24px 32px 32px", 
            display: "flex", flexDirection: "column", gap: 28,
            overflowY: "auto",
            flex: 1
          }}>

            {/* Photo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: -10 }}>

              {/* Video element is ALWAYS in DOM so videoRef is available before isCameraOpen is true */}
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: "#000", overflow: "hidden",
                display: isCameraOpen ? "flex" : "none",
                alignItems: "center", justifyContent: "center"
              }}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {!isCameraOpen && (
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "#f5f4f2", border: "1px dashed #d6d3d1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", color: "#a8a29e"
                }}>
                  {form.imageUrl ? (
                    <img src={form.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar Preview" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              )}

              {isCameraOpen ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={capturePhoto} style={{ fontSize: 11, padding: "4px 12px", background: "#44403c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Potret</button>
                  <button type="button" onClick={() => {
                    const next = cameraFacing === 'user' ? 'environment' : 'user';
                    setCameraFacing(next);
                    startCamera(next);
                  }} style={{ fontSize: 12, padding: "4px 8px", background: "#f5f4f2", color: "#44403c", border: "1px solid #d6d3d1", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button type="button" onClick={stopCamera} style={{ fontSize: 11, padding: "4px 12px", background: "#f5f4f2", color: "#44403c", border: "1px solid #d6d3d1", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Batal</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <label style={{ fontSize: 11, color: "#78716c", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    Unggah File
                  </label>
                  <span onClick={(e) => { e.preventDefault(); startCamera(); }} style={{ fontSize: 11, color: "#78716c", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    Ambil Foto
                  </span>
                  {form.imageUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        setForm(prev => ({ ...prev, imageUrl: "" }));
                      }}
                      style={{ fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                    >
                      Hapus
                    </span>
                  )}
                </div>
              )}
            </div>

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
            {editPerson && (
              <div style={{ padding: "16px", background: "#f5f4f2", border: "1px solid #e7e5e4" }}>
                <label className="amm-label" style={{ marginBottom: 12 }}>Posisi Saudara (Kiri ke Kanan)</label>
                {(() => {
                  const myParents = JSON.stringify([...(form.parents ?? [])].sort());
                  if (myParents === "[]") {
                    return <div style={{ fontSize: 13, color: "#a8a29e" }}>Tambahkan orang tua untuk menyusun urutan anak.</div>;
                  }
                  const siblings = people.filter(p => p.generation === form.generation && JSON.stringify([...(p.parents ?? [])].sort()) === myParents);
                  if (siblings.length <= 1) {
                    return <div style={{ fontSize: 13, color: "#a8a29e" }}>Tidak ada saudara lain di keluarga ini.</div>;
                  }
                  
                  const myIndex = siblings.findIndex(s => s.id === editPerson.id);
                  const currentPosition = myIndex + 1;

                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#44403c" }}>
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
                          border: "1px solid #d6d3d1",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          outline: "none"
                        }}
                      />
                      <span style={{ color: "#a8a29e" }}>dari {siblings.length} saudara</span>
                    </div>
                  );
                })()}
              </div>
            )}

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
                    <div key={polySpouse.id} style={{ padding: "16px", background: "#f5f4f2", border: "1px solid #e7e5e4" }}>
                      <label className="amm-label" style={{ marginBottom: 12 }}>
                        Urutan Pernikahan (dengan {polySpouse.firstName} {polySpouse.lastName})
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#44403c" }}>
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
                            width: 60, padding: "6px 8px", border: "1px solid #d6d3d1",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none"
                          }}
                        />
                        <span style={{ color: "#a8a29e" }}>dari {theirSpouses.length} pasangan</span>
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
                  color: "#78716c",
                  background: "none",
                  border: "1px solid #e7e5e4",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fafaf9"; e.currentTarget.style.color = "#44403c"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#78716c"; }}
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
                  background: "#44403c",
                  border: "1px solid #44403c",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1c1917"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#44403c"; }}
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
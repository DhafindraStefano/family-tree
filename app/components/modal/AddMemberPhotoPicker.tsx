"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  imageUrl: string;
  onImageChange: (url: string) => void;
  isOpen: boolean;
}

export function AddMemberPhotoPicker({ imageUrl, onImageChange, isOpen }: Props) {
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
      onImageChange(canvas.toDataURL("image/jpeg", 0.7));
      stopCamera();
    });
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
        onImageChange(canvas.toDataURL("image/jpeg", 0.7));
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!isOpen) stopCamera();
  }, [isOpen]);

  return (
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
          {imageUrl ? (
            <img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar Preview" />
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
          {imageUrl && (
            <span
              onClick={(e) => {
                e.preventDefault();
                onImageChange("");
              }}
              style={{ fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              Hapus
            </span>
          )}
        </div>
      )}
    </div>
  );
}

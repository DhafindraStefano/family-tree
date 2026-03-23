import React from "react";
import { Gender } from "../../types/family";

export function GenderIcon({ gender, size = 12 }: { gender: Gender; size?: number }) {
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

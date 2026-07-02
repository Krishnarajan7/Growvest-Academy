import React from "react";

/* Hand-drawn kid doodles — decorative, inherit `currentColor`, aria-hidden.
   Shared by the kids landing and the Super Kids page. */

export function Sun({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="8.5" stroke="currentColor" strokeWidth="2.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={24 + Math.cos(a) * 13}
            y1={24 + Math.sin(a) * 13}
            x2={24 + Math.cos(a) * 19}
            y2={24 + Math.sin(a) * 19}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Sparkle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0c.7 5.8 2.4 9.5 12 12-9.6 2.5-11.3 6.2-12 12-.7-5.8-2.4-9.5-12-12C9.6 9.5 11.3 5.8 12 0Z" />
    </svg>
  );
}

export function StarDoodle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l2.5 6 6.5.4-5 4.2 1.7 6.3L12 16.8 6.3 19.9 8 13.6l-5-4.2 6.5-.4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Smiley({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="11.5" cy="13" r="1.6" fill="currentColor" />
      <circle cx="20.5" cy="13" r="1.6" fill="currentColor" />
      <path d="M10 19c1.8 2.6 10.2 2.6 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PaperPlane({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M29 3 3 14l10 3 3 10 4-8 6-16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 17 29 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Squiggle({ className }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" className={className} aria-hidden>
      <path
        d="M2 8c8-8 16 4 24 0s16-8 24 0 16 4 24 0 16-8 24 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Pencil({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M4 28l1.5-6L22 5.5 26.5 10 10 26.5 4 28Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 8.5 23.5 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Balloon({ className }) {
  return (
    <svg viewBox="0 0 24 32" fill="none" className={className} aria-hidden>
      <path d="M12 21c5 0 9-4.4 9-10S17 1 12 1 3 5.4 3 11s4 10 9 10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 21l-1.5 3h3L12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 24c0 3 2 3 2 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

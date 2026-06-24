"use client";

import * as React from "react";

/**
 * Dinding logo brand monokrom untuk "social proof" di hero.
 * Logo digambar sebagai wordmark + mark SVG sederhana memakai `currentColor`
 * sehingga seragam, ringan, dan mudah diwarnai (light di atas hero gelap).
 */

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="currentColor" />
      <rect x="13" y="1" width="10" height="10" fill="currentColor" opacity="0.7" />
      <rect x="1" y="13" width="10" height="10" fill="currentColor" opacity="0.7" />
      <rect x="13" y="13" width="10" height="10" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function VercelMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M12 3 L23 21 L1 21 Z" fill="currentColor" />
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg viewBox="0 0 32 24" className="h-4 w-5" aria-hidden fill="currentColor">
      <path d="M5 4 h22 l-4 4 H1 Z" />
      <path d="M5 10 h22 l-4 4 H1 Z" opacity="0.75" />
      <path d="M5 16 h22 l-4 4 H1 Z" opacity="0.5" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M12 11v2.8h4c-.17 1-1.3 3-4 3a4.4 4.4 0 0 1 0-8.8c1.25 0 2.1.53 2.58.99l1.76-1.7A7 7 0 1 0 12 19c4.04 0 6.7-2.84 6.7-6.84 0-.46-.05-.81-.11-1.16H12z" />
    </svg>
  );
}

function AwsMark() {
  return (
    <svg viewBox="0 0 40 24" className="h-4 w-6" aria-hidden fill="currentColor">
      <text x="0" y="13" fontSize="13" fontWeight="800" fontFamily="system-ui">aws</text>
      <path d="M2 18c8 4 28 4 36 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function OpenAiMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3a4 4 0 0 1 3.46 2 4 4 0 0 1 2 6.92A4 4 0 0 1 12 21a4 4 0 0 1-3.46-2 4 4 0 0 1-2-6.92A4 4 0 0 1 12 3Z" />
      <path d="M12 8v8M8.5 9.75l7 4.5M15.5 9.75l-7 4.5" strokeWidth="1.2" />
    </svg>
  );
}

const BRANDS: { name: string; mark: React.ReactNode }[] = [
  { name: "Google", mark: <GoogleMark /> },
  { name: "Microsoft", mark: <MicrosoftMark /> },
  { name: "aws", mark: <AwsMark /> },
  { name: "Solana", mark: <SolanaMark /> },
  { name: "OpenAI", mark: <OpenAiMark /> },
  { name: "Vercel", mark: <VercelMark /> },
];

export function BrandLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-9 gap-y-5 ${className}`}>
      {BRANDS.map((b) => (
        <div
          key={b.name}
          className="flex items-center gap-2 text-white/45 transition-colors duration-300 hover:text-white/80"
        >
          {b.mark}
          {b.name !== "aws" && (
            <span className="text-lg font-semibold tracking-tight">{b.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

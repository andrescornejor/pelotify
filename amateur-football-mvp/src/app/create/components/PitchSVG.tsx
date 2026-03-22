'use client';

import { memo } from 'react';

interface PitchSVGProps {
  type: 'F5' | 'F7' | 'F11';
}

const PitchSVG = ({ type }: PitchSVGProps) => {
  const isF5 = type === 'F5';
  const isF11 = type === 'F11';
  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-full opacity-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="196" height="126" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="100" y1="2" x2="100" y2="128" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="65" r="18" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="65" r="2" fill="currentColor" />
      {/* Goals */}
      <rect
        x="2"
        y="47"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="36"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x={isF5 ? 190 : isF11 ? 186 : 188}
        y="47"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="36"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Penalty areas */}
      {!isF5 && (
        <>
          <rect
            x="2"
            y="32"
            width={isF11 ? 35 : 28}
            height="66"
            stroke="currentColor"
            strokeWidth="1"
          />
          <rect
            x={isF11 ? 163 : 170}
            y="32"
            width={isF11 ? 35 : 28}
            height="66"
            stroke="currentColor"
            strokeWidth="1"
          />
        </>
      )}
      {isF11 && (
        <>
          <rect x="2" y="48" width="14" height="34" stroke="currentColor" strokeWidth="1" />
          <rect x="184" y="48" width="14" height="34" stroke="currentColor" strokeWidth="1" />
          <circle cx="27" cy="65" r="1.5" fill="currentColor" />
          <circle cx="173" cy="65" r="1.5" fill="currentColor" />
          {/* Corner arcs */}
          <path d="M2 2 Q8 2 8 8" stroke="currentColor" strokeWidth="1" />
          <path d="M198 2 Q192 2 192 8" stroke="currentColor" strokeWidth="1" />
          <path d="M2 128 Q8 128 8 122" stroke="currentColor" strokeWidth="1" />
          <path d="M198 128 Q192 128 192 122" stroke="currentColor" strokeWidth="1" />
        </>
      )}
    </svg>
  );
};

export default memo(PitchSVG);

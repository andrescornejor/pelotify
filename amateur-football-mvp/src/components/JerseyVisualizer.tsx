'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

export type JerseyPattern = 'solid' | 'vertical' | 'horizontal' | 'diagonal' | 'hoops' | 'gradient' | 'checkered';

interface JerseyVisualizerProps {
  primaryColor: string;
  secondaryColor: string;
  pattern: JerseyPattern;
  logoUrl?: string;
  className?: string;
  showShadow?: boolean;
}

export const JERSEY_PATTERNS: { id: JerseyPattern; label: string }[] = [
  { id: 'solid', label: 'Liso' },
  { id: 'vertical', label: 'Rayas Verticales' },
  { id: 'horizontal', label: 'Rayas Horizontales' },
  { id: 'diagonal', label: 'Rayas Diagonales' },
  { id: 'hoops', label: 'Aros' },
  { id: 'checkered', label: 'Cuadros' },
  { id: 'gradient', label: 'Degradado' },
];

export function JerseyVisualizer({
  primaryColor = '#18181b',
  secondaryColor = '#10b981',
  pattern = 'solid',
  logoUrl,
  className,
  showShadow = true,
}: JerseyVisualizerProps) {
  const renderPattern = () => {
    switch (pattern) {
      case 'vertical':
        return (
          <>
            <rect x="65" y="40" width="20" height="140" fill={secondaryColor} />
            <rect x="115" y="40" width="20" height="140" fill={secondaryColor} />
            <rect x="25" y="60" width="15" height="40" fill={secondaryColor} transform="rotate(-45 25 60)" />
            <rect x="160" y="60" width="15" height="40" fill={secondaryColor} transform="rotate(45 160 60)" />
          </>
        );
      case 'horizontal':
        return (
          <>
            <rect x="50" y="70" width="100" height="15" fill={secondaryColor} />
            <rect x="50" y="110" width="100" height="15" fill={secondaryColor} />
            <rect x="50" y="150" width="100" height="15" fill={secondaryColor} />
          </>
        );
      case 'diagonal':
        return (
          <g transform="rotate(-30 100 100)">
            <rect x="-50" y="40" width="300" height="15" fill={secondaryColor} />
            <rect x="-50" y="80" width="300" height="15" fill={secondaryColor} />
            <rect x="-50" y="120" width="300" height="15" fill={secondaryColor} />
            <rect x="-50" y="160" width="300" height="15" fill={secondaryColor} />
          </g>
        );
      case 'hoops':
        return (
          <>
            <rect x="50" y="60" width="100" height="30" fill={secondaryColor} />
            <rect x="50" y="120" width="100" height="30" fill={secondaryColor} />
          </>
        );
      case 'checkered':
        return (
          <mask id="jersey-mask">
             <path d="M50 40 C 80 20, 120 20, 150 40 L 190 80 L 170 100 L 150 80 L 150 180 L 50 180 L 50 80 L 30 100 L 10 80 Z" fill="white" />
          </mask>
        );
      case 'gradient':
        return (
          <defs>
            <linearGradient id="jersey-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        );
      default:
        return null;
    }
  };

  // Special handling for checkered and gradient which need to replace the base fill or use masks
  const baseFill = pattern === 'gradient' ? 'url(#jersey-grad)' : primaryColor;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('w-full h-full', showShadow && 'drop-shadow-2xl')}
      >
        <defs>
          <clipPath id="jersey-clip">
            <path d="M50 40 C 80 20, 120 20, 150 40 L 190 80 L 170 100 L 150 80 L 150 180 L 50 180 L 50 80 L 30 100 L 10 80 Z" />
          </clipPath>
          {pattern === 'gradient' && (
            <linearGradient id="jersey-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
            </linearGradient>
          )}
          {pattern === 'checkered' && (
            <pattern id="check-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="20" fill={secondaryColor} />
              <rect x="20" y="20" width="20" height="20" fill={secondaryColor} />
            </pattern>
          )}
        </defs>

        {/* Base Jersey Body */}
        <path
          d="M50 40 C 80 20, 120 20, 150 40 L 190 80 L 170 100 L 150 80 L 150 180 L 50 180 L 50 80 L 30 100 L 10 80 Z"
          fill={baseFill}
        />

        {/* Stripes / Pattern Layers - Clipped to jersey shape */}
        <g clipPath="url(#jersey-clip)">
          {pattern === 'checkered' && (
             <rect x="0" y="0" width="200" height="200" fill="url(#check-pattern)" />
          )}
          {renderPattern()}
        </g>

        {/* Collar & Details */}
        <path
          d="M80 22 C 90 35, 110 35, 120 22 C 110 15, 90 15, 80 22 Z"
          fill={secondaryColor}
        />
        
        {/* Sleeves Detail */}
        <path
          d="M30 100 L 10 80 L 50 40 C 55 35, 60 32, 65 30 L 50 80 Z"
          fill="black"
          opacity="0.05"
        />
        <path
          d="M170 100 L 190 80 L 150 40 C 145 35, 140 32, 135 30 L 150 80 Z"
          fill="black"
          opacity="0.05"
        />

        {/* Global Sheen / Highlight */}
        <linearGradient id="jersey-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.1 }} />
          <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
        </linearGradient>
        <path
          d="M50 40 C 80 20, 120 20, 150 40 L 190 80 L 170 100 L 150 80 L 150 180 L 50 180 L 50 80 L 30 100 L 10 80 Z"
          fill="url(#jersey-sheen)"
          pointerEvents="none"
        />

        {/* Center Chest (Logo Area) */}
        <g transform="translate(100, 85)">
            <defs>
                <clipPath id="logo-clip">
                  <path d="M0 -25 L 22 -12 L 22 12 L 0 25 L -22 12 L -22 -12 Z" />
                </clipPath>
            </defs>
            {logoUrl ? (
                <image
                href={logoUrl}
                x="-25"
                y="-25"
                width="50"
                height="50"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#logo-clip)"
                />
            ) : (
                <path
                d="M0 -20 L 18 -10 L 18 10 L 0 20 L -18 10 L -18 -10 Z"
                fill={secondaryColor}
                opacity="0.8"
                />
            )}
        </g>
      </svg>
    </div>
  );
}

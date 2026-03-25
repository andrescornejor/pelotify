'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceRadarProps {
  stats: {
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    phy: number;
  };
  size?: number;
}

export function PerformanceRadar({ stats, size = 300 }: PerformanceRadarProps) {
  const labels = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const data = [stats.pac, stats.sho, stats.pas, stats.dri, stats.def, stats.phy];
  const count = labels.length;
  const radius = size / 2 - 40;
  const centerX = size / 2;
  const centerY = size / 2;

  const getPoint = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const x = centerX + radius * (value / 100) * Math.cos(angle);
    const y = centerY + radius * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  const points = data.map((val, i) => getPoint(val, i));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
      {/* Background Rings */}
      <svg width={size} height={size} className="absolute inset-0 overflow-visible">
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="rgba(var(--foreground-rgb), 0.05)"
            strokeWidth="1"
            strokeDasharray={i === 4 ? "none" : "4 4"}
          />
        ))}

        {/* Axis Lines */}
        {labels.map((_, i) => {
          const p = getPoint(100, i);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={p.x}
              y2={p.y}
              stroke="rgba(var(--foreground-rgb), 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Shape */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
          animate={{ pathLength: 1, opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          d={pathData}
          fill="rgba(var(--primary-rgb), 0.15)"
          stroke="rgb(var(--primary-rgb))"
          strokeWidth="2.5"
          className="drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
        />

        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="rgb(var(--primary-rgb))"
            className="shadow-xl"
            style={{ filter: 'drop-shadow(0 0 5px rgba(var(--primary-rgb), 0.8))' }}
          />
        ))}
      </svg>

      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(115, i);
        return (
          <div
            key={label}
            className="absolute text-[10px] font-black text-foreground/40 tracking-[0.2em] group-hover:text-primary transition-colors"
            style={{
              left: p.x,
              top: p.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

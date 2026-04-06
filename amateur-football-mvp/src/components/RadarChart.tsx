import React from 'react';

export const RadarChart = ({ 
  stats, 
  size = 200, 
  color = "#facc15" // yellow-400 by default for Pro
}: { 
  stats: { pac: number, sho: number, pas: number, dri: number, def: number, phy: number },
  size?: number,
  color?: string
}) => {
  const statKeys: (keyof typeof stats)[] = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
  const labels = ['RIT', 'TIR', 'PAS', 'REG', 'DEF', 'FIS'];
  const center = size / 2;
  const radius = (size / 2) - 30; // Leave padding for labels

  // Calculate points
  const points = statKeys.map((key, i) => {
    const s = Math.max(0, Math.min(99, stats[key])) / 99;
    const angle = (Math.PI * 2 * i) / statKeys.length - Math.PI / 2;
    const r = s * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  });

  // Background grid
  const bgGrid = [0.2, 0.4, 0.6, 0.8, 1].map(level => {
    return statKeys.map((_, i) => {
      const angle = (Math.PI * 2 * i) / statKeys.length - Math.PI / 2;
      const r = level * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  return (
    <div className="relative flex items-center justify-center font-kanit" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Draw background octagons */}
        {bgGrid.map((pointsStr, i) => (
          <polygon 
            key={i} 
            points={pointsStr} 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="opacity-10" 
          />
        ))}

        {/* Draw axes */}
        {statKeys.map((_, i) => {
          const angle = (Math.PI * 2 * i) / statKeys.length - Math.PI / 2;
          return (
            <line 
              key={i} 
              x1={center} 
              y1={center} 
              x2={center + radius * Math.cos(angle)} 
              y2={center + radius * Math.sin(angle)} 
              stroke="currentColor" 
              strokeWidth="1" 
              className="opacity-10" 
            />
          );
        })}

        {/* Draw Data Polygon */}
        <polygon 
          points={points.join(' ')} 
          fill={color} 
          fillOpacity="0.4" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinejoin="round"
          className="transition-all duration-1000"
        />

        {/* Draw Labels */}
        {statKeys.map((key, i) => {
             const angle = (Math.PI * 2 * i) / statKeys.length - Math.PI / 2;
             // Calculate position outside radius
             const labelR = radius + 20; 
             const lx = center + labelR * Math.cos(angle);
             const ly = center + labelR * Math.sin(angle);
             
             return (
                 <text 
                    key={i} 
                    x={lx} 
                    y={ly} 
                    fill="currentColor" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-[10px] font-black uppercase opacity-60 pointer-events-none"
                 >
                    {labels[i]}
                 </text>
             );
        })}
      </svg>
    </div>
  );
};

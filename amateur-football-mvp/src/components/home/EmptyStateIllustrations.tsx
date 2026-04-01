'use client';

import { motion } from 'framer-motion';

// ─── CANCHA VACÍA CON NIEBLA (No hay partidos) ───
export const EmptyPitchIllustration = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 240 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Neon green glow filter */}
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="neonGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Fog gradient */}
      <linearGradient id="fogGrad" x1="0" y1="0.3" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="40%" stopColor="currentColor" stopOpacity="0.03" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
      </linearGradient>
    </defs>

    {/* Fog layers */}
    <motion.ellipse
      cx="120" cy="170" rx="140" ry="30"
      fill="rgba(44,252,125,0.04)"
      animate={{ rx: [140, 150, 140], opacity: [0.04, 0.07, 0.04] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.ellipse
      cx="80" cy="155" rx="100" ry="18"
      fill="rgba(44,252,125,0.03)"
      animate={{ rx: [100, 110, 100], cx: [80, 90, 80] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Pitch outline - perspective trapezoid */}
    <motion.path
      d="M40 160 L60 80 L180 80 L200 160 Z"
      stroke="rgba(44,252,125,0.35)"
      strokeWidth="1.5"
      fill="none"
      filter="url(#neonGlow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />

    {/* Center line */}
    <motion.line
      x1="50" y1="120" x2="190" y2="120"
      stroke="rgba(44,252,125,0.25)"
      strokeWidth="1"
      strokeDasharray="4 4"
      filter="url(#neonGlow)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    />

    {/* Center circle */}
    <motion.circle
      cx="120" cy="120" r="18"
      stroke="rgba(44,252,125,0.3)"
      strokeWidth="1"
      fill="none"
      filter="url(#neonGlow)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    />

    {/* Center dot */}
    <motion.circle
      cx="120" cy="120" r="2"
      fill="rgba(44,252,125,0.6)"
      filter="url(#neonGlowStrong)"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Goal areas */}
    <motion.path
      d="M95 80 L95 95 L145 95 L145 80"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    />
    <motion.path
      d="M82 160 L88 145 L152 145 L158 160"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    />

    {/* Corner arcs */}
    <motion.path
      d="M60 80 Q67 87 60 94"
      stroke="rgba(44,252,125,0.15)"
      strokeWidth="0.8"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    />
    <motion.path
      d="M180 80 Q173 87 180 94"
      stroke="rgba(44,252,125,0.15)"
      strokeWidth="0.8"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    />

    {/* Fog overlay drifting clouds */}
    <motion.ellipse
      cx="70" cy="130" rx="50" ry="12"
      fill="rgba(44,252,125,0.02)"
      animate={{ cx: [70, 160, 70], opacity: [0.02, 0.05, 0.02] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.ellipse
      cx="180" cy="110" rx="40" ry="10"
      fill="rgba(44,252,125,0.015)"
      animate={{ cx: [180, 90, 180], opacity: [0.015, 0.04, 0.015] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Abandoned ball - subtle */}
    <motion.circle
      cx="135" cy="135" r="4"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="0.8"
      fill="none"
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.path
      d="M133 133 L137 137 M133 137 L137 133"
      stroke="rgba(44,252,125,0.15)"
      strokeWidth="0.5"
      animate={{ opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
);

// ─── DOS SILUETAS SALUDÁNDOSE (No hay amigos) ───
export const FriendsIllustration = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 240 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <filter id="neonGlow2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="neonGlow2Strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Connection line between silhouettes  */}
    <motion.path
      d="M95 100 Q120 80 145 100"
      stroke="rgba(44,252,125,0.3)"
      strokeWidth="1"
      strokeDasharray="3 3"
      fill="none"
      filter="url(#neonGlow2)"
      animate={{ strokeDashoffset: [0, -12] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />

    {/* Sparkle at handshake point */}
    <motion.circle
      cx="120" cy="85"
      r="3"
      fill="rgba(44,252,125,0.5)"
      filter="url(#neonGlow2Strong)"
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Sparkle rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <motion.line
        key={angle}
        x1="120" y1="85"
        x2={120 + Math.cos((angle * Math.PI) / 180) * 8}
        y2={85 + Math.sin((angle * Math.PI) / 180) * 8}
        stroke="rgba(44,252,125,0.2)"
        strokeWidth="0.5"
        animate={{ opacity: [0, 0.4, 0], x2: [120 + Math.cos((angle * Math.PI) / 180) * 5, 120 + Math.cos((angle * Math.PI) / 180) * 12] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}

    {/* Left silhouette */}
    <g filter="url(#neonGlow2)">
      {/* Head */}
      <motion.circle
        cx="80" cy="95" r="12"
        stroke="rgba(44,252,125,0.4)"
        strokeWidth="1.5"
        fill="none"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      />
      {/* Body */}
      <motion.line
        x1="80" y1="107" x2="80" y2="145"
        stroke="rgba(44,252,125,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      {/* Right arm (waving/reaching) */}
      <motion.path
        d="M80 115 L95 100"
        stroke="rgba(44,252,125,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      {/* Left arm */}
      <motion.path
        d="M80 118 L65 130"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
      {/* Left leg */}
      <motion.line
        x1="80" y1="145" x2="68" y2="170"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      {/* Right leg */}
      <motion.line
        x1="80" y1="145" x2="92" y2="170"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      />
    </g>

    {/* Right silhouette */}
    <g filter="url(#neonGlow2)">
      {/* Head */}
      <motion.circle
        cx="160" cy="95" r="12"
        stroke="rgba(44,252,125,0.4)"
        strokeWidth="1.5"
        fill="none"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      />
      {/* Body */}
      <motion.line
        x1="160" y1="107" x2="160" y2="145"
        stroke="rgba(44,252,125,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      {/* Left arm (waving/reaching) */}
      <motion.path
        d="M160 115 L145 100"
        stroke="rgba(44,252,125,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      {/* Right arm */}
      <motion.path
        d="M160 118 L175 130"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
      {/* Left leg */}
      <motion.line
        x1="160" y1="145" x2="148" y2="170"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      {/* Right leg */}
      <motion.line
        x1="160" y1="145" x2="172" y2="170"
        stroke="rgba(44,252,125,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      />
    </g>

    {/* Ground line */}
    <motion.line
      x1="50" y1="172" x2="190" y2="172"
      stroke="rgba(44,252,125,0.1)"
      strokeWidth="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    />
  </svg>
);

// ─── CÁMARA CINEMATOGRÁFICA ESTILIZADA (No hay highlights) ───
export const CameraIllustration = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 240 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <filter id="neonGlow3" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="neonGlow3Strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Camera body */}
    <motion.rect
      x="70" y="85" width="100" height="65" rx="8"
      stroke="rgba(44,252,125,0.4)"
      strokeWidth="1.5"
      fill="none"
      filter="url(#neonGlow3)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />

    {/* Camera lens (main circle) */}
    <motion.circle
      cx="120" cy="117" r="22"
      stroke="rgba(44,252,125,0.35)"
      strokeWidth="1.5"
      fill="none"
      filter="url(#neonGlow3)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
    {/* Inner lens ring */}
    <motion.circle
      cx="120" cy="117" r="15"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      fill="none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    />
    {/* Lens center dot */}
    <motion.circle
      cx="120" cy="117" r="4"
      fill="rgba(44,252,125,0.3)"
      filter="url(#neonGlow3Strong)"
      animate={{ opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    />
    {/* Lens glint */}
    <motion.circle
      cx="112" cy="110" r="3"
      fill="rgba(44,252,125,0.15)"
      animate={{ opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />

    {/* Flash mount */}
    <motion.rect
      x="90" y="75" width="28" height="12" rx="3"
      stroke="rgba(44,252,125,0.25)"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    />

    {/* Film reel on top-right */}
    <motion.circle
      cx="155" cy="80" r="10"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    />
    <motion.circle
      cx="155" cy="80" r="3"
      stroke="rgba(44,252,125,0.15)"
      strokeWidth="0.8"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '155px 80px' }}
    />

    {/* Film strip decoration on side */}
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.rect
        key={i}
        x="172" y={88 + i * 12}
        width="8" height="8" rx="1"
        stroke="rgba(44,252,125,0.15)"
        strokeWidth="0.5"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}

    {/* Recording indicator */}
    <motion.circle
      cx="155" cy="92"
      r="3"
      fill="rgba(255,50,50,0.6)"
      filter="url(#neonGlow3)"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />

    {/* Tripod legs */}
    <motion.path
      d="M100 150 L80 185"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 1.5 }}
    />
    <motion.path
      d="M120 150 L120 185"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 1.6 }}
    />
    <motion.path
      d="M140 150 L160 185"
      stroke="rgba(44,252,125,0.2)"
      strokeWidth="1"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 1.7 }}
    />

    {/* Light beam coming from lens */}
    <motion.path
      d="M98 117 L40 90 L40 144 Z"
      fill="rgba(44,252,125,0.02)"
      stroke="rgba(44,252,125,0.08)"
      strokeWidth="0.5"
      animate={{ opacity: [0.02, 0.06, 0.02] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
);

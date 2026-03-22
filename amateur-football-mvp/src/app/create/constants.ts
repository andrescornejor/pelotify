export const FORMAT_DATA = {
  F5: {
    label: 'Fútbol 5',
    players: '5 vs 5',
    emoji: '⚽',
    desc: 'Velocidad y precisión',
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/30',
  },
  F7: {
    label: 'Fútbol 7',
    players: '7 vs 7',
    emoji: '🏟️',
    desc: 'Equilibrio y táctica',
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/30',
  },
  F11: {
    label: 'Fútbol 11',
    players: '11 vs 11',
    emoji: '🏆',
    desc: 'El clásico completo',
    color: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/30',
  },
} as const;

export type MatchFormat = keyof typeof FORMAT_DATA;

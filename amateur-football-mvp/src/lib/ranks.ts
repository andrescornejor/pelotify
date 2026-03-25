export type RankName =
  | 'HIERRO'
  | 'BRONCE'
  | 'PLATA'
  | 'ORO'
  | 'PLATINO'
  | 'DIAMANTE'
  | 'ELITE'
  | 'MAESTRO'
  | 'PELOTIFY';

export interface RankInfo {
  name: RankName;
  color: string;
  minElo: number;
}

export const RANKS: RankInfo[] = [
  { name: 'HIERRO', color: '#94a3b8', minElo: 0 },
  { name: 'BRONCE', color: '#d97706', minElo: 500 },
  { name: 'PLATA', color: '#94a3b8', minElo: 1000 },
  { name: 'ORO', color: '#fbbf24', minElo: 1500 },
  { name: 'PLATINO', color: '#2dd4bf', minElo: 2000 },
  { name: 'DIAMANTE', color: '#3b82f6', minElo: 2500 },
  { name: 'ELITE', color: '#8b5cf6', minElo: 3000 },
  { name: 'MAESTRO', color: '#f43f5e', minElo: 3500 },
  { name: 'PELOTIFY', color: '#2cfc7d', minElo: 4000 },
];

export function getRankByElo(elo: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

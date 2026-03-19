export type RankName = 'HIERRO' | 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO' | 'DIAMANTE' | 'ELITE' | 'LEYENDA';

export interface RankInfo {
    name: RankName;
    color: string;
    minElo: number;
}

export const RANKS: RankInfo[] = [
    { name: 'HIERRO', color: '#64748b', minElo: 0 },
    { name: 'BRONCE', color: '#92400e', minElo: 1000 },
    { name: 'PLATA', color: '#94a3b8', minElo: 3000 },
    { name: 'ORO', color: '#ca8a04', minElo: 6000 },
    { name: 'PLATINO', color: '#0ea5e9', minElo: 10000 },
    { name: 'DIAMANTE', color: '#22d3ee', minElo: 16000 },
    { name: 'ELITE', color: '#10b981', minElo: 25000 },
    { name: 'LEYENDA', color: '#f59e0b', minElo: 40000 },
];

export function getRankByElo(elo: number): RankInfo {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (elo >= RANKS[i].minElo) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

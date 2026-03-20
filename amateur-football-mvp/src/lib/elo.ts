// src/lib/elo.ts

export const POINTS_PER_GOAL = 100;
export const POINTS_PER_MVP = 200;
export const FIRST_WIN_BONUS = 1000;
export const WIN_BONUS = 150;
export const DRAW_BONUS = 50;
export const LOSS_PENALTY = -150;

/**
 * Calculates a player's points gained in a match.
 * @param currentElo Player's current overall points/ELO.
 * @param matchResult 'win' | 'draw' | 'loss'
 * @param goals Number of goals scored by the player.
 * @param isMvp true if the player was the MVP.
 * @param isFirstWin true if this is the player's first registered win.
 */
export function calculateMatchPoints(
    currentElo: number,
    matchResult: 'win' | 'draw' | 'loss',
    goals: number,
    isMvp: boolean,
    isFirstWin: boolean = false
) {
    let gainedPoints = 0;

    // 1. Goal Points
    gainedPoints += goals * POINTS_PER_GOAL;

    // 2. MVP Points
    if (isMvp) {
        gainedPoints += POINTS_PER_MVP;
    }

    // 3. Match Result Points
    if (matchResult === 'win') {
        if (isFirstWin) {
            gainedPoints += FIRST_WIN_BONUS;
        } else {
            gainedPoints += WIN_BONUS;
        }
    } else if (matchResult === 'draw') {
        gainedPoints += DRAW_BONUS;
    } else if (matchResult === 'loss') {
        gainedPoints += LOSS_PENALTY;
    }

    const newElo = currentElo + gainedPoints;

    return {
        gainedPoints,
        newElo: Math.max(0, newElo)
    };
}

/**
 * Updates individual sub-stats slightly based on star feedback.
 * For the demo, high ratings might boost random stats, low ratings might drop them.
 */
export function updateStatsBasedOnPerformance(
    currentStats: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number },
    averageStarsReceived: number
) {
    const newStats = { ...currentStats };
    const statKeys = Object.keys(currentStats) as (keyof typeof currentStats)[];

    // Pick a random stat to upgrade/downgrade to simulate targeted feedback
    const randomStat = statKeys[Math.floor(Math.random() * statKeys.length)];

    if (averageStarsReceived >= 4.5) {
        // Exceptional performance: +1 to a random stat
        newStats[randomStat] = Math.min(99, newStats[randomStat] + 1);
    } else if (averageStarsReceived <= 2) {
        // Poor performance: -1 to a random stat
        newStats[randomStat] = Math.max(1, newStats[randomStat] - 1);
    }

    return newStats;
}

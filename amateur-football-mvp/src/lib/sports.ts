import type { Match } from './matches';

export type Sport = 'football' | 'padel' | 'basket';
export type MatchFormat = 'F5' | 'F7' | 'F11' | 'PADEL' | 'BASKET';

type SportMeta = {
  key: Sport;
  label: string;
  shortLabel: string;
  icon: string;
  headline: string;
  description: string;
  heroImage: string;
};

type FormatMeta = {
  key: MatchFormat;
  sport: Sport;
  label: string;
  playersLabel: string;
  description: string;
  totalPlayers: number;
  teamSize: number;
  color: string;
  glow: string;
};

export const SPORT_META: Record<Sport, SportMeta> = {
  football: {
    key: 'football',
    label: 'Futbol',
    shortLabel: 'Futbol',
    icon: '\u26BD',
    headline: 'La casa del futbol amateur',
    description: 'Pelotify sigue poniendo al futbol al frente, con nuevos deportes como opcion.',
    heroImage:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1600',
  },
  padel: {
    key: 'padel',
    label: 'Padel',
    shortLabel: 'Padel',
    icon: '\u{1F3BE}',
    headline: 'Partidos rapidos en pareja',
    description: 'Organiza, completa y entra a partidos de padel sin salir de Pelotify.',
    heroImage:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431f1?auto=format&fit=crop&q=80&w=1600',
  },
  basket: {
    key: 'basket',
    label: 'Basket',
    shortLabel: 'Basket',
    icon: '\u{1F3C0}',
    headline: 'Sumate a una cancha de basket',
    description: 'Abre cupos y arma equipos para jugar basket con la misma dinamica social.',
    heroImage:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1600',
  },
};

export const FORMAT_META: Record<MatchFormat, FormatMeta> = {
  F5: {
    key: 'F5',
    sport: 'football',
    label: 'Futbol 5',
    playersLabel: '5 vs 5',
    description: 'Velocidad y precision',
    totalPlayers: 10,
    teamSize: 5,
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/30',
  },
  F7: {
    key: 'F7',
    sport: 'football',
    label: 'Futbol 7',
    playersLabel: '7 vs 7',
    description: 'Equilibrio y tactica',
    totalPlayers: 14,
    teamSize: 7,
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/30',
  },
  F11: {
    key: 'F11',
    sport: 'football',
    label: 'Futbol 11',
    playersLabel: '11 vs 11',
    description: 'El clasico completo',
    totalPlayers: 22,
    teamSize: 11,
    color: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/30',
  },
  PADEL: {
    key: 'PADEL',
    sport: 'padel',
    label: 'Padel',
    playersLabel: '2 vs 2',
    description: 'Duplas, paredes y ritmo alto',
    totalPlayers: 4,
    teamSize: 2,
    color: 'from-cyan-500 to-sky-400',
    glow: 'shadow-cyan-500/30',
  },
  BASKET: {
    key: 'BASKET',
    sport: 'basket',
    label: 'Basket',
    playersLabel: '5 vs 5',
    description: 'Transiciones rapidas y juego colectivo',
    totalPlayers: 10,
    teamSize: 5,
    color: 'from-orange-500 to-amber-400',
    glow: 'shadow-orange-500/30',
  },
};

export const SPORT_FORMATS: Record<Sport, MatchFormat[]> = {
  football: ['F5', 'F7', 'F11'],
  padel: ['PADEL'],
  basket: ['BASKET'],
};

export function getSportLabel(sport: Sport | undefined) {
  return SPORT_META[sport || 'football'].label;
}

export function inferSportFromType(type?: string | null): Sport {
  if (type === 'PADEL') return 'padel';
  if (type === 'BASKET') return 'basket';
  return 'football';
}

export function getMatchSport(match?: Partial<Match> | null): Sport {
  if (match?.sport) return match.sport;
  return inferSportFromType(match?.type);
}

export function getFormatMeta(type?: string | null, sport?: Sport) {
  if (type && type in FORMAT_META) {
    return FORMAT_META[type as MatchFormat];
  }

  const fallbackSport = sport || 'football';
  const fallbackType = SPORT_FORMATS[fallbackSport][0];
  return FORMAT_META[fallbackType];
}

export function getMaxPlayers(matchOrType?: Partial<Match> | MatchFormat | null, sport?: Sport) {
  if (!matchOrType) return 10;

  if (typeof matchOrType === 'string') {
    return getFormatMeta(matchOrType, sport).totalPlayers;
  }

  return getFormatMeta(matchOrType.type, getMatchSport(matchOrType)).totalPlayers;
}

export function getTeamSize(matchOrType?: Partial<Match> | MatchFormat | null, sport?: Sport) {
  if (!matchOrType) return 5;

  if (typeof matchOrType === 'string') {
    return getFormatMeta(matchOrType, sport).teamSize;
  }

  return getFormatMeta(matchOrType.type, getMatchSport(matchOrType)).teamSize;
}

export function getSportFormats(sport: Sport) {
  return SPORT_FORMATS[sport].map((format) => FORMAT_META[format]);
}

export function getMatchDisplayTitle(match?: Partial<Match> | null) {
  const sport = getMatchSport(match);
  const format = getFormatMeta(match?.type, sport);
  return `${SPORT_META[sport].icon} ${format.label}`;
}

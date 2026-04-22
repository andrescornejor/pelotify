import type { MatchFormat, Sport } from './sports';
import { inferSportFromType } from './sports';

export interface VenueFormat {
  type: MatchFormat;
  pricePerPlayer: number;
}

export interface Venue {
  id: string;
  name: string;
  displayName?: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  mapQuery?: string;
  aliases?: string[];
  formats?: VenueFormat[];
}

export const ROSARIO_VENUES: Venue[] = [
  {
    id: 'adiur',
    name: 'ADIUR Agrupacion Deportiva Infantil Union Rosario',
    displayName: 'ADIUR',
    address: 'Av. Alberdi 30 Bis, Rosario',
    city: 'Rosario',
    mapQuery: 'ADIUR Agrupacion Deportiva Infantil Union Rosario',
    lat: -32.92991583849577,
    lng: -60.67460062260593,
    aliases: ['adiur', 'alberdi', 'mongsfeld'],
    formats: [
      { type: 'F7', pricePerPlayer: 6500 },
      { type: 'F11', pricePerPlayer: 7500 },
    ],
  },
  {
    id: 'olimpicus',
    name: 'Olimpicus',
    displayName: 'Olimpicus',
    address: 'Tucuman 3140, Rosario',
    city: 'Rosario',
    mapQuery: 'Olimpicus Rosario Tucuman',
    lat: -32.937213,
    lng: -60.655214,
    aliases: ['olimpicus'],
    formats: [{ type: 'F5', pricePerPlayer: 7000 }],
  },
  {
    id: 'el-ovalo',
    name: 'El Ovalo Sports',
    displayName: 'El Ovalo',
    address: 'Av. Dante Alighieri 2485, Rosario',
    city: 'Rosario',
    mapQuery: 'El Ovalo Sports Rosario',
    lat: -32.962106518121615,
    lng: -60.661848158713866,
    aliases: ['ovalo', 'hipodromo', 'hipodromo independencia'],
    formats: [
      { type: 'F5', pricePerPlayer: 6500 },
      { type: 'F7', pricePerPlayer: 8000 },
      { type: 'F11', pricePerPlayer: 9000 },
    ],
  },
  {
    id: 'la-cancha',
    name: 'La Cancha',
    displayName: 'La Cancha',
    address: 'Espana 1855, Rosario',
    city: 'Rosario',
    mapQuery: 'Stadium Futbol 5 Rosario',
    lat: -32.9463,
    lng: -60.6521,
    aliases: ['la cancha', 'stadium'],
    formats: [{ type: 'F5', pricePerPlayer: 7000 }],
  },
];

export const normalizeVenueString = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function getVenueSports(venue: Venue): Sport[] {
  const sports = new Set<Sport>();
  (venue.formats || []).forEach((format) => {
    sports.add(inferSportFromType(format.type));
  });
  return Array.from(sports);
}

export function venueSupportsSport(venue: Venue, sport: Sport) {
  return getVenueSports(venue).includes(sport);
}

export const findVenueByLocation = (location: string): Venue | undefined => {
  if (!location) return undefined;
  const loc = normalizeVenueString(location);

  return ROSARIO_VENUES.find((v) => {
    const vName = normalizeVenueString(v.name);
    const vAddr = normalizeVenueString(v.address);

    if (loc === vName || loc === vAddr) return true;
    if (vName.includes(loc) || loc.includes(vName)) return true;

    if (
      v.aliases?.some((alias) => {
        const normalizedAlias = normalizeVenueString(alias);
        return loc.includes(normalizedAlias) || normalizedAlias.includes(loc);
      })
    ) {
      return true;
    }

    const vAddrShort = normalizeVenueString(v.address.split(',')[0]);
    if (loc.includes(vAddrShort) || vAddrShort.includes(loc)) return true;

    return false;
  });
};

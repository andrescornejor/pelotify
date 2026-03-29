export type MatchFormat = 'F5' | 'F7' | 'F11';

export interface VenueFormat {
  type: MatchFormat;
  pricePerPlayer: number;
}

export interface Venue {
  id: string;
  name: string;
  displayName?: string; // Concise name for UI (e.g. 'ADIUR' instead of full name)
  address: string;
  city: string;
  lat: number;
  lng: number;
  mapQuery?: string; // override for Google Maps search
  aliases?: string[]; // alternative names like 'Hipódromo'
  formats?: VenueFormat[];
}

export const ROSARIO_VENUES: Venue[] = [
  {
    id: 'adiur',
    name: 'ADIUR Agrupación Deportiva Infantil Unión Rosario',
    displayName: 'ADIUR',
    address: 'Av. Alberdi 30 Bis, Rosario',
    city: 'Rosario',
    mapQuery: 'ADIUR Agrupación Deportiva Infantil Unión Rosario',
    lat: -32.92991583849577,
    lng: -60.67460062260593,
    aliases: ['adiur', 'alberdi', 'mongsfeld'],
    formats: [
      { type: 'F7', pricePerPlayer: 6500 },
      { type: 'F11', pricePerPlayer: 7500 }
    ],
  },
  {
    id: 'olimpicus',
    name: 'Olimpicus',
    displayName: 'Olimpicus',
    address: 'Tucumán 3140, Rosario',
    city: 'Rosario',
    mapQuery: 'Olimpicus Rosario Tucumán',
    lat: -32.937213,
    lng: -60.655214,
    aliases: ['olimpicus'],
    formats: [
      { type: 'F5', pricePerPlayer: 7000 }
    ],
  },
  {
    id: 'el-ovalo',
    name: 'El Óvalo Sports',
    displayName: 'El Óvalo',
    address: 'Av. Dante Alighieri 2485, Rosario',
    city: 'Rosario',
    mapQuery: 'El Óvalo Sports Rosario',
    lat: -32.962106518121615,
    lng: -60.661848158713866,
    aliases: ['ovalo', 'hipodromo', 'hipódromo', 'hipodromo independencia'],
    formats: [
      { type: 'F5', pricePerPlayer: 6500 },
      { type: 'F7', pricePerPlayer: 8000 },
      { type: 'F11', pricePerPlayer: 9000 }
    ],
  },
  {
    id: 'la-cancha',
    name: 'La Cancha',
    displayName: 'La Cancha',
    address: 'España 1855, Rosario',
    city: 'Rosario',
    mapQuery: 'Stadium Fútbol 5 Rosario',
    lat: -32.9463,
    lng: -60.6521,
    aliases: ['la cancha', 'stadium'],
    formats: [
      { type: 'F5', pricePerPlayer: 7000 }
    ],
  },
];

// Helper to normalize strings for comparison
export const normalizeVenueString = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Centralized lookup helper
export const findVenueByLocation = (location: string): Venue | undefined => {
  if (!location) return undefined;
  const loc = normalizeVenueString(location);

  return ROSARIO_VENUES.find((v) => {
    const vName = normalizeVenueString(v.name);
    const vAddr = normalizeVenueString(v.address);

    // Exact matches
    if (loc === vName || loc === vAddr) return true;

    // Name-based partial matches
    if (vName.includes(loc) || loc.includes(vName)) return true;

    // Alias-based matches
    if (
      v.aliases?.some((alias) => {
        const normalizedAlias = normalizeVenueString(alias);
        return loc.includes(normalizedAlias) || normalizedAlias.includes(loc);
      })
    )
      return true;

    // Street-based matches (fallback)
    const vAddrShort = normalizeVenueString(v.address.split(',')[0]);
    if (loc.includes(vAddrShort) || vAddrShort.includes(loc)) return true;

    return false;
  });
};

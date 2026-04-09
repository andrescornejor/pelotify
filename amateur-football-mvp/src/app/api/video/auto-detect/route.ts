import { NextResponse } from 'next/server';
import axios from 'axios';

// This is a mapping of Pelotify venue names/IDs to Sportsreel Establishment IDs
const VENUE_MAPPING: Record<string, number> = {
  'olimpicus 1': 71,
  'olimpicus 2': 75,
  'olimpicus 3': 65,
  'el ovalo': 86,
  'óvalo': 86,
};

export async function POST(request: Request) {
  try {
    const { matchId, location, date, time } = await request.json();

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // 1. Find the Sportsreel EID
    const normalizedLoc = location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const eid = Object.entries(VENUE_MAPPING).find(([key]) => normalizedLoc.includes(key))?.[1];

    if (!eid) {
      return NextResponse.json({ error: 'Sede no mapeada con Sportsreel' }, { status: 404 });
    }

    // 2. Attempt to find the match video
    // Since Sportsreel doesn't have a simple listing API we can find yet,
    // we'll use a helper that returns the URL to the venue's profile
    // OR we try to fetch the latest highlight which might link back to the match
    const profileUrl = `https://www.sportsreel.com.ar/#/establecimiento/${eid}`;
    
    // We search for recent recordings via the proxy if we have the detail
    // For now, we provide the assistant link
    return NextResponse.json({ 
      eid, 
      profileUrl,
      suggestion: `Hemos detectado que esta cancha tiene Sportsreel. Puedes buscar el video en su perfil.`,
      found: false // We set to false because we didn't find the specific UUID yet
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

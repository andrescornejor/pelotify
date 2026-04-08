import { Metadata, ResolvingMetadata } from 'next';
import { getMatchById } from '@/lib/matches';
import MatchPage from './MatchLobby';

interface Props {
  searchParams: { id?: string };
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = searchParams.id;
  
  if (!id) return {};

  try {
    const match = await getMatchById(id);
    if (!match) return {};

    const date = new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    
    const title = `⚽ Partido en ${match.location}`;
    const description = `¡Sumate a este ${match.type}! 📅 ${date} a las ${match.time} HS. Cupos disponibles.`;
    
    // Using a default football image if no field image
    const image = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200';

    return {
      title: `${title} | Pelotify`,
      description,
      openGraph: {
        title,
        description,
        images: [image],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: 'Pelotify - Fútbol Amateur',
    };
  }
}

export default function Page() {
  return <MatchPage />;
}

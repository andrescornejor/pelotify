import { Metadata, ResolvingMetadata } from 'next';
import { getMatchById } from '@/lib/matches';
import MatchPage from './MatchLobby';
import { getFormatMeta, getMatchSport, SPORT_META } from '@/lib/sports';

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

    const sport = getMatchSport(match);
    const format = getFormatMeta(match.type, sport);
    const date = new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const title = `${SPORT_META[sport].icon} ${SPORT_META[sport].label} en ${match.location}`;
    const description = `Sumate a este ${format.label}. ${date} a las ${match.time} HS. Cupos disponibles.`;
    const image = SPORT_META[sport].heroImage;

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
      title: 'Pelotify - Futbol Amateur',
    };
  }
}

export default function Page() {
  return <MatchPage />;
}

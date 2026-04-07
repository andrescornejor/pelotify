import VideoFeed from '@/components/VideoFeed';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const v = searchParams.v;
  
  if (v && typeof v === 'string') {
    const { data } = await supabase
      .from('highlights')
      .select('description, thumbnail_url, profiles(name)')
      .eq('id', v)
      .single();

    if (data) {
      const username = data.profiles?.name || 'crack_anonimo';
      const description = data.description || '¡Mirá esta tremenda jugada en Pelotify!';
      const title = `FutTok de @${username} en Pelotify`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: data.thumbnail_url ? [data.thumbnail_url] : [],
          type: 'video.other',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: data.thumbnail_url ? [data.thumbnail_url] : [],
        },
      };
    }
  }

  return {
    title: 'Highlights | Pelotify',
    description: 'Mira las mejores jugadas del fútbol amateur en Pelotify.',
  };
}

export default function HighlightsPage() {
  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      <VideoFeed />
    </main>
  );
}

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
      const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const username = (p as any)?.name || 'crack_anonimo';
      let description = data.description || '¡Mirá esta tremenda jugada en Pelotify!';
      if (description.length < 60) {
        description = `${description} | Unite a la comunidad de fútbol amateur de Pelotify. Mirá más highlights como este.`;
      }
      
      const title = `FutTok de @${username} en Pelotify`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pelotify.vercel.app';
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}&type=highlight${data.thumbnail_url ? `&image=${encodeURIComponent(data.thumbnail_url)}` : ''}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/highlights?v=${v}`,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            }
          ],
          type: 'video.other',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
          creator: '@pelotify',
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

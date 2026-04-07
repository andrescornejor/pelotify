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
      const baseUrl = 'https://pelotify.vercel.app';
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}&type=highlight${data.thumbnail_url ? `&image=${encodeURIComponent(data.thumbnail_url)}` : ''}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/highlights?v=${v}`,
          images: [{ url: ogImage }],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
        },
        // Forced RAW metadata to match your request 100%
        other: {
          'og:type': 'website',
          'og:url': `${baseUrl}/highlights?v=${v}`,
          'og:title': title,
          'og:description': description,
          'og:image': ogImage,
          'twitter:card': 'summary_large_image',
          'twitter:title': title,
          'twitter:description': description,
          'twitter:image': ogImage,
        }
      };
    }
  }

  return {
    title: 'Highlights | Pelotify',
    description: 'Mira las mejores jugadas del fútbol amateur en Pelotify.',
    other: {
      'og:image': 'https://pelotify.vercel.app/icon.png',
      'twitter:image': 'https://pelotify.vercel.app/icon.png',
    }
  };
}

export default function HighlightsPage() {
  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      <VideoFeed />
    </main>
  );
}

import VideoFeed from '@/components/VideoFeed';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

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
      const testImage = data.thumbnail_url || 'https://pelotify.vercel.app/icon.png';

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/highlights?v=${v}`,
          siteName: 'Pelotify',
          images: [testImage],
          type: 'video.other',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [testImage],
          site: '@pelotify',
          creator: '@pelotify',
        },
        other: {
          'twitter:image': testImage,
          'twitter:card': 'summary_large_image',
        }
      };
    }
  }

  return {
    title: 'Highlights | Pelotify',
    description: 'Mira las mejores jugadas del fútbol amateur en Pelotify.',
    openGraph: {
      images: ['https://pelotify.vercel.app/icon.png'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['https://pelotify.vercel.app/icon.png'],
    }
  };
}

export default function HighlightsPage() {
  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-black"><div className="w-10 h-10 border-t-2 border-primary animate-spin rounded-full" /></div>}>
        <VideoFeed />
      </Suspense>
    </main>
  );
}

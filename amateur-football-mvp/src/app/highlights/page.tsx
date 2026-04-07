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
      .from('match_highlights')
      .select('description, thumbnail_url, video_url, profiles:user_id(name)')
      .eq('id', v)
      .single();

    if (data) {
      const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const username = ((p as any)?.name as string) || 'crack_anonimo';
      let description = (data.description as string) || '¡Mirá esta tremenda jugada en Pelotify!';
      if (description.length < 60) {
        description = `${description} | Unite a la comunidad de fútbol amateur de Pelotify. Mirá más highlights como este.`;
      }
      
      const title = `FutTok de @${username} en Pelotify`;
      const baseUrl = 'https://pelotify.vercel.app';
      const testImage = (data.thumbnail_url as string) || 'https://pelotify.vercel.app/icon.png';
      const videoUrl = data.video_url as string;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/highlights?v=${v}`,
          siteName: 'Pelotify',
          images: [testImage],
          videos: [
            {
              url: videoUrl,
              width: 720,
              height: 1280,
              type: 'video/mp4',
            },
          ],
          type: 'video.other',
        },
        twitter: {
          card: 'player',
          title,
          description,
          images: [testImage],
          site: '@pelotify',
          creator: '@pelotify',
          players: [
            {
              playerUrl: `${baseUrl}/highlights?v=${v}`,
              streamUrl: videoUrl,
              width: 720,
              height: 1280,
            }
          ]
        },
        other: {
          'twitter:image': testImage,
          'twitter:card': 'player',
          'twitter:player': `${baseUrl}/highlights?v=${v}`,
          'twitter:player:width': '720',
          'twitter:player:height': '1280',
          'og:video': videoUrl,
          'og:video:secure_url': videoUrl,
          'og:video:type': 'video/mp4',
          'og:video:width': '720',
          'og:video:height': '1280',
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

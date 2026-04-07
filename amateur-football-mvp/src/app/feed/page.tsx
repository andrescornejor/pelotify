import FeedClient from './FeedClient';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const postId = resolvedParams.post;
  
  if (postId && typeof postId === 'string') {
    const { data } = await supabase
      .from('posts')
      .select('content, image_url, profiles(name)')
      .eq('id', postId)
      .single();

    if (data) {
      const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const username = (p as any)?.name || 'Usuario Básico';
      const title = `Post de ${username} en Pelotify`;
      let description = data.content ? (data.content.slice(0, 150) + (data.content.length > 150 ? '...' : '')) : 'Mira esta publicación en Pelotify.';
      if (description.length < 60) {
        description = `${description} | Unite a Pelotify y conectá con el fútbol amateur como nunca antes. ¡Seguinos!`;
      }

      const baseUrl = 'https://pelotify.vercel.app';
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(username)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}${data.image_url ? `&image=${encodeURIComponent(data.image_url)}` : ''}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/feed?post=${postId}`,
          siteName: 'Pelotify',
          images: [ogImage],
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
          creator: '@pelotify',
        },
        other: {
          'twitter:image': ogImage,
          'twitter:card': 'summary_large_image',
          'og:image:width': '1200',
          'og:image:height': '630',
        }
      };
    }
  }

  return {
    title: 'Muro Social | Pelotify',
    description: 'El lugar donde el fútbol amateur se conecta. Comparte posts, fotos y debate.',
    openGraph: {
      images: ['https://pelotify.vercel.app/icon.png'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['https://pelotify.vercel.app/icon.png'],
    }
  };
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-primary animate-spin rounded-full" /></div>}>
      <FeedClient />
    </Suspense>
  );
}

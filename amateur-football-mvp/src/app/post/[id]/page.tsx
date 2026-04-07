import FeedClient from '@/app/feed/FeedClient';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: postId } = await params;
  
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
          url: `${baseUrl}/post/${postId}`,
          siteName: 'Pelotify',
          images: [ogImage], // Simplified to string array
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
          creator: '@pelotify',
        },
        // Force tags that Next.js might be handling differently
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
    title: 'Post | Pelotify',
    description: 'El lugar donde el fútbol amateur se conecta.',
    openGraph: {
      images: ['https://pelotify.vercel.app/icon.png'],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['https://pelotify.vercel.app/icon.png'],
    }
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return <FeedClient standalonePostId={id} />;
}

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
      const description = data.content ? (data.content.slice(0, 150) + (data.content.length > 150 ? '...' : '')) : 'Mira esta publicación en Pelotify.';

      const ogImage = `/api/og?title=${encodeURIComponent(username)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}${data.image_url ? `&image=${encodeURIComponent(data.image_url)}` : ''}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [ogImage],
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
        },
      };
    }
  }

  return {
    title: 'Post | Pelotify',
    description: 'El lugar donde el fútbol amateur se conecta.',
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return <FeedClient standalonePostId={id} />;
}

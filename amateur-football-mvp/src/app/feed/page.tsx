import FeedClient from './FeedClient';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const postId = searchParams.post;
  
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

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: data.image_url ? [data.image_url] : [],
          type: 'article',
        },
        twitter: {
          card: data.image_url ? 'summary_large_image' : 'summary',
          title,
          description,
          images: data.image_url ? [data.image_url] : [],
        },
      };
    }
  }

  return {
    title: 'Muro Social | Pelotify',
    description: 'El lugar donde el fútbol amateur se conecta. Comparte posts, fotos y debate.',
  };
}

export default function FeedPage() {
  return <FeedClient />;
}

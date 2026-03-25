import VideoFeed from '@/components/VideoFeed';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Highlights | Pelotify',
  description: 'Mira las mejores jugadas del fútbol amateur en Pelotify.',
};

export default function HighlightsPage() {
  return (
    <main className="h-[100dvh] w-full bg-black overflow-hidden">
      <VideoFeed />
    </main>
  );
}

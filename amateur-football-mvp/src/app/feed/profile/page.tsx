import FeedProfileClient from './FeedProfileClient';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Perfil | 3erTiempo - Pelotify',
  description: 'Mira los posts, me gusta y actividad de este jugador en el 3erTiempo de Pelotify.',
};

export default function FeedProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-primary animate-spin rounded-full" /></div>}>
      <FeedProfileClient />
    </Suspense>
  );
}

import { Kanit, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryProvider } from '@/providers/QueryProvider';
import ClientLayout from '@/components/layout/ClientLayout';
import PostMatchManager from '@/components/PostMatchManager';
import PWARegistration from '@/components/PWARegistration';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-kanit',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://pelotify.vercel.app'),
  title: 'Pelotify - Fútbol Amateur',
  description: 'Gestiona tus partidos de fútbol amateur. Crea tu carta FIFA y sube de nivel.',
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192' }, { url: '/icon-512.png', sizes: '512x512' }],
    apple: [{ url: '/icon-512.png', sizes: '512x512' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Pelotify',
    title: 'Pelotify - Fútbol Amateur',
    description: 'Gestiona tus partidos de fútbol amateur. Crea tu carta FIFA y sube de nivel.',
    images: ['/icon-512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pelotify',
    creator: '@pelotify',
    title: 'Pelotify - Fútbol Amateur',
    description: 'Gestiona tus partidos de fútbol amateur. Crea tu carta FIFA y sube de nivel.',
    images: ['/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pelotify',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

import type { Metadata } from 'next';
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${kanit.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-[100dvh] flex flex-col selection:bg-primary/30 relative`}
      >
        {/* Global Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
        
        <QueryProvider>
          <SettingsProvider>
            <ThemeProvider>
              <AuthProvider>
                <SidebarProvider>
                  <ClientLayout>
                    <PWARegistration />
                    {children}
                    <PostMatchManager />
                  </ClientLayout>
                </SidebarProvider>
              </AuthProvider>
            </ThemeProvider>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

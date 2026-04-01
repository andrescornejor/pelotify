import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Pelotify - Fútbol Amateur',
  description: 'Gestiona tus partidos de fútbol amateur. Crea tu carta FIFA y sube de nivel.',
  icons: {
    icon: [{ url: '/icon.png' }, { url: '/logo_pelotify.png' }],
    apple: '/logo_pelotify.png',
  },
  manifest: '/manifest.json',
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

import { SettingsProvider } from '@/contexts/SettingsContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body
        className={`${kanit.variable} font-sans antialiased bg-background text-foreground min-h-[100dvh] flex flex-col selection:bg-primary/30`}
      >
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

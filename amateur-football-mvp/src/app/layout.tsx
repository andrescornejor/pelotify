import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientLayout from '@/components/layout/ClientLayout';
import PostMatchManager from '@/components/PostMatchManager';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Pelotify - Fútbol Amateur',
  description: 'Gestiona tus partidos de fútbol amateur. Crea tu carta FIFA y sube de nivel.',
  icons: {
    icon: '/logo_pelotify.png',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-[100dvh] flex flex-col selection:bg-primary/30`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <ClientLayout>
                {children}
                <PostMatchManager />
              </ClientLayout>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Host_Grotesk, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeColor } from '@/components/theme-color';
import { THEME_COLORS } from '@/lib/theme-colors';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getConfig } from '@/lib/config-loader';
import { absoluteUrl, pageOpenGraph, pageTwitter, SEO_DESCRIPTION, SEO_TITLE, SITE_URL } from '@/lib/site';
import './globals.css';

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-host',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const { personal } = getConfig();

// Shared by every page. Canonical URLs, Open Graph and JSON-LD are set per page:
// a canonical here would be inherited by every page and point them all at home.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: `%s · ${personal.name}`,
  },
  description: SEO_DESCRIPTION,
  authors: [{ name: personal.name, url: absoluteUrl('/') }],
  creator: personal.name,
  publisher: personal.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: pageOpenGraph({ path: '/' }),
  twitter: pageTwitter(),
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Keep the composer above the on-screen keyboard. Pinch-zoom stays available.
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
  // The site's default theme. ThemeColor keeps it in step when the visitor switches.
  themeColor: THEME_COLORS.light,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-type="software" data-radius="soft" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          hostGrotesk.variable,
          jetbrainsMono.variable
        )}
      >
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeColor />
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

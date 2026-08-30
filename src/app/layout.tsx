import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getConfig } from '@/lib/config-loader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const config = getConfig();
const { personal, social } = config;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://abdulkarim.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${personal.name} — ${personal.title}`,
    template: `%s · ${personal.name}`,
  },
  description: personal.bio.split('\n').filter(Boolean).slice(-1)[0] || personal.tagline,
  keywords: [
    personal.name,
    'Senior Full-Stack Engineer',
    'AI Engineer',
    'LLM Specialist',
    'Software Engineer',
    'Tech Lead',
    'Next.js',
    'React',
    'Python',
    'NestJS',
    'TypeScript',
    'RLHF',
    'LangChain',
    'Top Rated Upwork',
    'Ethiopia Developer',
    'Freelance Software Engineer',
    'AI Portfolio',
  ],
  authors: [{ name: personal.name, url: siteUrl }],
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${personal.name} — ${personal.title}`,
    description: personal.tagline,
    siteName: `${personal.name} · Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${personal.name} — ${personal.title}`,
    description: personal.tagline,
  },
  manifest: '/manifest.json',
  alternates: { canonical: siteUrl },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
    { media: '(prefers-color-scheme: dark)', color: '#141312' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: personal.name,
              jobTitle: personal.title,
              url: siteUrl,
              image: `${siteUrl}/avatar.svg`,
              email: `mailto:${personal.email}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: personal.location,
              },
              sameAs: [
                social.upwork,
                social.github,
                social.linkedin,
                social.twitter,
              ].filter(Boolean),
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Addis Ababa University',
              },
              knowsAbout: [
                'Full-Stack Development',
                'AI Engineering',
                'Large Language Models',
                'RLHF',
                'System Design',
                'Next.js',
                'Python',
                'TypeScript',
              ],
              description: personal.tagline,
            }),
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          newsreader.variable,
          jetbrainsMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="flex min-h-screen flex-col">{children}</main>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

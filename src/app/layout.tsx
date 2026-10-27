import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Public_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getConfig } from '@/lib/config-loader';
import './globals.css';

// Two faces only: a tall civic gothic for the name and headings, a plain
// public-service sans for everything you read.
const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  weight: '800',
  variable: '--font-big-shoulders',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

const config = getConfig();
const { personal, social } = config;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://abdulkarimg.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${personal.name} — ${personal.title}`,
    template: `%s · ${personal.name}`,
  },
  description: `${personal.headline} ${personal.tagline}`,
  keywords: [
    personal.name,
    'Senior Full-Stack Engineer',
    'AI Platform Engineer',
    'Voice AI Engineer',
    'Supabase Developer',
    'Multi-tenant SaaS',
    'Kubernetes',
    'Terraform',
    'SOC 2',
    'Next.js',
    'TypeScript',
    'Python',
    'Go',
    'Eaglix Tech',
    'Top Rated Plus Upwork',
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
    description: personal.headline,
    siteName: `${personal.name} · Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${personal.name} — ${personal.title}`,
    description: personal.headline,
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
    { media: '(prefers-color-scheme: light)', color: '#1f3038' },
    { media: '(prefers-color-scheme: dark)', color: '#0b151b' },
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
              image: `${siteUrl}${personal.photo}`,
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
                'Voice AI',
                'Multi-tenant SaaS',
                'Multi-region infrastructure',
                'SOC 2',
                'Reinforcement learning',
                'Supabase',
                'Kubernetes',
                'Next.js',
                'TypeScript',
                'Python',
                'Go',
              ],
              worksFor: personal.currently
                ? {
                    '@type': 'Organization',
                    name: personal.currently.company,
                    url: personal.currently.url,
                  }
                : undefined,
              description: personal.tagline,
            }),
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          bigShoulders.variable,
          publicSans.variable
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

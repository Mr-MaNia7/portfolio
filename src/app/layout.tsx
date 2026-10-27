import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { Besley, Libre_Franklin } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getConfig } from '@/lib/config-loader';
import './globals.css';

// Two faces: Besley 800 for display, Libre Franklin for running text.
const besley = Besley({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['800'],
});

const franklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-text',
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
    { media: '(prefers-color-scheme: light)', color: '#ddd6c6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1d19' },
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
          besley.variable,
          franklin.variable
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

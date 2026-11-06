import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Memoizes components automatically. The draft lives at the top of the chat, so
  // without it every keystroke re-rendered the landing page or the whole transcript.
  reactCompiler: true,
  // Baseline security headers on every response. A full content security policy
  // is left out on purpose: Next's inline scripts and Vercel Analytics need a
  // nonce setup to stay working, so only framing is locked down for now.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
        ],
      },
    ];
  },
  images: {
    // AVIF first: smaller than WebP for the project covers and screenshots.
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.aceternity.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
};

export default nextConfig;

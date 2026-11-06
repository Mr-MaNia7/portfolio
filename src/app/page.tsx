import type { Metadata } from 'next';
import Chat from '@/components/chat/chat';
import { JsonLd } from '@/components/json-ld';
import { pageOpenGraph, pageTwitter } from '@/lib/site';
import { homeGraph } from '@/lib/structured-data';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: pageOpenGraph({ path: '/' }),
  twitter: pageTwitter(),
};

// A server component, so the landing page is prerendered into the HTML. The chat
// reads ?query= itself after mounting, which keeps the page static.
export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Chat />
    </>
  );
}

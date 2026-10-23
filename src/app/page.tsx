'use client';

import { Suspense } from 'react';
import Chat from '@/components/chat/chat';

export default function Home() {
  return (
    <Suspense fallback={<div className="h-svh bg-background" />}>
      <Chat />
    </Suspense>
  );
}

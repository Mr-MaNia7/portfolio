'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** An image whose box is already reserved by its parent. It fades in once loaded, so nothing pops. */
export function FadeImage({ alt, className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={() => setLoaded(true)}
      data-loaded={loaded}
      className={cn('fade-img', className)}
    />
  );
}

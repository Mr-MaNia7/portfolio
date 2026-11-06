'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { THEME_COLORS } from '@/lib/theme-colors';

/**
 * The browser bar follows the site's own theme, not the OS setting: the visitor
 * picks the theme here, so a dark OS can still be showing the light page.
 */
export function ThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}

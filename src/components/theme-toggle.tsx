'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? isDark
            ? 'Switch to light theme'
            : 'Switch to dark theme'
          : 'Toggle theme'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground ${className}`}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[15px] w-[15px]" />
        ) : (
          <Moon className="h-[15px] w-[15px]" />
        )
      ) : (
        <span className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}

export default ThemeToggle;

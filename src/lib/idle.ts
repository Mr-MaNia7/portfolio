/**
 * Runs work once the browser has nothing more urgent to do, or after a fallback
 * delay where requestIdleCallback is missing (Safari). Returns a cancel function.
 */
export function whenIdle(work: () => void, fallbackMs = 2000): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(work, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(work, fallbackMs);
  return () => clearTimeout(t);
}

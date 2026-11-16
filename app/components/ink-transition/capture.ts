

import { Theme } from './theme';

/**
 * Viewport snapshots of the page in a given theme.
 *
 * Unlike a full-document capture, we snapshot only what is on screen right now, so
 * pinned GSAP sections and scroll-driven text are captured in their *current* state.
 * The theme is applied to html2canvas' cloned document (`onclone`), so the live page
 * never flickers. Snapshots are re-taken a moment after scrolling stops.
 */

export interface Snapshot {
  theme: Theme;
  canvas: HTMLCanvasElement;
  /** Texture pixels per CSS pixel. */
  scale: number;
  /** State this snapshot is valid for; see {@link layoutKey}. */
  key: string;
  ms: number;
}

/** Page background per theme. Change these if your page colours differ. */
const BACKGROUND: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#000000',
};

const isCoarsePointer = (): boolean => window.matchMedia('(pointer: coarse)').matches;

/** Device-pixel ratio used for both the snapshots and the overlay canvas. */
export function renderScale(): number {
  const cap = isCoarsePointer() ? 1.5 : 2;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function viewportSize(): { width: number; height: number } {
  const el = document.documentElement;
  return { width: el.clientWidth, height: el.clientHeight };
}

/** Identifies the exact state a snapshot depends on: viewport size + scroll position. */
export function layoutKey(scale: number): string {
  const { width, height } = viewportSize();
  return `${width}x${height}@${scale}:${Math.round(window.scrollX)},${Math.round(window.scrollY)}`;
}

export async function capturePage(theme: Theme, scale: number, maxTextureSize: number): Promise<Snapshot> {
  const t0 = performance.now();
  const key = layoutKey(scale);
  const { width, height } = viewportSize();
  const safeScale = Math.min(scale, maxTextureSize / width, maxTextureSize / height);

  // html2canvas-pro (not plain html2canvas): Tailwind v4 colours use oklch(), which
  // the original html2canvas cannot parse. Lazy-loaded; only needed after first paint.
  const { default: html2canvas } = await import('html2canvas-pro');
  const canvas = await html2canvas(document.body, {
    scale: safeScale,
    backgroundColor: BACKGROUND[theme],
    x: window.scrollX,
    y: window.scrollY,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    logging: false,
    useCORS: true,
    ignoreElements: (el) => el.hasAttribute('data-html2canvas-ignore'),
    onclone: (doc) => {
      doc.documentElement.classList.toggle('dark', theme === 'dark');
      // The live toggle is drawn above the overlay, so leave a hole for it.
      doc.querySelectorAll<HTMLElement>('[data-ink-live]').forEach((el) => {
        el.style.visibility = 'hidden';
      });
    },
  });

  return { theme, canvas, scale: safeScale, key, ms: performance.now() - t0 };
}

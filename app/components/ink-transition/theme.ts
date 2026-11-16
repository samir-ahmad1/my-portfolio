export type Theme = 'light' | 'dark';

const root = () => document.documentElement;

/** Same source of truth as your toggle: the `dark` class on <html>. */
export function getTheme(): Theme {
  return root().classList.contains('dark') ? 'dark' : 'light';
}

export function otherTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/** Instantly applies a theme (class + localStorage), exactly like your ThemeToggle does. */
export function applyTheme(theme: Theme): void {
  root().classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

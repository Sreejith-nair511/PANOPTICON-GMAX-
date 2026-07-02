// Theme management utilities
export type Theme = 'dark' | 'light' | 'serious' | 'high-contrast';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  icon: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Professional dark mode with cyan accents',
    icon: '🌙',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light mode for daytime operations',
    icon: '☀️',
  },
  {
    id: 'serious',
    name: 'Serious Mode',
    description: 'Critical case mode with red accents for urgent investigations',
    icon: '🚨',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for accessibility',
    icon: '⚡',
  },
];

export const getTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  return (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
};

export const setTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('panopticon-theme', theme);
};

export const initializeTheme = () => {
  if (typeof document === 'undefined') return;
  const savedTheme = localStorage.getItem('panopticon-theme') as Theme | null;
  const theme = savedTheme || 'dark';
  setTheme(theme);
};

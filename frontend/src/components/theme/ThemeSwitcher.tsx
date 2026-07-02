'use client';

import { useState } from 'react';
import { THEMES, getTheme, setTheme, type Theme } from '@/lib/theme';
import { AlertCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme());

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  const currentThemeConfig = THEMES.find((t) => t.id === currentTheme);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-var(--border) hover:bg-var(--bg-overlay) transition-colors cursor-pointer">
          <span className="text-lg">{currentThemeConfig?.icon}</span>
          <span className="hidden sm:inline text-var(--text-secondary)">{currentThemeConfig?.name}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="glass min-w-64 rounded-lg p-2 shadow-2xl z-50"
          align="end"
          sideOffset={8}
        >
          {/* Serious Mode Warning */}
          <div className="px-3 py-2 mb-2">
            <div className="flex items-start gap-2 p-2 bg-var(--danger)/10 border border-var(--danger)/25 rounded-md">
              <AlertCircle className="w-4 h-4 text-var(--danger) mt-0.5 flex-shrink-0" />
              <p className="text-xs text-var(--text-secondary)">
                Use "Serious Mode" for critical investigations
              </p>
            </div>
          </div>

          <DropdownMenu.Separator className="my-2 bg-var(--border)" />

          {THEMES.map((theme) => (
            <DropdownMenu.Item key={theme.id} asChild>
              <button
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-all group ${
                  currentTheme === theme.id
                    ? 'bg-var(--accent)/15 border-l-2 border-l-var(--accent)'
                    : 'hover:bg-var(--bg-overlay)'
                }`}
              >
                <span className="text-xl mt-1">{theme.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-var(--text-primary)">{theme.name}</div>
                  <div className="text-xs text-var(--text-secondary)">{theme.description}</div>
                </div>
                {currentTheme === theme.id && (
                  <div className="w-2 h-2 rounded-full bg-var(--accent) mt-2" />
                )}
              </button>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Arrow className="fill-var(--bg-surface)" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const getSystemTheme = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    const nextResolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(nextResolved);

    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme, mounted]);

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const getIcon = () => {
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getLabel = () => {
    return resolvedTheme === 'dark' ? 'ダークモード' : 'ライトモード';
  };

  // ハイドレーションエラーを防ぐため、マウント前は何もレンダリングしない
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">読み込み中...</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="gap-2"
      aria-label={getLabel()}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}

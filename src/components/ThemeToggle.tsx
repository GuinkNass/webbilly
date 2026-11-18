'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    setTheme(currentTheme);

    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail?.theme || 'dark');
    };

    window.addEventListener('webbilly-theme-change' as any, handleThemeChange);
    return () => {
      window.removeEventListener('webbilly-theme-change' as any, handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('webbilly-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('webbilly-theme-change', { detail: { theme: nextTheme } }));
  };

  if (!mounted) {
    return (
      <button
        aria-label="Alternar tema"
        className={`p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1d27] text-slate-500 dark:text-slate-300 opacity-60 ${className}`}
      >
        <Moon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      aria-label="Alternar tema"
      className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1d27] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline text-xs font-semibold">Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline text-xs font-semibold">Escuro</span>
        </>
      )}
    </button>
  );
}

export default ThemeToggle;

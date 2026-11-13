'use client';

import React from 'react';

export type TrophyTier = 'RUBI' | 'OURO' | 'PRATA' | 'BRONZE' | 'NONE' | 'Rubi' | 'Ouro' | 'Prata' | 'Bronze' | 'Iniciante';

interface TrophyImageProps {
  tier?: TrophyTier | string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showLockBadge?: boolean;
  alt?: string;
}

const TIER_MAP: Record<string, { src: string; alt: string; glow: string; isLocked?: boolean }> = {
  RUBI: {
    src: '/trofeus/Rubi.png',
    alt: 'Troféu Rubi',
    glow: 'drop-shadow-[0_0_18px_rgba(225,29,72,0.75)]'
  },
  Rubi: {
    src: '/trofeus/Rubi.png',
    alt: 'Troféu Rubi',
    glow: 'drop-shadow-[0_0_18px_rgba(225,29,72,0.75)]'
  },
  OURO: {
    src: '/trofeus/Ouro.png',
    alt: 'Troféu Ouro',
    glow: 'drop-shadow-[0_0_18px_rgba(234,179,8,0.75)]'
  },
  Ouro: {
    src: '/trofeus/Ouro.png',
    alt: 'Troféu Ouro',
    glow: 'drop-shadow-[0_0_18px_rgba(234,179,8,0.75)]'
  },
  PRATA: {
    src: '/trofeus/Prata.png',
    alt: 'Troféu Prata',
    glow: 'drop-shadow-[0_0_16px_rgba(148,163,184,0.7)]'
  },
  Prata: {
    src: '/trofeus/Prata.png',
    alt: 'Troféu Prata',
    glow: 'drop-shadow-[0_0_16px_rgba(148,163,184,0.7)]'
  },
  BRONZE: {
    src: '/trofeus/Bronze.png',
    alt: 'Troféu Bronze',
    glow: 'drop-shadow-[0_0_16px_rgba(217,119,6,0.7)]'
  },
  Bronze: {
    src: '/trofeus/Bronze.png',
    alt: 'Troféu Bronze',
    glow: 'drop-shadow-[0_0_16px_rgba(217,119,6,0.7)]'
  },
  NONE: {
    src: '/trofeus/Bronze.png',
    alt: 'Iniciante - Rumo ao Bronze',
    glow: 'drop-shadow-[0_0_8px_rgba(113,113,122,0.3)]',
    isLocked: true
  },
  Iniciante: {
    src: '/trofeus/Bronze.png',
    alt: 'Iniciante - Rumo ao Bronze',
    glow: 'drop-shadow-[0_0_8px_rgba(113,113,122,0.3)]',
    isLocked: true
  }
};

const SIZE_MAP: Record<string, string> = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28'
};

export function TrophyImage({
  tier,
  size = 'md',
  className = '',
  showLockBadge = false,
  alt
}: TrophyImageProps) {
  const normalizedTier = tier || 'NONE';
  const info = TIER_MAP[normalizedTier] || TIER_MAP['NONE'];

  const sizeClass = typeof size === 'number' ? '' : SIZE_MAP[size] || SIZE_MAP.md;
  const style = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const isLocked = info.isLocked;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={info.src}
        alt={alt || info.alt}
        className={`object-contain transition-all duration-300 pointer-events-none select-none ${sizeClass} ${
          isLocked
            ? 'grayscale opacity-40 brightness-75 contrast-125'
            : `${info.glow} hover:scale-105`
        }`}
        style={style}
        loading="eager"
      />

      {isLocked && showLockBadge && (
        <span className="absolute -bottom-2 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900/90 text-zinc-400 border border-zinc-700 shadow-md">
          Bloqueado — Rumo ao Bronze
        </span>
      )}
    </div>
  );
}

export default TrophyImage;

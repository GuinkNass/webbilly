'use client';

import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars, adventurer, lorelei, pixelArt, bottts } from '@dicebear/collection';

const STYLES_MAP: Record<string, any> = {
  avataaars,
  adventurer,
  lorelei,
  pixelArt,
  'pixel-art': pixelArt,
  bottts
};

interface GamerAvatarProps {
  svg?: string | null;
  config?: any;
  seed?: string;
  style?: string;
  size?: number;
  aura?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export default function GamerAvatar({
  svg,
  config,
  seed = 'BillyHero',
  style,
  size,
  aura,
  className = '',
  onClick,
  title
}: GamerAvatarProps) {
  const effectiveStyle = style || config?.style || 'avataaars';
  const effectiveSeed = seed || config?.seed || 'BillyHero';

  const renderedSvg = useMemo(() => {
    if (svg && svg.trim().startsWith('<svg')) {
      return svg;
    }
    try {
      const collection = STYLES_MAP[effectiveStyle] || avataaars;
      const avatar = createAvatar(collection, {
        seed: effectiveSeed,
        radius: 50,
        ...(config?.options || {})
      });
      return avatar.toString();
    } catch {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#141824"/></svg>`;
    }
  }, [svg, effectiveSeed, effectiveStyle, config]);

  const sizeStyle = size ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` } : undefined;
  const defaultSizeClass = size ? '' : (className.includes('w-') ? '' : 'w-10 h-10');

  return (
    <div
      onClick={onClick}
      title={title}
      style={sizeStyle}
      className={`rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0c101c] flex items-center justify-center shrink-0 transition-transform ${defaultSizeClass} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-[#84cc16]/50' : ''
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
    />
  );
}

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { createPortal } from 'react-dom';
import { Lightbulb } from 'lucide-react';

/* =========================================================================
   CONTEXTO E ESTADO GLOBAL DO MODO GUIA / DICAS
   ========================================================================= */

interface TooltipContextType {
  tooltipsEnabled: boolean;
  toggleTooltips: () => void;
  setTooltipsEnabled: (enabled: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType>({
  tooltipsEnabled: true,
  toggleTooltips: () => {},
  setTooltipsEnabled: () => {}
});

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltipsEnabled, setTooltipsEnabledState] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('webbilly_tooltips_enabled');
      if (saved !== null) {
        setTooltipsEnabledState(saved === 'true');
      }
    } catch {}

    const handleSync = (e: any) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setTooltipsEnabledState(e.detail.enabled);
      }
    };
    window.addEventListener('webbilly_tooltips_sync', handleSync);
    return () => window.removeEventListener('webbilly_tooltips_sync', handleSync);
  }, []);

  const setTooltipsEnabled = useCallback((enabled: boolean) => {
    setTooltipsEnabledState(enabled);
    try {
      localStorage.setItem('webbilly_tooltips_enabled', String(enabled));
      window.dispatchEvent(
        new CustomEvent('webbilly_tooltips_sync', { detail: { enabled } })
      );
    } catch {}
  }, []);

  const toggleTooltips = useCallback(() => {
    setTooltipsEnabled(!tooltipsEnabled);
  }, [tooltipsEnabled, setTooltipsEnabled]);

  return (
    <TooltipContext.Provider
      value={{ tooltipsEnabled, toggleTooltips, setTooltipsEnabled }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltips() {
  return useContext(TooltipContext);
}

/* =========================================================================
   BOTÃO TOGGLE DE DICAS (PARA O CABEÇALHO SUPERIOR)
   ========================================================================= */

export function TooltipsToggle({ className = '' }: { className?: string }) {
  const { tooltipsEnabled, toggleTooltips } = useTooltips();

  return (
    <ActionTooltip
      title="Modo Dicas & Guia"
      description="Ativa ou desativa os balões explicativos ao passar o mouse sobre botões e ícones."
      side="bottom"
    >
      <button
        type="button"
        onClick={toggleTooltips}
        aria-label="Alternar modo de dicas rápidas"
        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
          tooltipsEnabled
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
            : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
        } ${className}`}
      >
        <Lightbulb
          className={`w-3.5 h-3.5 transition-transform ${
            tooltipsEnabled ? 'text-amber-500 scale-105' : 'text-slate-400'
          }`}
        />
        <span className="hidden sm:inline">
          {tooltipsEnabled ? 'Dicas: ON' : 'Dicas: OFF'}
        </span>
      </button>
    </ActionTooltip>
  );
}

/* =========================================================================
   COMPONENTE GLOBAL <ActionTooltip />
   ========================================================================= */

export interface ActionTooltipProps {
  title?: React.ReactNode;
  description: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ActionTooltip({
  title,
  description,
  side = 'top',
  align = 'center',
  sideOffset = 8,
  delayDuration = 150,
  disabled = false,
  className = 'inline-flex',
  children
}: ActionTooltipProps) {
  const { tooltipsEnabled } = useTooltips();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    effectiveSide: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 260; // Max width aproximada
    const tooltipHeight = 80;  // Altura média estimada para flipping

    let effectiveSide = side;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Flip inteligente se encostar na borda da tela
    if (side === 'top' && triggerRect.top - tooltipHeight - sideOffset < 10) {
      effectiveSide = 'bottom';
    } else if (side === 'bottom' && triggerRect.bottom + tooltipHeight + sideOffset > vh - 10) {
      effectiveSide = 'top';
    } else if (side === 'left' && triggerRect.left - tooltipWidth - sideOffset < 10) {
      effectiveSide = 'right';
    } else if (side === 'right' && triggerRect.right + tooltipWidth + sideOffset > vw - 10) {
      effectiveSide = 'left';
    }

    let top = 0;
    let left = 0;

    if (effectiveSide === 'top') {
      top = triggerRect.top - sideOffset;
      if (align === 'start') left = triggerRect.left;
      else if (align === 'end') left = triggerRect.right;
      else left = triggerRect.left + triggerRect.width / 2;
    } else if (effectiveSide === 'bottom') {
      top = triggerRect.bottom + sideOffset;
      if (align === 'start') left = triggerRect.left;
      else if (align === 'end') left = triggerRect.right;
      else left = triggerRect.left + triggerRect.width / 2;
    } else if (effectiveSide === 'left') {
      left = triggerRect.left - sideOffset;
      if (align === 'start') top = triggerRect.top;
      else if (align === 'end') top = triggerRect.bottom;
      else top = triggerRect.top + triggerRect.height / 2;
    } else if (effectiveSide === 'right') {
      left = triggerRect.right + sideOffset;
      if (align === 'start') top = triggerRect.top;
      else if (align === 'end') top = triggerRect.bottom;
      else top = triggerRect.top + triggerRect.height / 2;
    }

    setCoords({ top, left, effectiveSide });
  }, [side, align, sideOffset]);

  const handleMouseEnter = () => {
    if (!tooltipsEnabled || disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Se desativado ou sem conteúdo, renderiza direto os filhos
  if (disabled || !description) {
    return <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={className}
    >
      {children}

      {isOpen && tooltipsEnabled && coords && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                coords.effectiveSide === 'top'
                  ? 'translate(-50%, -100%)'
                  : coords.effectiveSide === 'bottom'
                  ? 'translate(-50%, 0)'
                  : coords.effectiveSide === 'left'
                  ? 'translate(-100%, -50%)'
                  : 'translate(0, -50%)',
              zIndex: 99999
            }}
            className="pointer-events-none transition-opacity duration-150 animate-in fade-in-0 zoom-in-95"
            role="tooltip"
          >
            <div className="relative bg-white/95 dark:bg-[#1c1d27]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[270px] min-w-[140px] text-slate-700 dark:text-slate-200">
              {title && (
                <div className="font-bold text-blue-600 dark:text-blue-400 mb-0.5 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <span>{title}</span>
                </div>
              )}
              <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                {description}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default ActionTooltip;

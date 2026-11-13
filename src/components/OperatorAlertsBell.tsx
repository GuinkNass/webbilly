'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink, X, Flame, Sparkles, Info, Clock } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'promo' | 'urgent';
  action_label?: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

interface OperatorAlertsBellProps {
  operatorId: string;
}

export default function OperatorAlertsBell({ operatorId }: OperatorAlertsBellProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Carrega alertas
  const fetchAlerts = async (silent = false) => {
    if (!operatorId) return;
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/operador/alerts?operatorId=${encodeURIComponent(operatorId)}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
        setUnreadCount(data.unreadCount ?? data.alerts.filter((a: AlertItem) => !a.read).length);
      }
    } catch (err) {
      console.warn('[AlertsBell] Erro ao carregar alertas:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Montagem e Polling a cada 15 segundos
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [operatorId]);

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    if (!operatorId) return;
    try {
      // Atualização otimista imediata na interface
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);

      await fetch('/api/operador/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId, markAll: true })
      });
    } catch (err) {
      console.warn('[AlertsBell] Erro ao marcar todas como lidas:', err);
    }
  };

  // Marcar uma como lida
  const handleMarkAsRead = async (alertId: string) => {
    if (!operatorId || !alertId) return;
    try {
      setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, read: true } : a)));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch('/api/operador/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId, alertId })
      });
    } catch (err) {
      console.warn('[AlertsBell] Erro ao marcar como lida:', err);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Agora mesmo';
      if (diffMinutes < 60) return `Há ${diffMinutes} min`;
      if (diffHours < 24) return `Há ${diffHours}h`;
      if (diffDays === 1) return 'Ontem';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            Urgente
          </span>
        );
      case 'promo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40">
            <Sparkles className="w-3 h-3 text-[#84cc16]" />
            Campanha
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Info className="w-3 h-3 text-sky-400" />
            Aviso
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Sininho */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-white/[0.12] text-white ring-2 ring-emerald-500/50'
            : 'text-zinc-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
        }`}
        title="Central de Avisos & Comunicados Oficiais"
      >
        <img
          src="/icones/029-megaphone.svg"
          alt="Alertas"
          className="w-4 h-4 object-contain transition-transform group-hover:scale-110"
        />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#84cc16] to-emerald-500 text-black font-mono font-black text-[10px] flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-pulse border border-[#090D16]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[92vw] bg-[#0d111b]/98 backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Header do Dropdown */}
          <div className="px-4 py-3 bg-[#111624] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <img src="/icones/029-megaphone.svg" alt="" className="w-4 h-4 object-contain" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">Comunicados Oficiais</h4>
                <p className="text-[10px] text-zinc-400">
                  {unreadCount === 0
                    ? 'Todas as mensagens lidas'
                    : `${unreadCount} comunicado${unreadCount > 1 ? 's' : ''} não lido${unreadCount > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition flex items-center gap-1 cursor-pointer"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Ler todas</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/[0.04]">
            {alerts.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-zinc-400">Nenhum aviso no momento</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Fique tranquilo, qualquer novidade ou meta especial avisaremos aqui!
                </p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (!alert.read) handleMarkAsRead(alert.id);
                  }}
                  className={`p-4 transition duration-150 cursor-pointer group ${
                    alert.read
                      ? 'bg-transparent hover:bg-white/[0.02]'
                      : 'bg-emerald-950/20 hover:bg-emerald-950/30 border-l-2 border-emerald-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(alert.priority)}
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>

                  <h5 className={`text-xs font-bold leading-snug mb-1 ${alert.read ? 'text-zinc-200' : 'text-white'}`}>
                    {alert.title}
                  </h5>

                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {alert.message}
                  </p>

                  {alert.action_url && (
                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <a
                        href={alert.action_url}
                        target={alert.action_url.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!alert.read) handleMarkAsRead(alert.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black shadow-md shadow-[#84cc16]/20 transition cursor-pointer"
                      >
                        <span>{alert.action_label || 'Acessar Link'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {!alert.read && (
                        <span className="text-[10px] text-emerald-400/80 font-mono">
                          Não lido
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer do Dropdown */}
          <div className="px-4 py-2.5 bg-[#0a0d15] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-400">
            <span>Webbilly Notifications • Real-Time</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronizado
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

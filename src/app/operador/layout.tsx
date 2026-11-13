'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OperatorProvider, useOperator } from '@/contexts/OperatorContext';
import GamerAvatar from '@/components/GamerAvatar';
import TrophyImage from '@/components/TrophyImage';
import OperatorAlertsBell from '@/components/OperatorAlertsBell';
import { startOperadorTour } from '@/lib/tours';
import {
  Search,
  HelpCircle,
  Mail,
  ExternalLink,
  Key,
  RefreshCw,
  Copy,
  LogOut,
  ChevronRight,
  Pin,
  PinOff,
  Menu,
  X,
  Lock,
  Check
} from 'lucide-react';

function OperatorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    data,
    loading,
    op,
    license,
    stats,
    loadData,
    searchQuery,
    setSearchQuery,
    setShowAvatarModal,
    setAvatarModalCanClose,
    showPasswordModal,
    setShowPasswordModal,
    copySerial,
    copiedSerial,
    handleLogout
  } = useOperator();

  // Estados da Sidebar Retrátil
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados para troca de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Se a rota for login, renderiza apenas o conteúdo do login
  if (pathname === '/operador/login') {
    return <>{children}</>;
  }

  const isExpanded = isPinned || isHovered;

  const navItems = [
    {
      href: '/operador',
      label: 'Dashboard',
      iconSrc: '/icones/015-computer-monitor.svg',
      badge: stats?.activeSubscriptionsCount ? `${stats.activeSubscriptionsCount} sites` : null,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
    },
    {
      href: '/operador/sites',
      label: 'Sites Ativos (SaaS)',
      iconSrc: '/icones/op-sites.svg',
      badge: stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || 0,
      badgeColor: 'bg-zinc-800 text-zinc-300'
    },
    {
      href: '/operador/treinamento',
      label: 'Área de Treinamento',
      iconSrc: '/icones/op-training.svg',
      badge: '4 Aulas',
      badgeColor: 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
    },
    {
      href: '/operador/vendas',
      label: 'Minhas Vendas & Pix',
      iconSrc: '/icones/op-sales.svg',
      badge: `R$ ${(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')}`,
      badgeColor: 'bg-emerald-950/40 text-emerald-400'
    },
    {
      href: '/operador/ranking',
      label: 'Ranking & Medalhas',
      iconSrc: '/icones/op-ranking.svg',
      badge: data?.gamification?.currentMedal?.name || 'Iniciante',
      badgeColor: `${data?.gamification?.currentMedal?.badgeBg || 'bg-amber-500/20'} ${data?.gamification?.currentMedal?.badgeText || 'text-amber-300'} border ${data?.gamification?.currentMedal?.badgeBorder || 'border-amber-500/30'}`
    },
    {
      href: '/operador/afiliados',
      label: 'Billy Afiliados',
      iconSrc: '/icones/op-affiliates.svg',
      badge: data?.affiliates?.enabled ? '5% Ativo' : data?.affiliates?.eligibility?.eligible ? 'Liberado!' : 'Bronze',
      badgeColor: data?.affiliates?.enabled ? 'bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40' : 'bg-zinc-800 text-zinc-400'
    }
  ];

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação de senha não confere.');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/operator/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex font-sans antialiased select-none">
      {/* =========================================================================
          1. SIDEBAR RETRÁTIL (RECOLHIDA W-20 / EXPANDIDA W-64 COM HOVER E PIN)
         ========================================================================= */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 bottom-0 bg-[#0c0f17]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64 shadow-2xl shadow-black/80' : 'w-20'
        } hidden md:flex`}
      >
        <div>
          {/* Header da Sidebar: Logo + Botão Fixar */}
          <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between">
            <Link href="/operador" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-[#84cc16]/20 to-teal-500/20 border border-[#84cc16]/40 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                <img src="/billy-logo.png" alt="Billy" className="w-full h-full object-contain" />
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white tracking-tight">Webbilly</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                      OPERADOR
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium truncate">Painel de Trabalho</p>
                </div>
              )}
            </Link>

            {/* Botão de Fixar / Desafixar */}
            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  isPinned
                    ? 'bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
                }`}
                title={isPinned ? 'Desafixar barra lateral (recolher)' : 'Fixar barra lateral aberta'}
              >
                {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Itens de Navegação Vertical */}
          <nav className="p-3 space-y-2 mt-2">
            {navItems.map((item) => {
              const isActive =
                item.href === '/operador'
                  ? pathname === '/operador'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
                    isExpanded ? 'px-3.5 py-2.5 justify-between' : 'h-14 justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className={`flex items-center gap-3.5 ${!isExpanded ? 'justify-center w-full' : ''}`}>
                    <div className="relative shrink-0 flex items-center justify-center">
                      <img
                        src={item.iconSrc}
                        alt=""
                        className={`w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'brightness-200 drop-shadow-[0_0_8px_rgba(132,204,22,0.8)]' : 'opacity-80 group-hover:opacity-100'
                        }`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {/* Ponto indicador ativo no modo recolhido */}
                      {!isExpanded && isActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#84cc16] shadow-md shadow-[#84cc16]/80 animate-pulse border-2 border-[#0c0f17]" />
                      )}
                    </div>
                    {isExpanded && (
                      <span className="text-xs font-semibold whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {isExpanded && item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold truncate max-w-[90px] ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-white/[0.08] space-y-2">
          {/* Card Resumo do Serial */}
          {isExpanded ? (
            <div className="p-2.5 rounded-xl bg-[#141824] border border-white/[0.06] text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Chave Serial</span>
                <button
                  type="button"
                  onClick={copySerial}
                  className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSerial ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSerial ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="font-mono text-[11px] font-bold text-white bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800 truncate select-all">
                {op?.serialToken || 'CARREGANDO...'}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={copySerial}
              className="w-full h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-emerald-400 transition"
              title="Copiar Token Serial"
            >
              <Key className="w-5 h-5" />
            </button>
          )}

          {/* Botão Sair */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition ${
              isExpanded ? 'px-3 py-2 gap-2 justify-start' : 'h-10 justify-center'
            }`}
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          DRAWER RESPONSIVO MOBILE
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-[#0c0f17] border-r border-white/[0.08] flex flex-col justify-between p-4 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <img src="/billy-logo.png" alt="" className="w-8 h-8 object-contain" />
                  <span className="font-extrabold text-white text-sm">Webbilly Operador</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold ${
                      pathname === item.href
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.iconSrc} alt="" className="w-6 h-6 object-contain" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTAINER DIREITO (HEADER STICKY PERSISTENTE + CHILDREN)
         ========================================================================= */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen bg-[#07090e] transition-all duration-300 ${
        isPinned ? 'md:ml-64' : 'md:ml-20'
      }`}>
        {/* TOPBAR SUPERIOR (GLOBAL E PERSISTENTE ENTRE AS PÁGINAS) */}
        <header className="sticky top-0 z-30 h-16 bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Barra de Pesquisa */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, domínio slug ou dados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-3 py-1.5 bg-[#141824] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition"
              />
            </div>
          </div>

          {/* Ações da Topbar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Tour Guiado */}
            <button
              type="button"
              onClick={() => startOperadorTour(() => {})}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#a3e635] hover:text-white border border-[#84cc16]/40 transition shadow-sm cursor-pointer"
              title="Iniciar Tour Guiado Interativo do Painel do Operador"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>? Tour</span>
            </button>

            {/* Webmail */}
            <a
              href="https://mail.larksuite.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition shadow-sm cursor-pointer"
              title="Acessar webmail corporativo no Lark Suite"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Webmail (@webbilly)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Status Asaas */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Asaas v3</span>
            </div>

            {/* Sininho de Alertas Globais em Tempo Real */}
            <OperatorAlertsBell operatorId={op?.id || ''} />

            {/* Atualizar Dados */}
            <button
              type="button"
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] border border-white/[0.08] transition"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Perfil Operador com GamerAvatar Clicável */}
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setShowAvatarModal(true);
                  setAvatarModalCanClose(true);
                }}
                className="group relative cursor-pointer"
                title="Clique para personalizar seu Avatar"
              >
                <GamerAvatar
                  svg={op?.avatar_svg || op?.avatarSvg}
                  config={op?.avatar_config || op?.avatarConfig}
                  seed={op?.name || op?.id || 'Operador'}
                  size={36}
                  className="ring-2 ring-emerald-500/40 group-hover:ring-[#84cc16] group-hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#84cc16] border-2 border-[#090D16] flex items-center justify-center text-[7px] text-black font-bold">
                  ✨
                </span>
              </button>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white line-clamp-1">{op?.name || 'Operador'}</div>
                <div className="text-[10px] text-zinc-400">{op?.email || 'operador@webbilly.com.br'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO DA ROTA ATIVA */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* MODAL DE TROCA DE SENHA GLOBAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#11141c] border border-white/[0.08] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Trocar Minha Senha</span>
            </h3>
            {passwordSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                Senha alterada com sucesso!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Senha Atual (ou Provisória)</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Nova Senha (Mínimo 8 caracteres)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  {!op?.mustChangePassword && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                  >
                    {passwordLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorProvider>
      <OperatorShell>{children}</OperatorShell>
    </OperatorProvider>
  );
}

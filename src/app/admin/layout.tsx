'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import GamerAvatar from '@/components/GamerAvatar';
import { startAdminTour } from '@/lib/tours';
import {
  Search,
  HelpCircle,
  KeyRound,
  RefreshCw,
  LogOut,
  ChevronRight,
  Pin,
  PinOff,
  Menu,
  X,
  Lock,
  Check,
  AlertTriangle,
  Bell,
  ExternalLink
} from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    data,
    loading,
    adminUser,
    loadData,
    searchQuery,
    setSearchQuery,
    activeAlertsCount,
    setShowAlertsModal,
    showChangePasswordModal,
    setShowChangePasswordModal,
    setShowAdminAvatarModal,
    actionSuccess,
    handleLogout
  } = useAdmin();

  // Estados da Sidebar Retrátil
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados de troca de senha
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Se for a tela de login, renderiza apenas o conteúdo do login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isExpanded = isPinned || isHovered;

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard Executivo',
      iconSrc: '/icones/015-computer-monitor.svg',
      badge: 'Geral',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
    },
    {
      href: '/admin/sites',
      label: 'Gestão de Sites (SaaS)',
      iconSrc: '/icones/op-sites.svg',
      badge: (data?.subscriptions || []).length ? `${(data?.subscriptions || []).length}` : null,
      badgeColor: 'bg-zinc-800 text-zinc-300'
    },
    {
      href: '/admin/operadores',
      label: 'Operadores & Licenças',
      iconSrc: '/icones/085-id-card.svg',
      badge: (data?.operators || []).length ? `${(data?.operators || []).length}` : null,
      badgeColor: 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
    },
    {
      href: '/admin/financeiro',
      label: 'Financeiro & APIs',
      iconSrc: '/icones/045-money.svg',
      badge: 'Caixa 70/30',
      badgeColor: 'bg-emerald-950/40 text-emerald-400'
    }
  ];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (adminNewPassword !== adminConfirmPassword) {
      setChangePasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (adminNewPassword.length < 8) {
      setChangePasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao alterar senha.');

      setChangePasswordSuccess('Senha master alterada com sucesso!');
      setAdminCurrentPassword('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangePasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setChangePasswordError(err.message || 'Falha ao atualizar senha.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-[#84cc16] selection:text-black">
      {/* =========================================================================
          CABEÇALHO SUPERIOR GLOBAL PERSISTENTE
         ========================================================================= */}
      <header className="sticky top-0 z-40 h-16 bg-[#0a0d14]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6">
        {/* Esquerda: Menu Mobile + Logotipo + Badge Master */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center text-[#84cc16] font-black font-mono text-base group-hover:scale-105 transition shadow-lg shadow-lime-950/40">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-wider font-mono">
                WEBBILLY
              </span>
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-widest font-mono">
                ADMIN MASTER
              </span>
            </div>
          </Link>
        </div>

        {/* Centro: Barra de Busca Global */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar estabelecimentos, subdomínios, licenças ou operadores..."
              className="w-full bg-[#11141c] border border-white/[0.08] focus:border-[#84cc16]/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition shadow-inner font-sans"
            />
          </div>
        </div>

        {/* Direita: Ações Globais */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Asaas Gateway */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-[11px] font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Asaas Gateway</span>
          </div>

          {/* Botão Tour Interativo */}
          <button
            onClick={() => startAdminTour()}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            title="Iniciar tutorial guiado do painel administrativo"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Botão Trocar Senha Master */}
          <button
            onClick={() => {
              setChangePasswordError(null);
              setChangePasswordSuccess(null);
              setShowChangePasswordModal(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            title="Alterar senha do Administrador Master"
          >
            <KeyRound className="w-4 h-4 text-[#84cc16]" />
            <span className="hidden md:inline">Senha Master</span>
          </button>

          {/* Sininho de Alertas Globais */}
          <button
            onClick={() => setShowAlertsModal(true)}
            className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Gerenciar Alertas Globais da Plataforma"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black font-mono font-black text-[10px] flex items-center justify-center animate-pulse shadow-md">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Avatar Gamer do Admin Master */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
            <button
              onClick={() => setShowAdminAvatarModal(true)}
              className="relative rounded-full hover:ring-2 hover:ring-[#84cc16] transition cursor-pointer p-0.5"
              title="Personalizar Avatar do Perfil Admin"
            >
              <GamerAvatar
                svg={adminUser?.avatar_svg}
                config={adminUser?.avatar_config}
                seed={adminUser?.name || 'Administrador Master'}
                size={34}
                className="ring-2 ring-amber-500/50 shadow-md shadow-amber-500/20"
              />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition cursor-pointer"
              title="Sair do Painel Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mensagem de Feedback de Ação */}
      {actionSuccess && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between z-30">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          CORPO PRINCIPAL COM SIDEBAR RETRÁTIL + CONTEÚDO
         ========================================================================= */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* SIDEBAR RETRÁTIL DESKTOP */}
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:flex flex-col bg-[#0a0d14] border-r border-white/[0.06] transition-all duration-300 ease-in-out shrink-0 z-30 ${
            isExpanded ? 'w-64 shadow-2xl shadow-black/80' : 'w-20'
          }`}
        >
          {/* Topo da Sidebar: Botão de Fixar / Desfixar */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-white/[0.04]">
            {isExpanded && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                Menu de Gestão
              </span>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition ml-auto cursor-pointer ${
                isPinned ? 'text-[#84cc16]' : ''
              }`}
              title={isPinned ? 'Desafixar Sidebar' : 'Fixar Sidebar Expandida'}
            >
              {isPinned ? <PinOff className="w-4 h-4 text-[#84cc16]" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>

          {/* Links de Navegação com Ícones Maiores (w-7 h-7 / 28px) */}
          <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center rounded-2xl transition duration-150 cursor-pointer ${
                    isExpanded ? 'px-3 py-3 gap-3.5' : 'justify-center p-3'
                  } ${
                    isActive
                      ? 'bg-[#84cc16]/10 text-white border border-[#84cc16]/30 shadow-lg shadow-lime-950/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  {/* Ícone Maior (w-7 h-7 / 28px) */}
                  <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
                    <img
                      src={item.iconSrc}
                      alt=""
                      className={`w-7 h-7 object-contain transition duration-200 group-hover:scale-110 ${
                        isActive ? 'brightness-125 drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#84cc16] rounded-r-full" />
                    )}
                  </div>

                  {/* Texto e Badge (Visíveis apenas quando expandido) */}
                  {isExpanded && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-[#a3e635]' : 'text-zinc-300'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar */}
          <div className="p-3 border-t border-white/[0.06] space-y-2">
            {isExpanded ? (
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                  Supervisão Central
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Operação Total Ativa
                </span>
              </div>
            ) : (
              <div className="flex justify-center py-2" title="Operação Total Ativa">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </div>
        </aside>

        {/* DRAWER RESPONSIVO MOBILE */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-[#0a0d14] border-r border-white/[0.08] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <span className="font-bold text-sm text-white font-mono">NAVEGAÇÃO ADMIN</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="py-4 space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold ${
                          isActive
                            ? 'bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/30'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <img src={item.iconSrc} alt="" className="w-6 h-6 object-contain" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Painel Master</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL DE TROCA DE SENHA MASTER
         ========================================================================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#84cc16] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Alterar Senha Master</h3>
                <span className="text-xs text-zinc-400">admin@billysuite.com.br</span>
              </div>
            </div>

            {changePasswordError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {changePasswordError}
              </div>
            )}

            {changePasswordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                {changePasswordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Senha Atual *</label>
                <input
                  type="password"
                  required
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nova Senha Master (mínimo 8 caracteres) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black transition flex items-center gap-1.5 shadow-lg shadow-lime-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {changePasswordLoading ? 'Salvando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

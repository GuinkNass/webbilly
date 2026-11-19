'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OperatorProvider, useOperator } from '@/contexts/OperatorContext';
import GamerAvatar from '@/components/GamerAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import OperatorAlertsBell from '@/components/OperatorAlertsBell';
import { ActionTooltip, TooltipsToggle, TooltipProvider } from '@/components/ui/ActionTooltip';
import { startOperadorTour } from '@/lib/tours';
import {
  Search,
  HelpCircle,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
  Sparkles,
  Globe,
  GraduationCap,
  BadgeDollarSign,
  Trophy,
  Users,
  Layers
} from 'lucide-react';

function OperatorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    data,
    loading,
    op,
    stats,
    loadData,
    searchQuery,
    setSearchQuery,
    setShowAvatarModal,
    setAvatarModalCanClose,
    showPasswordModal,
    setShowPasswordModal,
    handleLogout
  } = useOperator();

  // Estados da Sidebar Retrátil com Persistência em localStorage
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('webbilly_operator_sidebar_pinned');
      if (stored !== null) {
        setIsPinned(stored === 'true');
      }
    }
  }, []);

  const togglePinned = () => {
    setIsPinned((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('webbilly_operator_sidebar_pinned', String(next));
      }
      return next;
    });
  };

  // Estados para troca de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Se a rota for login, renderiza apenas o conteúdo do login
  if (pathname === '/operador/login') {
    return <>{children}</>;
  }

  const isExpanded = isPinned || isHovered;

  // Bloco 1: OPERAÇÃO
  const operacaoItems = [
    {
      href: '/operador',
      label: 'Dashboard',
      tooltipTitle: 'Dashboard',
      tooltipDesc: 'Visão geral com métricas, faturamento e indicadores em tempo real.',
      icon: LayoutDashboard,
      badge: stats?.activeSubscriptionsCount ? `${stats.activeSubscriptionsCount}` : null
    },
    {
      href: '/operador/estudio',
      label: 'Estúdio IA',
      tooltipTitle: 'Estúdio IA (Billy Studio Web)',
      tooltipDesc: 'Busque comércios no Google Maps, gere sites com IA e feche propostas no WhatsApp.',
      icon: Sparkles,
      badge: 'IA'
    },
    {
      href: '/operador/sites',
      label: 'Meus Sites',
      tooltipTitle: 'Meus Sites (SaaS)',
      tooltipDesc: 'Gerencie os sites gerados, links de demonstração e status de assinaturas.',
      icon: Globe,
      badge: stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || null
    },
    {
      href: '/operador/solicitacoes',
      label: 'Alterações',
      tooltipTitle: 'Fila de Alterações',
      tooltipDesc: 'Acompanhe as solicitações de alteração enviadas pelos clientes.',
      icon: Layers,
      badge: null
    }
  ];

  // Bloco 2: GANHOS & CRESCIMENTO
  const ganhosItems = [
    {
      href: '/operador/vendas',
      label: 'Vendas & Pix',
      tooltipTitle: 'Vendas & Pix',
      tooltipDesc: 'Acompanhe vendas fechadas, comissões recorrentes e status de repasses Pix.',
      icon: BadgeDollarSign,
      badge: `R$ ${(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')}`
    },
    {
      href: '/operador/ranking',
      label: 'Ranking',
      tooltipTitle: 'Ranking & Gamificação',
      tooltipDesc: 'Veja sua posição no ranking mensal, patentes e metas de pontuação.',
      icon: Trophy,
      badge: data?.gamification?.currentMedal?.name || 'Iniciante'
    },
    {
      href: '/operador/afiliados',
      label: 'Afiliados',
      tooltipTitle: 'Billy Afiliados',
      tooltipDesc: 'Indique novos operadores e receba 5% de bônus recorrente.',
      icon: Users,
      badge: data?.affiliates?.enabled ? '5%' : null
    },
    {
      href: '/operador/treinamento',
      label: 'Treinamento',
      tooltipTitle: 'Área de Treinamento',
      tooltipDesc: 'Aulas práticas em vídeo, scripts de abordagem e passo a passo comercial.',
      icon: GraduationCap,
      badge: '4 Aulas'
    }
  ];

  // Ações da Bottom Navigation Bar no celular (< 768px)
  const mobileNavItems = [
    { href: '/operador', label: 'Início', icon: LayoutDashboard },
    { href: '/operador/estudio', label: 'Estúdio IA', icon: Sparkles },
    { href: '/operador/sites', label: 'Sites', icon: Globe },
    { href: '/operador/vendas', label: 'Vendas & Pix', icon: BadgeDollarSign }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('webbilly_password_changed', 'true');
      }
      if (op) {
        op.mustChangePassword = false;
        op.must_change_password = false;
      }
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderNavGroup = (items: typeof operacaoItems, groupTitle: string) => (
    <div className="space-y-1">
      {isExpanded && (
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
          {groupTitle}
        </div>
      )}
      {items.map((item) => {
        const isActive =
          item.href === '/operador'
            ? pathname === '/operador'
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <ActionTooltip
            key={item.href}
            title={item.tooltipTitle}
            description={item.tooltipDesc}
            side="right"
            className="w-full block"
          >
            <Link
              href={item.href}
              className={`w-full flex items-center rounded-xl transition-all duration-150 group cursor-pointer ${
                isExpanded ? 'px-3 py-2.5 justify-between' : 'h-11 justify-center px-0'
              } ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
              }`}
            >
              <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center w-full' : ''}`}>
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                {isExpanded && (
                  <span className="text-xs truncate">
                    {item.label}
                  </span>
                )}
              </div>

              {isExpanded && item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold truncate max-w-[90px] ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800/80 text-zinc-400 border border-white/[0.04]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </ActionTooltip>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090B10] text-zinc-100 flex font-sans antialiased">
      {/* =========================================================================
          1. SIDEBAR DESKTOP MINIMALISTA (ZERO NEON, ZERO MOLDURAS)
         ========================================================================= */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 bottom-0 bg-[#0d1017] border-r border-white/[0.06] flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-20'
        } hidden md:flex`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {/* Header da Sidebar: Logo Natural + Botão de Alternar Expansão */}
          <div className="h-16 px-4 border-b border-white/[0.06] flex items-center justify-between">
            <Link href="/operador" className="flex items-center gap-2.5 overflow-hidden group">
              <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-transparent border-0 shadow-none p-0">
                <img
                  src="/billy-logo.png"
                  alt="WebBILLY"
                  className="w-full h-full object-contain"
                />
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-zinc-100 tracking-tight">WebBILLY</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      OPERADOR
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium truncate">Painel de Trabalho</p>
                </div>
              )}
            </Link>

            {/* Botão de Fixar / Recolher Sidebar */}
            {isExpanded && (
              <ActionTooltip
                title={isPinned ? 'Recolher Menu' : 'Fixar Menu Aberto'}
                description={isPinned ? 'Clique para recolher o menu lateral.' : 'Clique para manter o menu lateral expandido.'}
                side="right"
              >
                <button
                  type="button"
                  onClick={togglePinned}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition cursor-pointer"
                >
                  {isPinned ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </ActionTooltip>
            )}
          </div>

          {/* Navegação Vertical Agrupada em 2 Blocos */}
          <nav className="p-3 space-y-4">
            {renderNavGroup(operacaoItems, 'OPERAÇÃO')}
            <div className="border-t border-white/[0.06] my-2" />
            {renderNavGroup(ganhosItems, 'GANHOS & CRESCIMENTO')}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Apenas Logout Limpo */}
        <div className="p-3 border-t border-white/[0.06]">
          <ActionTooltip title="Encerrar Sessão" description="Desconectar do painel com segurança." side="right" className="w-full block">
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer ${
                isExpanded ? 'px-3 py-2.5 gap-2.5 justify-start' : 'h-10 justify-center'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {isExpanded && <span>Encerrar Sessão</span>}
            </button>
          </ActionTooltip>
        </div>
      </aside>

      {/* =========================================================================
          DRAWER RESPONSIVO MOBILE
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-[#0d1017] border-r border-white/[0.08] flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <img src="/billy-logo.png" alt="Billy" className="w-7 h-7 object-contain bg-transparent border-0 shadow-none p-0" />
                  <span className="font-extrabold text-zinc-100 text-sm">WebBILLY Operador</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Itens do Drawer Agrupados */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                  OPERAÇÃO
                </div>
                {operacaoItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="border-t border-white/[0.06] my-2" />

                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                  GANHOS & CRESCIMENTO
                </div>
                {ganhosItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTAINER PRINCIPAL (SEM CORTE À ESQUERDA)
         ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen bg-[#090B10] transition-all duration-300 ${
          isPinned ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        {/* TOPBAR MINIMALISTA */}
        <header className="sticky top-0 z-30 h-16 bg-[#0d1017]/95 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Barra de Pesquisa */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, domínio slug ou dados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-3 py-1.5 bg-[#11141C] border border-white/[0.08] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Ações da Topbar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Atalho Principal: + Criar Site (Esmeralda Sólido) */}
            <ActionTooltip title="Estúdio de Criação" description="Abrir o Billy Studio Web para prospectar e gerar sites com IA." side="bottom">
              <Link
                href="/operador/estudio"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Criar Site</span>
              </Link>
            </ActionTooltip>

            {/* Alternador Nativo de Tema */}
            <ThemeToggle />

            {/* Modo Dicas / Tooltips */}
            <TooltipsToggle />

            {/* Tour Guiado */}
            <ActionTooltip title="Tour Guiado" description="Passo a passo interativo com explicações sobre o painel." side="bottom">
              <button
                type="button"
                onClick={() => startOperadorTour(() => {})}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tour</span>
              </button>
            </ActionTooltip>

            {/* Sininho de Alertas */}
            <OperatorAlertsBell operatorId={op?.id || ''} />

            {/* Sincronizar Dados */}
            <ActionTooltip title="Sincronizar Dados" description="Atualiza instantaneamente os indicadores e sites." side="bottom">
              <button
                type="button"
                onClick={loadData}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </ActionTooltip>

            {/* Perfil Operador com GamerAvatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
              <ActionTooltip title="Personalizar Avatar" description="Clique para personalizar seu avatar oficial." side="bottom">
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarModal(true);
                    setAvatarModalCanClose(true);
                  }}
                  className="group relative cursor-pointer"
                >
                  <GamerAvatar
                    svg={op?.avatar_svg || op?.avatarSvg}
                    config={op?.avatar_config || op?.avatarConfig}
                    seed={op?.name || op?.id || 'Operador'}
                    size={34}
                    className="ring-1 ring-emerald-500/30 group-hover:ring-emerald-500 transition"
                  />
                </button>
              </ActionTooltip>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-zinc-100 line-clamp-1">{op?.name || 'Operador'}</div>
                <div className="text-[10px] text-zinc-400">{op?.email || 'operador@webbilly.com.br'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (BLINDADA CONTRA OVERFLOW E CORTE) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* =========================================================================
          BARRA DE NAVEGAÇÃO INFERIOR FIXA MOBILE
         ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0d1017]/95 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-around px-2 shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors min-h-[44px] ${
                isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-zinc-400 hover:text-zinc-200 cursor-pointer min-h-[44px]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>

      {/* MODAL DE TROCA DE SENHA GLOBAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#11141C] border border-white/[0.08] space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Trocar Minha Senha</span>
            </h3>
            {passwordSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                Senha alterada com sucesso!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Senha Atual (ou Provisória)</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Nova Senha (Mínimo 8 caracteres)</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Confirmar Nova Senha</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  {!op?.mustChangePassword && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 disabled:opacity-50 cursor-pointer"
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
    <TooltipProvider>
      <OperatorProvider>
        <OperatorShell>{children}</OperatorShell>
      </OperatorProvider>
    </TooltipProvider>
  );
}

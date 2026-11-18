'use client';

import React, { useState } from 'react';
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
  Mail,
  ExternalLink,
  Key,
  RefreshCw,
  Copy,
  LogOut,
  Pin,
  PinOff,
  Menu,
  X,
  Lock,
  Check,
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
  const [showPass, setShowPass] = useState(false);
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
      tooltipTitle: 'Dashboard',
      tooltipDesc: 'Visão geral com gráficos, faturamento, metas e indicadores em tempo real.',
      icon: LayoutDashboard,
      badge: stats?.activeSubscriptionsCount ? `${stats.activeSubscriptionsCount} sites` : null,
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
    },
    {
      href: '/operador/estudio',
      label: 'Billy Studio Web',
      tooltipTitle: 'Billy Studio Web (IA & Maps)',
      tooltipDesc: 'Busque comércios no Google Maps, gere sites com IA, publique no subdomínio e envie propostas no WhatsApp.',
      icon: Sparkles,
      badge: 'NOVO ✨',
      badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 font-bold'
    },
    {
      href: '/operador/sites',
      label: 'Sites Ativos (SaaS)',
      tooltipTitle: 'Sites Ativos',
      tooltipDesc: 'Gerencie os sites gerados, edite dados do cliente, copie links de demonstração e acompanhe o status.',
      icon: Globe,
      badge: stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || 0,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
    },
    {
      href: '/operador/solicitacoes',
      label: 'Fila de Alterações',
      tooltipTitle: 'Fila de Alterações dos Clientes',
      tooltipDesc: 'Acompanhe as solicitações de alteração enviadas pelos clientes, altere status e publique atualizações.',
      icon: Layers,
      badge: 'Portal',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
    },
    {
      href: '/operador/treinamento',
      label: 'Área de Treinamento',
      tooltipTitle: 'Treinamento & Scripts',
      tooltipDesc: 'Acesse tutoriais em vídeo, scripts de abordagem e passo a passo de prospecção.',
      icon: GraduationCap,
      badge: '4 Aulas',
      badgeColor: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40'
    },
    {
      href: '/operador/vendas',
      label: 'Minhas Vendas & Pix',
      tooltipTitle: 'Minhas Vendas & Pix',
      tooltipDesc: 'Acompanhe suas vendas fechadas, comissões (50%) e status de pagamentos Pix.',
      icon: BadgeDollarSign,
      badge: `R$ ${(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')}`,
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
    },
    {
      href: '/operador/ranking',
      label: 'Ranking & Medalhas',
      tooltipTitle: 'Ranking & Medalhas',
      tooltipDesc: 'Veja sua posição no ranking mensal, patentes e metas para desbloquear os troféus oficiais.',
      icon: Trophy,
      badge: data?.gamification?.currentMedal?.name || 'Iniciante',
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
    },
    {
      href: '/operador/afiliados',
      label: 'Billy Afiliados',
      tooltipTitle: 'Billy Afiliados',
      tooltipDesc: 'Copie seu link exclusivo para indicar novos operadores e ganhar bônus recorrente.',
      icon: Users,
      badge: data?.affiliates?.enabled ? '5% Ativo' : data?.affiliates?.eligibility?.eligible ? 'Liberado!' : 'Bronze',
      badgeColor: data?.affiliates?.enabled ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 font-bold' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
    }
  ];

  // Ações da Bottom Navigation Bar no celular (< 768px) - Exatamente 3 links + 1 botão Menu
  const mobileNavItems = [
    { href: '/operador', label: 'Início', icon: LayoutDashboard },
    { href: '/operador/estudio', label: 'Criar Site', icon: Sparkles },
    { href: '/operador/sites', label: 'Meus Sites', icon: Globe },
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131317] text-slate-800 dark:text-slate-100 flex font-sans antialiased transition-colors duration-200">
      {/* =========================================================================
          1. SIDEBAR RETRÁTIL DESKTOP (ESTILO ARCLON)
         ========================================================================= */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-[#1c1d27] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64 shadow-xl shadow-slate-200/50 dark:shadow-black/50' : 'w-20'
        } hidden md:flex`}
      >
        <div>
          {/* Header da Sidebar: Logo + Botão Fixar */}
          <div className="h-16 px-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
            <Link href="/operador" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 p-1.5 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <img src="/billy-logo.png" alt="Billy" className="w-full h-full object-contain" />
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Webbilly</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 font-mono">
                      OPERADOR
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Painel de Trabalho</p>
                </div>
              )}
            </Link>

            {/* Botão de Fixar / Desafixar */}
            {isExpanded && (
              <ActionTooltip
                title="Menu Lateral"
                description={isPinned ? 'Desafixar menu (recolher automaticamente).' : 'Fixar menu aberto na lateral.'}
                side="right"
              >
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    isPinned
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                      : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
              </ActionTooltip>
            )}
          </div>

          {/* Itens de Navegação Vertical */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
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
                    className={`w-full flex items-center rounded-xl transition-all duration-150 group relative cursor-pointer ${
                      isExpanded ? 'px-3 py-2.5 justify-between' : 'h-12 justify-center px-0'
                    } ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-500/30 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center w-full' : ''}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isExpanded && (
                        <span className="text-xs truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isExpanded && item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold truncate max-w-[90px] ${
                        isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </ActionTooltip>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
          {/* Card Resumo do Serial */}
          {isExpanded ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#14161f] border border-slate-200/80 dark:border-white/[0.04] text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Chave Serial</span>
                <ActionTooltip title="Copiar Serial" description="Copia sua chave exclusiva para ativar o software Billy no Windows." side="top">
                  <button
                    type="button"
                    onClick={copySerial}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSerial ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedSerial ? 'Copiado!' : 'Copiar'}
                  </button>
                </ActionTooltip>
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-white bg-white dark:bg-black/40 p-1.5 rounded-lg border border-slate-200 dark:border-white/5 truncate select-all">
                {op?.serialToken || 'CARREGANDO...'}
              </div>
            </div>
          ) : (
            <ActionTooltip title="Copiar Chave Serial" description="Copia seu token serial para o Billy Suite Desktop." side="right">
              <button
                type="button"
                onClick={copySerial}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] flex items-center justify-center text-blue-600 dark:text-blue-400 transition cursor-pointer"
              >
                <Key className="w-4 h-4" />
              </button>
            </ActionTooltip>
          )}

          {/* Botão Sair */}
          <ActionTooltip title="Encerrar Sessão" description="Encerra seu login e desconecta do painel com segurança." side="right" className="w-full block">
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer ${
                isExpanded ? 'px-3 py-2 gap-2 justify-start' : 'h-10 justify-center'
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-[#1c1d27] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <img src="/billy-logo.png" alt="" className="w-7 h-7 object-contain" />
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">Webbilly Operador</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-white/[0.03] rounded-xl">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Tema Visual</span>
                <ThemeToggle />
              </div>

              <a
                href="https://mail.larksuite.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Webmail Corporativo</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTAINER DIREITO (HEADER STICKY PERSISTENTE + CHILDREN)
         ========================================================================= */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50 dark:bg-[#131317] transition-all duration-300 ${
        isPinned ? 'md:ml-64' : 'md:ml-20'
      }`}>
        {/* TOPBAR SUPERIOR (GLOBAL E PERSISTENTE ENTRE AS PÁGINAS) */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#1c1d27]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Barra de Pesquisa */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, domínio slug ou dados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-3 py-1.5 bg-slate-100/80 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white dark:focus:bg-[#181a25] transition"
              />
            </div>
          </div>

          {/* Ações da Topbar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Alternador Nativo de Tema Light / Dark */}
            <ThemeToggle />

            {/* Modo Dicas / Tooltips */}
            <TooltipsToggle />

            {/* Tour Guiado */}
            <ActionTooltip title="Tour Guiado" description="Inicia o passo a passo interativo com explicações sobre cada área do painel." side="bottom">
              <button
                type="button"
                onClick={() => startOperadorTour(() => {})}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] transition shadow-2xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Tour</span>
              </button>
            </ActionTooltip>

            {/* Webmail */}
            <ActionTooltip title="Webmail Corporativo" description="Acessar sua caixa postal oficial @webbilly no Lark Suite." side="bottom">
              <a
                href="https://mail.larksuite.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 transition shadow-2xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden xl:inline">Webmail</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </ActionTooltip>

            {/* Status Asaas */}
            <ActionTooltip title="Integração Asaas v3" description="Serviço de geração de Pix dinâmico e cobranças recorrentes online." side="bottom">
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-default">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Asaas v3</span>
              </div>
            </ActionTooltip>

            {/* Sininho de Alertas */}
            <OperatorAlertsBell operatorId={op?.id || ''} />

            {/* Atualizar Dados */}
            <ActionTooltip title="Sincronizar Dados" description="Atualiza instantaneamente os indicadores, métricas e sites da sua conta." side="bottom">
              <button
                type="button"
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </ActionTooltip>

            {/* Perfil Operador com GamerAvatar Clicável */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/[0.08]">
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
                    className="ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition"
                  />
                </button>
              </ActionTooltip>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{op?.name || 'Operador'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{op?.email || 'operador@webbilly.com.br'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO DA ROTA ATIVA (COM PADDING EXTRA NO MOBILE PARA O BOTTOM NAV) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* =========================================================================
          BARRA DE NAVEGAÇÃO INFERIOR FIXA MOBILE (BOTTOM NAVIGATION BAR)
         ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#1c1d27]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around px-2 shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors min-h-[44px] ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer min-h-[44px]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>

      {/* MODAL DE TROCA DE SENHA GLOBAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Trocar Minha Senha</span>
            </h3>
            {passwordSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
                Senha alterada com sucesso!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1">Senha Atual (ou Provisória)</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1">Nova Senha (Mínimo 8 caracteres)</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1">Confirmar Nova Senha</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-11 py-2 rounded-xl bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
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
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-500/20"
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

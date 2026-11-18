'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import GamerAvatar from '@/components/GamerAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import { startAdminTour } from '@/lib/tours';
import { ActionTooltip, TooltipsToggle, TooltipProvider } from '@/components/ui/ActionTooltip';
import {
  Search,
  HelpCircle,
  KeyRound,
  LogOut,
  Pin,
  PinOff,
  Menu,
  X,
  Check,
  Bell,
  Eye,
  EyeOff,
  LayoutDashboard,
  Sparkles,
  Globe,
  Users,
  Trophy,
  DollarSign
} from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    data,
    loading,
    adminUser,
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
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Se for a tela de login, renderiza apenas o conteúdo do login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isExpanded = isPinned || isHovered;

  const pendingCancellations = (data?.subscriptions || []).filter(
    (s: any) => s.cancellationRequested || s.cancellation_requested
  );
  const hasCancellationAlerts = pendingCancellations.length > 0;

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard Executivo',
      icon: LayoutDashboard,
      iconSrc: '/icons/nav/dashboard.png',
      badge: 'Geral',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40',
      tooltipTitle: 'Dashboard Executivo',
      tooltipDesc: 'Visão geral com gráficos, faturamento, metas e indicadores em tempo real.'
    },
    {
      href: '/admin/estudio',
      label: 'Billy Studio Web',
      icon: Sparkles,
      iconSrc: '/icons/nav/studio.png',
      badge: 'IA & MAPS ✨',
      badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 font-bold',
      tooltipTitle: 'Billy Studio Web (Master)',
      tooltipDesc: 'Busque comércios com IA, gere sites para subdomínios oficiais e acompanhe propostas de todos os operadores.'
    },
    {
      href: '/admin/sites',
      label: 'Gestão de Sites (SaaS)',
      icon: Globe,
      iconSrc: '/icons/nav/dominios.png',
      badge: (data?.subscriptions || []).length ? `${(data?.subscriptions || []).length}` : null,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
      tooltipTitle: 'Sites Ativos',
      tooltipDesc: 'Gerencie os sites gerados, edite dados do cliente, copie links de demonstração e acompanhe o status.'
    },
    {
      href: '/admin/operadores',
      label: 'Operadores & Licenças',
      icon: Users,
      iconSrc: '/icons/nav/operadores.png',
      badge: (data?.operators || []).length ? `${(data?.operators || []).length}` : null,
      badgeColor: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40',
      tooltipTitle: 'Operadores & Licenças',
      tooltipDesc: 'Aprove ou recuse candidaturas, gere seriais do app desktop e gerencie a equipe.'
    },
    {
      href: '/admin/ranking',
      label: 'Ranking & Medalhas',
      icon: Trophy,
      iconSrc: '/icons/nav/ranking.png',
      badge: 'Top 3',
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
      tooltipTitle: 'Ranking & Medalhas',
      tooltipDesc: 'Veja sua posição no ranking mensal, patentes e metas para desbloquear os troféus oficiais.'
    },
    {
      href: '/admin/financeiro',
      label: 'Financeiro & APIs',
      icon: DollarSign,
      iconSrc: '/icons/nav/financeiro.png',
      badge: 'Caixa 70/30',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
      tooltipTitle: 'Financeiro & APIs',
      tooltipDesc: 'Controle receitas totais, repasses de comissão, assinaturas Asaas e saldo líquido.'
    },
    {
      href: '/admin/parceiros',
      label: 'Parceiros & Afiliados B2B',
      icon: Sparkles,
      iconSrc: '/icons/nav/studio.png',
      badge: 'B2B',
      badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 font-bold',
      tooltipTitle: 'Parceiros & Vitrine de Afiliados',
      tooltipDesc: 'Gerencie as ferramentas recomendadas aos clientes finais com links de afiliado e contador de cliques.'
    }
  ];

  // Ações rápidas da barra inferior no Mobile
  const mobileNavItems = [
    { href: '/admin', label: 'Início', icon: LayoutDashboard },
    { href: '/admin/estudio', label: 'Studio IA', icon: Sparkles },
    { href: '/admin/sites', label: 'Sites', icon: Globe },
    { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign }
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#131317] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* =========================================================================
          CABEÇALHO SUPERIOR GLOBAL PERSISTENTE (ESTILO ARCLON)
         ========================================================================= */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#1c1d27]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 shadow-xs transition-colors duration-200">
        {/* Esquerda: Menu Mobile + Logotipo + Badge Master */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Abrir menu lateral"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-black font-mono text-base group-hover:scale-105 transition shadow-sm shadow-blue-500/20">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-wider font-mono">
                WEBBILLY
              </span>
              <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-widest font-mono">
                ADMIN MASTER
              </span>
            </div>
          </Link>
        </div>

        {/* Centro: Barra de Busca Global */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar estabelecimentos, subdomínios, licenças ou operadores..."
              className="w-full bg-slate-100/80 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] focus:border-blue-500 focus:bg-white dark:focus:bg-[#181a25] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden transition font-sans"
            />
          </div>
        </div>

        {/* Direita: Ações Globais */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alternador Nativo de Tema Light / Dark */}
          <ThemeToggle />

          {/* Botão Modo Dicas / Tooltips */}
          <TooltipsToggle />

          {/* Status Asaas Gateway */}
          <ActionTooltip
            title="Status Asaas Gateway"
            description="Indica se a integração de pagamentos Pix e cobranças está online e operando normalmente."
            side="bottom"
          >
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-[11px] font-mono text-slate-600 dark:text-slate-300 cursor-default">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Asaas Gateway</span>
            </div>
          </ActionTooltip>

          {/* Botão Tour Interativo */}
          <ActionTooltip
            title="Tour Guiado Admin"
            description="Inicia um tour interativo com instruções detalhadas sobre cada ferramenta do painel master."
            side="bottom"
          >
            <button
              onClick={() => startAdminTour()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          </ActionTooltip>

          {/* Botão Trocar Senha Master */}
          <ActionTooltip
            title="Senha Master"
            description="Altera a senha de acesso administrativo master da conta atual."
            side="bottom"
          >
            <button
              onClick={() => {
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
                setShowChangePasswordModal(true);
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Senha</span>
            </button>
          </ActionTooltip>

          {/* Sininho de Alertas Globais & Cancelamentos */}
          <ActionTooltip
            title={hasCancellationAlerts ? "Atenção: Cancelamentos Pendentes" : "Enviar Alerta Global"}
            description={hasCancellationAlerts ? `Há ${pendingCancellations.length} solicitação(ões) de cancelamento aguardando contato do Admin.` : "Dispara uma notificação instantânea para todos os operadores conectados."}
            side="bottom"
          >
            <button
              onClick={() => setShowAlertsModal(true)}
              className={`relative p-2 rounded-xl border transition cursor-pointer ${
                hasCancellationAlerts
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bell className={`w-4 h-4 ${hasCancellationAlerts ? 'text-rose-500 animate-pulse' : 'text-slate-600 dark:text-slate-300'}`} />
              {hasCancellationAlerts ? (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] flex items-center justify-center animate-bounce shadow-xs">
                  {pendingCancellations.length}
                </span>
              ) : activeAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono font-black text-[10px] flex items-center justify-center animate-pulse shadow-xs">
                  {activeAlertsCount}
                </span>
              ) : null}
            </button>
          </ActionTooltip>

          {/* Avatar Gamer do Admin Master */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-white/[0.08]">
            <ActionTooltip
              title="Perfil Admin Master"
              description="Personalize a aparência do seu avatar oficial."
              side="bottom"
            >
              <button
                onClick={() => setShowAdminAvatarModal(true)}
                className="relative rounded-full hover:ring-2 hover:ring-blue-500 transition cursor-pointer p-0.5"
              >
                <GamerAvatar
                  svg={adminUser?.avatar_svg}
                  config={adminUser?.avatar_config}
                  seed={adminUser?.name || 'Administrador Master'}
                  size={34}
                  className="ring-2 ring-blue-500/30 shadow-xs"
                />
              </button>
            </ActionTooltip>

            {/* Logout */}
            <ActionTooltip
              title="Sair do Painel Admin"
              description="Encerra a sessão administrativa master com segurança."
              side="bottom"
            >
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/25 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </ActionTooltip>
          </div>
        </div>
      </header>

      {/* Mensagem de Feedback de Ação */}
      {actionSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2 text-xs flex items-center justify-between z-30">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
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
          className={`hidden md:flex flex-col bg-white dark:bg-[#1c1d27] border-r border-slate-200 dark:border-white/[0.08] transition-all duration-300 ease-in-out shrink-0 z-30 ${
            isExpanded ? 'w-64 shadow-xl shadow-slate-200/50 dark:shadow-black/50' : 'w-20'
          }`}
        >
          {/* Topo da Sidebar: Botão de Fixar / Desfixar */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/[0.05]">
            {isExpanded && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                Menu de Gestão
              </span>
            )}
            <ActionTooltip
              title={isPinned ? 'Desafixar Sidebar' : 'Fixar Sidebar'}
              description={isPinned ? 'Permite que a barra lateral recolha automaticamente ao afastar o mouse.' : 'Fixa a barra lateral expandida permanentemente na tela.'}
              side="right"
            >
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition ml-auto cursor-pointer ${
                  isPinned ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                {isPinned ? <PinOff className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Pin className="w-4 h-4" />}
              </button>
            </ActionTooltip>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
                    className={`group relative flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                      isExpanded ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-500/30 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {isExpanded && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-xs truncate">
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
                </ActionTooltip>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar */}
          <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
            <ActionTooltip
              title="Supervisão Central"
              description="Monitoramento ativo de conexões, licenças, subdomínios e infraestrutura em tempo real."
              side="right"
              className="w-full block"
            >
              {isExpanded ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#14161f] border border-slate-200/80 dark:border-white/[0.04] space-y-0.5 cursor-default">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block font-mono">
                    Supervisão Central
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sistemas Operacionais
                  </span>
                </div>
              ) : (
                <div className="flex justify-center py-2 cursor-default">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
            </ActionTooltip>
          </div>
        </aside>

        {/* DRAWER RESPONSIVO MOBILE */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150">
            <div className="w-72 bg-white dark:bg-[#1c1d27] border-r border-slate-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono">
                    Menu Admin
                  </span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="py-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Painel Master</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* ÁREA DE CONTEÚDO PRINCIPAL (COM PADDING EXTRA NO MOBILE PARA NÃO COBRIR O BOTTOM NAV) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
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
          <span className="text-[10px]">Mais</span>
        </button>
      </div>

      {/* =========================================================================
          MODAL DE TROCA DE SENHA MASTER
         ========================================================================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Alterar Senha Master</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{adminUser?.email || 'admin@billysuite.com.br'}</span>
              </div>
            </div>

            {changePasswordError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {changePasswordError}
              </div>
            )}

            {changePasswordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                {changePasswordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Senha Atual *</label>
                <div className="relative flex items-center">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={adminCurrentPassword}
                    onChange={(e) => setAdminCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-3.5 pr-11 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    tabIndex={-1}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nova Senha Master (mínimo 8 caracteres) *</label>
                <div className="relative flex items-center">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-3.5 pr-11 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    tabIndex={-1}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Confirmar Nova Senha *</label>
                <div className="relative flex items-center">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-3.5 pr-11 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    tabIndex={-1}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
    <TooltipProvider>
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </TooltipProvider>
  );
}

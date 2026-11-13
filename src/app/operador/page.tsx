'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';
import {
  Key,
  Copy,
  Download,
  PlayCircle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  Laptop,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileText,
  Video,
  Award,
  Globe,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  X,
  Shield,
  Layers,
  ChevronRight,
  Search,
  Sparkles,
  Send,
  Calendar,
  AlertCircle,
  Trophy,
  Medal,
  Target,
  Flame,
  Users,
  Share2,
  Check,
  HelpCircle,
  Puzzle
} from 'lucide-react';
import { startOperadorTour } from '@/lib/tours';

export default function OperatorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'training' | 'sales' | 'ranking' | 'affiliates'>('overview');
  const [rankingData, setRankingData] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [activatingAffiliate, setActivatingAffiliate] = useState(false);
  const [affiliateActivationSuccess, setAffiliateActivationSuccess] = useState<string | null>(null);
  const [affiliateActivationError, setAffiliateActivationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Solicitação de Repasse Financeiro
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const handleSolicitarRepasse = async () => {
    if (!confirm('Deseja enviar a solicitação formal de repasse Pix deste mês para o departamento financeiro?')) return;
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutSuccess(null);
    try {
      const res = await fetch('/api/operador/solicitar-repasse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setPayoutSuccess(json.message || 'Solicitação de repasse enviada com sucesso! O comprovante será enviado para seu e-mail corporativo.');
      await loadData();
    } catch (err: any) {
      setPayoutError(err.message || 'Falha ao solicitar repasse.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleActivateAffiliates = async () => {
    setActivatingAffiliate(true);
    setAffiliateActivationError(null);
    setAffiliateActivationSuccess(null);
    try {
      const res = await fetch('/api/operador/afiliados/ativar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao ativar o programa.');
      setAffiliateActivationSuccess(json.message || 'Programa Billy Afiliados ativado com sucesso! Seu link exclusivo já está disponível.');
      await loadData();
    } catch (err: any) {
      setAffiliateActivationError(err.message || 'Falha ao ativar o Billy Afiliados.');
    } finally {
      setActivatingAffiliate(false);
    }
  };

  const handleCopyInviteLink = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // Troca Obrigatória de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
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
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (data && data.operator) {
          setData({
            ...data,
            operator: { ...data.operator, mustChangePassword: false }
          });
        }
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/operator/overview');
      if (res.status === 401 || res.status === 403) {
        router.push('/operador/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setData(json);
      if (json.operator?.mustChangePassword) {
        setShowPasswordModal(true);
      }
      if (json.trainingModules?.length > 0) {
        setSelectedVideo(json.trainingModules[0]);
      }

      // Carrega ranking e gamificação em tempo real
      try {
        const rankRes = await fetch('/api/operador/ranking');
        if (rankRes.ok) {
          const rankJson = await rankRes.json();
          setRankingData(rankJson);
        }
      } catch (rankErr) {
        console.warn('Falha ao carregar ranking:', rankErr);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do operador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Disparo automático do Tour Guiado no primeiro acesso
  useEffect(() => {
    if (!loading && data) {
      try {
        const hasSeenTour = localStorage.getItem('webbilly_tour_operador_v1');
        if (!hasSeenTour) {
          const timer = setTimeout(() => {
            startOperadorTour((tab) => setActiveTab(tab as any));
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [loading, data]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/operador/login');
  };

  const handleCopySerial = (tokenOrEvent?: any) => {
    const textToCopy = (typeof tokenOrEvent === 'string' ? tokenOrEvent : null) || data?.operator?.serialToken;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-300">Carregando Synadmin Painel do Operador...</span>
        </div>
      </div>
    );
  }

  const op = data?.operator;
  const stats = data?.stats;
  const license = data?.license;

  // Filtragem de Assinaturas por busca
  const filteredSubscriptions = (data?.subscriptions || []).filter((sub: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchSlug = (sub.slug || '').toLowerCase().includes(q);
    const matchClient = (sub.clientName || '').toLowerCase().includes(q);
    const matchPhone = (sub.clientPhone || '').toLowerCase().includes(q);
    return matchSlug || matchClient || matchPhone;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-zinc-100 flex font-sans antialiased select-none">
      
      {/* =========================================================================
          1. SIDEBAR LATERAL ESQUERDA FIXA (SYNADMIN ARCHITECTURE)
         ========================================================================= */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#0f121a] border-r border-white/[0.06] flex flex-col justify-between z-40">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center font-black text-emerald-400 text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">Billy Suite</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
                  {op?.id || 'OPERADOR'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Portal do Operador</p>
            </div>
          </div>

          {/* Menu de Navegação Vertical */}
          <div className="p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 py-2">
              Menu Principal
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Download className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Download do App & Guia</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                }`}>
                  v2.0.4
                </span>
              </button>

              <button
                id="tour-nav-subscriptions"
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'subscriptions'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${activeTab === 'subscriptions' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Sites Ativos (SaaS)</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'subscriptions' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('training')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'training'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${activeTab === 'training' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Área de Treinamento</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'training' ? 'bg-white/20 text-white' : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                }`}>
                  4 Aulas
                </span>
              </button>

              <button
                id="tour-nav-sales"
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'sales'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className={`w-4 h-4 ${activeTab === 'sales' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Minhas Vendas & Pix</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'sales' ? 'bg-white/20 text-white' : 'bg-emerald-950/40 text-emerald-400'
                }`}>
                  R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')}
                </span>
              </button>

              <button
                id="tour-nav-ranking"
                onClick={() => setActiveTab('ranking')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'ranking'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trophy className={`w-4 h-4 ${activeTab === 'ranking' ? 'text-amber-300' : 'text-amber-400 group-hover:text-amber-300'}`} />
                  <span>Ranking & Medalhas</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  data?.gamification?.currentMedal?.badgeBg || 'bg-amber-500/20'
                } ${data?.gamification?.currentMedal?.badgeText || 'text-amber-300'} border ${data?.gamification?.currentMedal?.badgeBorder || 'border-amber-500/30'}`}>
                  <span>{data?.gamification?.currentMedal?.icon || '🌱'}</span>
                  <span>{data?.gamification?.currentMedal?.name || 'Iniciante'}</span>
                </span>
              </button>

              <button
                id="tour-nav-affiliates"
                onClick={() => setActiveTab('affiliates')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'affiliates'
                    ? 'bg-emerald-600/90 text-white font-medium border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'affiliates' ? 'text-white' : 'text-[#84cc16] group-hover:text-lime-300'}`} />
                  <span>Billy Afiliados</span>
                </div>
                {data?.affiliates?.enabled ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40 flex items-center gap-1">
                    <span>5%</span>
                    <span>Ativo</span>
                  </span>
                ) : data?.affiliates?.eligibility?.eligible ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Liberado!
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-400">
                    Nível Bronze
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-white/[0.08] space-y-2">
          {/* Card Resumo do Serial */}
          <div className="p-2.5 rounded-xl bg-[#141824] border border-white/[0.06] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Chave Serial</span>
              <button
                onClick={handleCopySerial}
                className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="font-mono text-[11px] font-bold text-white bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800 truncate select-all">
              {op?.serialToken || 'CARREGANDO...'}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-zinc-400">Licença:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {license?.status || op?.status || 'ATIVO'}
              </span>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          CONTAINER DIREITO (HEADER STICKY + ÁREA DE CONTEÚDO PRINCIPAL)
         ========================================================================= */}
      <div className="ml-64 flex-1 flex flex-col min-w-0 min-h-screen bg-[#0a0c10]">

        {/* =========================================================================
            2. TOPBAR SUPERIOR (STICKY NO TOPO - NUNCA SOBREPÕE O CONTEÚDO)
           ========================================================================= */}
        <header
          id="tour-operador-header"
          className="sticky top-0 z-30 h-16 bg-[#0f121a]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-8 shrink-0"
        >
          {/* Barra de Pesquisa / Identificação */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, domínio slug ou dados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-9 pr-3 py-1.5 bg-[#141824] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition"
              />
            </div>
          </div>

          {/* Ações da Topbar */}
          <div className="flex items-center gap-3">
            {/* Botão Oficial do Tour Guiado */}
            <button
              onClick={() => startOperadorTour((tab) => setActiveTab(tab as any))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#a3e635] hover:text-white border border-[#84cc16]/40 transition shadow-sm cursor-pointer"
              title="Iniciar Tour Guiado Interativo do Painel do Operador"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>? Tour Guiado</span>
            </button>

            {/* Abrir Meu Webmail (@webbilly) */}
            <a
              href="https://mail.larksuite.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition shadow-sm cursor-pointer"
              title="Acessar webmail corporativo no Lark Suite"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abrir Meu Webmail (@webbilly)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Status Asaas */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Asaas v3 Conectado</span>
            </div>

            {/* Troca de Senha */}
            <button
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141824] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-emerald-500/50 transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Minha Conta / Senha</span>
            </button>

            {/* Link para Painel Master Admin se o operador for master */}
            {(data?.isMaster || op?.email === 'admin@billysuite.com.br' || op?.id === 'OP-0001') && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-500/30 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Painel Master Admin</span>
              </Link>
            )}

            {/* Medalha & Ranking Pill */}
            {data?.gamification?.currentMedal && (
              <button
                onClick={() => setActiveTab('ranking')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${data.gamification.currentMedal.badgeBg} ${data.gamification.currentMedal.badgeText} ${data.gamification.currentMedal.badgeBorder} hover:scale-105`}
                title="Ver seu progresso no Ranking e Medalhas"
              >
                <span>{data.gamification.currentMedal.icon}</span>
                <span>{data.gamification.currentMedal.name}</span>
                <span className="text-[10px] opacity-80 font-mono">#{data.gamification.rank}</span>
              </button>
            )}

            {/* Atualizar Dados */}
            <button
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Perfil Operador */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
                {op?.name?.substring(0, 2)?.toUpperCase() || 'OP'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white line-clamp-1">{op?.name || 'Operador'}</div>
                <div className="text-[10px] text-zinc-400">{op?.email || 'operador@webbilly.com.br'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            3. ÁREA DE CONTEÚDO PRINCIPAL (COM ESPAÇAMENTO RESPONSIVO PERFEITO)
           ========================================================================= */}
        <main className="px-6 lg:px-8 py-8 flex-1 overflow-x-hidden">
        
        {/* BANNER DO SERIAL TOKEN DE ATIVAÇÃO HARDWARE-LOCK */}
        <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06] mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-bold mb-2">
                <Key className="w-3.5 h-3.5" />
                Seu Token Serial Oficial do Billy Suite Desktop
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-700/80 select-all">
                  {op?.serialToken}
                </span>
                <button
                  onClick={handleCopySerial}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs transition flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Serial Copiado!' : 'Copiar Serial'}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Insira este token na tela de ativação inicial do software <strong>Billy Suite Desktop</strong> no seu computador Windows.
              </p>
            </div>

            <div className="bg-[#141824] border border-white/[0.06] rounded-xl p-4 text-xs space-y-2 shrink-0 min-w-[280px]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Status da Licença:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {license?.status || op?.status || 'ATIVO'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Computador:</span>
                <span className="font-mono text-zinc-300">{op?.machineId || 'Ainda não vinculado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Última Sincronização:</span>
                <span className="font-mono text-zinc-400">
                  {op?.lastSync ? new Date(op.lastSync).toLocaleTimeString('pt-BR') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 CARDS SYNADMIN KPI WIDGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Sites Ativos */}
          <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-sky-400">Sites Ativos (SaaS)</span>
              <div className="text-2xl font-black text-white mt-1 tracking-tight">
                {stats?.activeSubscriptionsCount ?? stats?.salesCount ?? (data?.subscriptions || []).length ?? 0} sites
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">Publicados no subdomínio</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Repasse Mensal */}
          <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">Repasse Mensal Recorrente</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
                R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">R$ 10,00/mês por cliente ativo</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Liquidado */}
          <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">Total Liquidado</span>
              <div className="text-2xl font-black text-teal-400 mt-1 tracking-tight">
                R$ {stats?.totalCommissions?.toLocaleString('pt-BR') || 0},00
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">Histórico repassado via Pix</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-teal-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Chave Pix */}
          <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Chave Pix Cadastrada</span>
              <div className="text-sm font-black text-white mt-1 truncate">
                {op?.pixKey || 'Não cadastrada'}
              </div>
              <span className="text-[11px] text-zinc-400 uppercase font-medium">{op?.pixType || 'Pix'} registrado</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-amber-400 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* =====================================================================
            SEÇÃO MODULAR: 3 GRÁFICOS ANALÍTICOS (SYNADMIN STYLE)
           ===================================================================== */}
        <DashboardCharts
          mode="operador"
          subscriptions={data?.subscriptions}
          operatorStats={stats}
        />

        {/* BANNER DE GAMIFICAÇÃO & RANKING EM TEMPO REAL */}
        {data?.gamification && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141824] via-[#11141c] to-[#141824] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-md">
                {data.gamification.currentMedal?.icon || '🌱'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Sua Medalha Oficial: <strong className="text-amber-300">{data.gamification.currentMedal?.name}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    #{data.gamification.rank} no Ranking
                  </span>
                  {data.gamification.hasMedalUpgradeBonus && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      ✨ +20% Bônus Ativo!
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pontuação: <strong className="text-white font-mono">{data.gamification.rankingScore} pts</strong> ({data.gamification.activeRecurringCount} clientes ativos • {data.gamification.monthlyDomainSalesCount} domínios no mês)
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('ranking')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-2 shrink-0 group"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              <span>Ver Ranking Completo</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        )}

        {/* =========================================================================
            ABA 1: DOWNLOAD DO INSTALADOR E GUIA RÁPIDO
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* =========================================================================
                CARD CENTRAL DE DOWNLOADS & FERRAMENTAS OFICIAIS
               ========================================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#11141c] via-[#141824] to-[#0d1017] border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ferramentas de Trabalho do Operador</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Central Oficial de Downloads</h2>
                  <p className="text-xs text-zinc-400">
                    Seu ecossistema completo para prospecção, geração de sites IA e comunicação corporativa.
                  </p>
                </div>

                {/* Bloco de Chave Serial do Operador */}
                <div className="p-4 rounded-2xl bg-[#0a0d14] border border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">
                      Seu Serial de Ativação Desktop
                    </span>
                    <span className="text-sm sm:text-base font-black font-mono text-[#84cc16] tracking-wider block mt-0.5">
                      {op?.serialToken || 'Carregando serial...'}
                    </span>
                  </div>
                  {op?.serialToken && (
                    <button
                      onClick={() => handleCopySerial(op.serialToken)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#84cc16] border border-[#84cc16]/30 flex items-center gap-1.5 transition cursor-pointer"
                      title="Copiar Chave Serial para Ativação no Programa Desktop"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Botões / Cards Oficiais de Download */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Programa Desktop Billy */}
                <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Programa Desktop Billy</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Software Windows com Scraper Google Maps, Gemini IA e geração instantânea de sites. Ativação direta apenas com seu Serial.
                      </p>
                    </div>
                  </div>

                  <a
                    href={process.env.NEXT_PUBLIC_BILLY_DESKTOP_DOWNLOAD_URL || data?.installer?.downloadUrl || '/downloads/billy-setup.exe'}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Programa (.exe)</span>
                  </a>
                </div>

                {/* 2. Extensão Chrome WhatsApp */}
                <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-[#84cc16]/30 transition group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/25 text-[#84cc16] flex items-center justify-center group-hover:scale-105 transition">
                      <Puzzle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Extensão Chrome (WhatsApp)</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Extensão para WhatsApp Web com 60 scripts persuasivos e automação de envio de links de demonstração e propostas.
                      </p>
                    </div>
                  </div>

                  <a
                    href={process.env.NEXT_PUBLIC_BILLY_EXTENSION_DOWNLOAD_URL || data?.extension?.downloadUrl || '/downloads/billy-extension.zip'}
                    download="billy-extension.zip"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[#a3e635] hover:text-white bg-[#16201a] hover:bg-[#84cc16] hover:text-zinc-950 transition border border-[#84cc16]/40 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-950/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Extensão (.zip)</span>
                  </a>
                </div>

                {/* 3. Lark Mail Corporativo */}
                <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Lark Mail (@webbilly)</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Sua caixa de e-mail corporativo oficial. Use seu endereço <strong className="text-cyan-300 font-mono text-[11px]">{op?.corporate_email || 'seu.nome@webbilly.com.br'}</strong> e sua senha pessoal.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a
                      href="https://mail.larksuite.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 transition border border-cyan-800/40 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Webmail Direto</span>
                    </a>
                    <a
                      href="https://www.larksuite.com/download"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl font-medium text-[11px] text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar App Lark Desktop / Mobile</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Guia Rápido de Instalação */}
            <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06]">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Passo a Passo de Instalação & Ativação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">1</span>
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">Baixe e execute o instalador Desktop:</strong>
                    Faça o download do <code className="text-emerald-300 font-mono">Billy-Suite-Setup.exe</code> e conclua a instalação no Windows 10/11.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-teal-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">2</span>
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">Insira o Token Serial recebido:</strong>
                    Cole sua chave de ativação oficial <code className="text-emerald-300 font-bold font-mono">{op?.serialToken}</code> para desbloquear o sistema.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">3</span>
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">Instale a Extensão no WhatsApp Web:</strong>
                    Baixe o <code className="text-amber-300 font-mono">Billy-Extensao-Chrome.zip</code>, descompacte a pasta, abra <code className="text-zinc-200 font-mono">chrome://extensions</code>, ative o Modo Desenvolvedor e clique em "Carregar sem compactação".
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">4</span>
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">Gere sites e fature suas comissões:</strong>
                    Cada site fica online no subdomínio oficial <code className="text-sky-300 font-mono font-bold">slug.webbilly.com.br</code> com R$ 10,00/mês de comissão recorrente e 30% (R$ 147) nas vendas de Domínio Próprio.
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dúvidas técnicas? Acesse a aba de <strong>Treinamento</strong> para assistir à aula em vídeo.</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: SITES ATIVOS (ASSINATURAS SAAS R$ 29,90)
           ========================================================================= */}
        {activeTab === 'subscriptions' && (
          <div id="tour-operador-propostas" className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Seus Clientes no Modelo SaaS Recorrente
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  Cada cliente ativo gera <strong>R$ 10,00/mês</strong> de comissão recorrente repassada para sua chave Pix.
                </p>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                MRR Atual: <strong className="text-emerald-400 font-bold">R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00 / mês</strong>
              </div>
            </div>

            <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3.5 px-4">Subdomínio Oficial</th>
                      <th className="py-3.5 px-4">Cliente / Estabelecimento</th>
                      <th className="py-3.5 px-4">WhatsApp</th>
                      <th className="py-3.5 px-4">Mensalidade</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredSubscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum cliente ativo no momento. Dispare demonstrações no Billy Desktop com o link de checkout!
                        </td>
                      </tr>
                    ) : (
                      filteredSubscriptions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition duration-150">
                          <td className="py-3.5 px-4 font-mono">
                            <a
                              href={`https://${sub.slug}.webbilly.com.br`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sky-400 hover:underline flex items-center gap-1.5"
                            >
                              <span>{sub.slug}.webbilly.com.br</span>
                              <ExternalLink className="w-3 h-3 text-sky-400" />
                            </a>
                            <span className="text-[10px] text-zinc-500">ID: {sub.id}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{sub.clientName}</span>
                            <span className="text-[11px] text-zinc-400">{sub.planName || 'Assinatura Mensal'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {sub.clientPhone || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-white font-bold">R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}/mês</span>
                            <span className="text-[10px] text-emerald-400 block font-semibold">+R$ {(sub.operatorCommissionMonthly ?? 10.00).toFixed(2)} repasse</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                sub.status === 'active'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : sub.status === 'suspended'
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              }`}
                            >
                              {sub.status === 'active' ? '● No Ar (Ativo)' : sub.status === 'suspended' ? '● Suspenso (Inadimplente)' : '● Pendente'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://webbilly.com.br/api/subscription/create-checkout?slug=${sub.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-zinc-800 text-white font-medium text-[11px] transition border border-white/[0.08]"
                                title="Link de Pagamento / Assinatura"
                              >
                                Link Checkout
                              </a>
                              <a
                                href={`https://${sub.slug}.webbilly.com.br`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30"
                                title="Ver Site Online"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: ÁREA DE TREINAMENTO COM PLAYER DE VÍDEO
           ========================================================================= */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player do Vídeo Selecionado */}
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl relative">
                  {selectedVideo ? (
                    <iframe
                      src={selectedVideo.videoUrl}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                      Selecione uma aula na grade ao lado para iniciar a reprodução.
                    </div>
                  )}
                </div>

                {selectedVideo && (
                  <div className="p-6 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white">{selectedVideo.title}</h2>
                      <span className="text-xs font-mono text-zinc-400 bg-[#141824] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                        {selectedVideo.duration}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {selectedVideo.description}
                    </p>

                    {selectedVideo.downloadAttachment && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>Material de Apoio: <strong>{selectedVideo.downloadAttachment}</strong></span>
                        </div>
                        <button
                          onClick={() => alert('Download do material iniciado.')}
                          className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-zinc-800 text-xs text-white transition flex items-center gap-1.5 border border-white/[0.08]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar Anexo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Playlist de Aulas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Grade Curricular do Operador
                </h3>

                {(data?.trainingModules || []).map((mod: any) => {
                  const isCurrent = selectedVideo?.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedVideo(mod)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                          : 'bg-[#11141c] border-white/[0.06] text-zinc-400 hover:bg-[#141824] hover:text-zinc-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCurrent ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{mod.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {mod.duration}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: MINHAS VENDAS & EXTRATO PIX
           ========================================================================= */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Card de Solicitação de Repasse Mensal */}
            {/* Card de Solicitação de Repasse Mensal & Regras Oficiais */}
            {(() => {
              const rules = data?.payoutRules;
              const now = new Date();
              const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
              const currentMonthRef = rules?.currentMonthRef || `${meses[now.getMonth()]} de ${now.getFullYear()}`;
              const corporateEmail = op?.email?.toLowerCase().endsWith('@webbilly.com.br')
                ? op.email.toLowerCase()
                : `${op?.name ? op.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') : 'operador'}@webbilly.com.br`;

              const activeSubsCount = stats?.activeSubscriptionsCount || (data?.subscriptions || []).filter((s: any) => s.status === 'active').length || 0;
              const monthsAccumulated = rules?.monthsAccumulated || 1;
              const hasRequestedThisMonth = rules?.hasRequestedThisMonth ?? (data?.payoutRequests || []).some((p: any) => {
                const d = new Date(p.requestedAt);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              });

              const nextUnlockFormatted = rules?.nextUnlockFormatted || `01/${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}/${now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()}`;
              const nextUnlockFull = rules?.nextUnlockFull || `1º de ${meses[(now.getMonth() + 1) % 12]} de ${now.getMonth() + 1 > 11 ? now.getFullYear() + 1 : now.getFullYear()}`;

              // R$ 10,00 por plano vendido/ativo de R$ 29,90/mês
              const planPrice = 29.90;
              const commissionPerPlan = 10.00;
              const totalFaturado = activeSubsCount * planPrice * monthsAccumulated;
              const breakdown = rules?.breakdown;
              const saldoLiquidoRepasse = breakdown?.total ?? rules?.accumulatedRepasse ?? ((activeSubsCount * commissionPerPlan * monthsAccumulated) + (stats?.pendingCommissions || 0));

              const currentPayout = rules?.currentMonthPayout || (data?.payoutRequests || []).find((p: any) => {
                const d = new Date(p.requestedAt);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              });
              const isPending = currentPayout?.status === 'PENDENTE';
              const isPaid = currentPayout?.status === 'PAGO';

              return (
                <div className="space-y-4">
                  {/* Card Principal de Repasse */}
                  <div id="tour-operador-repasse" className="p-6 rounded-2xl bg-gradient-to-br from-[#111927] to-[#0f141d] border border-emerald-500/30 relative overflow-hidden shadow-xl">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            Repasse Mensal • R$ 10,00 por Plano Ativo
                          </div>

                          {monthsAccumulated > 1 && !hasRequestedThisMonth && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-bold animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Saldo Acumulado de {monthsAccumulated} meses!</span>
                            </div>
                          )}

                          {hasRequestedThisMonth && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                              <span>Solicitação de {currentMonthRef} Realizada</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-white tracking-tight">
                          Solicitação de Repasse Pix — <span className="capitalize text-emerald-400">{currentMonthRef}</span>
                        </h3>
                        
                        {/* Grid de Resumo Calculado (Exato: R$ 10,00 por plano de R$ 29,90) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Planos Ativos</span>
                            <span className="text-lg font-black text-white font-mono">{activeSubsCount} clientes</span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">R$ 29,90/mês cada</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                              Total Faturado {monthsAccumulated > 1 && !hasRequestedThisMonth ? `(${monthsAccumulated}m)` : ''}
                            </span>
                            <span className="text-lg font-black text-zinc-200 font-mono">
                              R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">Mensalidades clientes</span>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                              Seu Repasse {monthsAccumulated > 1 && !hasRequestedThisMonth ? `(${monthsAccumulated} meses)` : ''}
                            </span>
                            <span className="text-lg font-black text-emerald-300 font-mono">
                              R$ {saldoLiquidoRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Total acumulado a receber</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Chave Pix Destino</span>
                            <span className="text-xs font-mono font-bold text-amber-300 truncate block select-all" title={op?.pixKey || 'Não cadastrada'}>
                              {op?.pixKey || 'Não cadastrada'}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">Tipo: {op?.pixType?.toUpperCase() || 'CPF'}</span>
                          </div>
                        </div>

                        {/* Composição Detalhada do Repasse */}
                        {breakdown && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                              <span className="text-[10px] text-zinc-400 block">Assinaturas Recorrentes</span>
                              <span className="text-sm font-bold text-white font-mono">
                                R$ {(breakdown.recurring || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                              <span className="text-[10px] text-zinc-400 block">Vendas Diretas (30%)</span>
                              <span className="text-sm font-bold text-sky-400 font-mono">
                                R$ {(breakdown.direct || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                              <span className="text-[10px] text-zinc-400 block">Bônus Medalha (+20%)</span>
                              <span className="text-sm font-bold text-amber-400 font-mono">
                                R$ {(breakdown.medalBonus || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                              <span className="text-[10px] text-zinc-400 block">Billy Afiliados (5%)</span>
                              <span className="text-sm font-bold text-[#84cc16] font-mono">
                                R$ {(breakdown.affiliates || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-4 pt-1">
                          <span>Comprovante enviado para: <strong className="text-sky-400 font-mono">{corporateEmail}</strong></span>
                          <span>Chave Pix: <strong className="text-emerald-400 font-mono">{op?.pixKey || 'Não cadastrada'} ({op?.pixType?.toUpperCase() || 'CPF'})</strong></span>
                        </div>
                      </div>

                      {/* Botão de Solicitação com Validação de Mês Civil */}
                      <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto shrink-0">
                        <button
                          onClick={handleSolicitarRepasse}
                          disabled={payoutLoading || saldoLiquidoRepasse <= 0 || hasRequestedThisMonth}
                          className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition shadow-lg flex items-center justify-center gap-2 ${
                            hasRequestedThisMonth
                              ? 'bg-zinc-800 text-zinc-400 border border-white/[0.08] cursor-not-allowed shadow-none'
                              : saldoLiquidoRepasse <= 0
                              ? 'bg-zinc-800/80 text-zinc-500 border border-white/[0.06] cursor-not-allowed shadow-none'
                              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 cursor-pointer'
                          }`}
                        >
                          {payoutLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Enviando ao Financeiro...</span>
                            </>
                          ) : hasRequestedThisMonth ? (
                            isPaid ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Repasse Pago Neste Mês</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 text-amber-400" />
                                <span>Solicitação deste Mês Enviada</span>
                              </>
                            )
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Solicitar Repasse de R$ {saldoLiquidoRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </>
                          )}
                        </button>

                        {/* Aviso Explícito de Liberação Próximo Mês */}
                        {hasRequestedThisMonth ? (
                          <div className="text-[11px] text-amber-300/90 font-medium bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl text-center lg:text-right max-w-xs">
                            🔒 <strong>1 solicitação por mês civil.</strong> Sua próxima solicitação estará liberada a partir de <strong>{nextUnlockFull}</strong> ({nextUnlockFormatted}).
                          </div>
                        ) : saldoLiquidoRepasse <= 0 ? (
                          <span className="text-[11px] text-zinc-500">
                            Nenhum saldo pendente a repassar no momento.
                          </span>
                        ) : monthsAccumulated > 1 ? (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            ✓ Montante acumulado de {monthsAccumulated} meses liberado para resgate!
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">
                            ✓ 1 solicitação permitida neste mês civil ({currentMonthRef}).
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mensagem de Feedback */}
                    {payoutSuccess && (
                      <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{payoutSuccess}</span>
                      </div>
                    )}
                    {payoutError && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{payoutError}</span>
                      </div>
                    )}
                  </div>

                  {/* Card de Regras Oficiais Explícitas para o Operador */}
                  <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/[0.08] space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Regulamento & Regras Oficiais de Repasse de Comissões</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                      {/* Regra 1: Valor Fixo */}
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <DollarSign className="w-4 h-4 shrink-0" />
                          <span>R$ 10,00 por Plano de R$ 29,90</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                          Para cada comércio que você colocar no ar pelo plano oficial de <strong>R$ 29,90/mês</strong>, você recebe <strong>R$ 10,00 todos os meses</strong> de comissão líquida recorrente enquanto o cliente estiver ativo.
                        </p>
                      </div>

                      {/* Regra 2: 1x por Mês */}
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center gap-2 text-sky-400 font-bold">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Apenas 1 Solicitação por Mês</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                          O repasse pode ser solicitado <strong>apenas uma vez a cada mês civil</strong>. Uma vez enviada a solicitação, o próximo repasse só será liberado automaticamente após o <strong>1º dia do mês seguinte</strong>.
                        </p>
                      </div>

                      {/* Regra 3: Acúmulo Contínuo */}
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <TrendingUp className="w-4 h-4 shrink-0" />
                          <span>Saldo 100% Acumulativo</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                          Caso você não solicite o repasse em determinado mês, o seu saldo <strong>não expira</strong>. Ele continua acumulando mês a mês (R$ 10/plano) para você resgatar o valor total quando desejar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Chave Pix Cadastrada para Recebimento
                </span>
                <div className="text-sm font-mono text-white mt-1">
                  Tipo: <strong className="uppercase">{op?.pixType || 'CPF'}</strong> • Chave: <strong className="text-emerald-400">{op?.pixKey || 'Não cadastrada'}</strong>
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Pagamentos repassados via Pix diretamente na confirmação do cliente.
              </div>
            </div>

            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3.5 px-4">Data / ID Venda</th>
                      <th className="py-3.5 px-4">Cliente / Estabelecimento</th>
                      <th className="py-3.5 px-4">Nicho</th>
                      <th className="py-3.5 px-4">Valor Total</th>
                      <th className="py-3.5 px-4">Sua Comissão</th>
                      <th className="py-3.5 px-4 text-right">Status do Pix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {(data?.sales || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Você ainda não registrou vendas. Abra o app Billy Suite Desktop e gere suas primeiras propostas!
                        </td>
                      </tr>
                    ) : (
                      (data?.sales || []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition duration-150">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-white">{s.id}</span>
                            <div className="text-[11px] text-zinc-500">
                              {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{s.clientName}</div>
                            {s.siteUrl && (
                              <a
                                href={s.siteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1"
                              >
                                Ver Site Entregue <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">{s.niche || 'Geral'}</td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">
                            R$ {s.saleValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-400 font-mono text-sm">
                            R$ {s.commissionValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.pixStatus === 'PAGO'
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                              }`}
                            >
                              {s.pixStatus === 'PAGO' ? 'Comissão Paga via Pix' : 'Aguardando Pagamento Pix'}
                            </span>
                            {s.pixProof && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Compr: {s.pixProof}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 5: RANKING & MEDALHAS DA EQUIPE (GAMIFICAÇÃO)
           ========================================================================= */}
        {activeTab === 'ranking' && (
          <div id="tour-operador-gamificacao" className="space-y-6">
            {/* 1. Header com Título e Data de Referência */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                  <Trophy className="w-3.5 h-3.5" />
                  Gamificação & Reconhecimento Oficial
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Ranking em Tempo Real & Medalhas
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Ciclo Ativo: <strong className="text-white">{data?.payoutRules?.currentMonthRef || 'Novembro de 2026'}</strong> • Atualizado instantaneamente a cada novo cliente
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Sua Classificação</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    #{data?.gamification?.rank || 1} <span className="text-xs text-zinc-500 font-normal">de {data?.gamification?.totalOperators || 4}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Card Principal de Status Pessoal do Operador */}
            {(() => {
              const g = data?.gamification;
              const medal = g?.currentMedal || {
                name: 'Iniciante',
                icon: '🌱',
                level: 0,
                badgeBg: 'bg-zinc-800',
                badgeText: 'text-zinc-400',
                badgeBorder: 'border-zinc-700',
                description: 'Construa sua carteira rumo ao Bronze'
              };
              const nextMedal = g?.nextMedal;
              const hasBonus = g?.hasMedalUpgradeBonus;
              const bonusAmount = g?.medalUpgradeBonusAmount || 0;

              return (
                <div className="space-y-6">
                  {/* Banner de Bônus de +20% se conquistado */}
                  {hasBonus ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-amber-950/40 to-emerald-950/60 border border-amber-500/40 shadow-xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-amber-500/20">
                            🎉
                          </div>
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider mb-1">
                              <Sparkles className="w-3 h-3" />
                              Bônus de Subida de Medalha Destravado!
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              Parabéns! Você subiu de medalha e ganhou +20% DE BÔNUS!
                            </h3>
                            <p className="text-xs text-zinc-300 mt-0.5">
                              Você atingiu a <strong className="text-amber-300">{medal.name}</strong> e destravou um bônus de <strong className="text-emerald-400 font-mono">+R$ {bonusAmount.toFixed(2).replace('.', ',')}</strong> que já está incluído no seu repasse Pix mensal!
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center shrink-0">
                          <div className="text-[10px] uppercase font-bold text-amber-300">+20% Adicionado</div>
                          <div className="text-lg font-black text-amber-400 font-mono">
                            +R$ {bonusAmount.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center gap-3 text-xs text-zinc-300">
                      <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <strong className="text-white">Regra do Bônus Financeiro de +20%:</strong> Suba de medalha neste mês (ex: Iniciante ➔ Bronze, Bronze ➔ Prata, etc.) e ganhe automaticamente um <span className="text-emerald-400 font-bold">bônus extra de +20%</span> sobre o total de todos os seus repasses e ganhos do mês!
                      </div>
                    </div>
                  )}

                  {/* Grid de 3 Cards: Medalha Atual / Score & Posição / Próxima Conquista */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Medalha Atual */}
                    <div className={`p-5 rounded-2xl border ${medal.badgeBorder} ${medal.badgeBg} flex flex-col justify-between relative overflow-hidden backdrop-blur-sm`}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Sua Medalha Atual</span>
                          <span className="text-2xl">{medal.icon}</span>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          <span>{medal.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${medal.badgeText} bg-black/40 border border-white/10`}>
                            Nível {medal.level}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                          {medal.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Ganhos Base Mês:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {(g?.monthlyBaseEarnings || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Pontuação Geral no Ranking */}
                    <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Pontuação de Ranking</span>
                          <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-3xl font-black text-white font-mono tracking-tight">
                          {g?.rankingScore || 0} <span className="text-sm font-sans font-normal text-zinc-400">pts</span>
                        </div>
                        <div className="space-y-1.5 mt-3 text-xs text-zinc-400">
                          <div className="flex justify-between">
                            <span>Assinantes Ativos (1 pt cada):</span>
                            <strong className="text-white font-mono">{g?.activeRecurringCount || 0} pts</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Domínios R$ 490 no mês (10 pts cada):</span>
                            <strong className="text-amber-400 font-mono">{(g?.monthlyDomainSalesCount || 0) * 10} pts</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500">
                        * Pontuação oficial calculada com base na carteira e fechamentos do mês.
                      </div>
                    </div>

                    {/* Card 3: Metas para Próxima Medalha */}
                    <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Próximo Nível</span>
                          <Target className="w-5 h-5 text-emerald-400" />
                        </div>

                        {nextMedal ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{nextMedal.icon}</span>
                              <span className="text-sm font-bold text-white">Rumo à Medalha {nextMedal.name}</span>
                            </div>

                            {/* Barra 1: Assinantes Ativos */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-400">Assinantes Ativos:</span>
                                <span className="font-mono text-white font-bold">
                                  {g?.activeRecurringCount || 0} / {nextMedal.minRecurring}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${g?.recurringProgressPercent || 0}%` }}
                                />
                              </div>
                              {(g?.recurringNeededForNext ?? 0) > 0 && (
                                <div className="text-[10px] text-emerald-400 font-medium">
                                  Faltam apenas {g?.recurringNeededForNext} assinante{g?.recurringNeededForNext > 1 ? 's' : ''} ativo{g?.recurringNeededForNext > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>

                            {/* Barra 2: Domínios no Mês */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-400">Domínios Próprios no Mês:</span>
                                <span className="font-mono text-white font-bold">
                                  {g?.monthlyDomainSalesCount || 0} / {nextMedal.minMonthlyDomainSales}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${g?.domainProgressPercent || 0}%` }}
                                />
                              </div>
                              {(g?.domainNeededForNext ?? 0) > 0 && (
                                <div className="text-[10px] text-amber-400 font-medium">
                                  Falta{g?.domainNeededForNext > 1 ? 'm' : ''} {g?.domainNeededForNext} venda{g?.domainNeededForNext > 1 ? 's' : ''} de Domínio Próprio
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <div className="text-3xl mb-2">💎</div>
                            <div className="text-sm font-bold text-rose-400">Nível Máximo Conquistado!</div>
                            <p className="text-xs text-zinc-400 mt-1">Você é o topo da equipe com a Medalha de Rubi.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-zinc-500">
                        * Exige atingir AMBAS as metas (assinantes e domínios)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Tabela Oficial de Regras das Medalhas (Metas Claras) */}
            <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tabela Oficial de Metas & Medalhas Webbilly
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bronze */}
                <div className="p-4 rounded-xl bg-[#141824] border border-orange-600/30 hover:border-orange-500/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <span>🥉</span> Bronze (Nível 1)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-300 font-mono font-bold">
                      Marco 1
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300 mt-3">
                    <div>• <strong>10+</strong> Assinantes Ativos</div>
                    <div>• <strong>1+</strong> Domínio no Mês</div>
                    <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
                  </div>
                </div>

                {/* Prata */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-400/30 hover:border-slate-300/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>🥈</span> Prata (Nível 2)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 font-mono font-bold">
                      Consistência
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300 mt-3">
                    <div>• <strong>35+</strong> Assinantes Ativos</div>
                    <div>• <strong>5+</strong> Domínios no Mês</div>
                    <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
                  </div>
                </div>

                {/* Ouro */}
                <div className="p-4 rounded-xl bg-[#141824] border border-amber-500/30 hover:border-amber-400/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🥇</span> Ouro (Nível 3)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                      Elite
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300 mt-3">
                    <div>• <strong>50+</strong> Assinantes Ativos</div>
                    <div>• <strong>15+</strong> Domínios no Mês</div>
                    <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
                  </div>
                </div>

                {/* Rubi */}
                <div className="p-4 rounded-xl bg-[#141824] border border-rose-500/30 hover:border-rose-400/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <span>💎</span> Rubi (Nível 4)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                      Máximo
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300 mt-3">
                    <div>• <strong>100+</strong> Assinantes Ativos</div>
                    <div>• <strong>25+</strong> Domínios no Mês</div>
                    <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Leaderboard Oficial em Tempo Real da Equipe */}
            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Classificação Geral da Equipe (Ao Vivo)</h3>
                    <p className="text-xs text-zinc-400">Nomes de colegas mascarados para conformidade e privacidade interna.</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {rankingData?.leaderboard?.length || 4} Operadores Ativos
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#0e1118] text-[10px] uppercase font-bold text-zinc-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4 text-center">Posição</th>
                      <th className="py-3 px-4">Colaborador / Operador</th>
                      <th className="py-3 px-4">Medalha</th>
                      <th className="py-3 px-4 text-center">Assinantes Ativos</th>
                      <th className="py-3 px-4 text-center">Domínios no Mês</th>
                      <th className="py-3 px-4 text-right">Score Oficial</th>
                      <th className="py-3 px-4 text-right">Status do Bônus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(rankingData?.leaderboard || []).map((row: any) => {
                      const isMe = row.isCurrentUser;
                      const isTop1 = row.rank === 1;
                      const isTop2 = row.rank === 2;
                      const isTop3 = row.rank === 3;

                      return (
                        <tr
                          key={row.operatorId}
                          className={`transition ${
                            isMe
                              ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500 font-semibold'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs font-mono ${
                              isTop1
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/20'
                                : isTop2
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                                : isTop3
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-600/40'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${row.rank}`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isMe ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                                {row.displayName}
                              </span>
                              {isMe && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                                  Você
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${row.medal?.badgeBg || 'bg-zinc-800'} ${row.medal?.badgeText || 'text-zinc-400'} ${row.medal?.badgeBorder || 'border-zinc-700'}`}>
                              <span>{row.medal?.icon || '🌱'}</span>
                              <span>{row.medal?.name || 'Iniciante'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                            {row.activeRecurringCount} <span className="text-[10px] text-zinc-500 font-normal">clientes</span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                            {row.monthlyDomainSalesCount} <span className="text-[10px] text-zinc-500 font-normal">vendas</span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-black text-white text-sm">
                            {row.rankingScore} <span className="text-[10px] text-zinc-500 font-normal">pts</span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {row.hasMedalUpgradeBonus ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Sparkles className="w-2.5 h-2.5" />
                                +20% Bônus
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 6: BILLY AFILIADOS (PROGRAMA DE PARCEIROS & REDE)
           ========================================================================= */}
        {activeTab === 'affiliates' && (
          <div id="tour-operador-afiliados" className="space-y-6">
            {/* Header com Título e Conceito */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#a3e635] text-xs font-bold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Expansão de Rede • Billy Afiliados
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Programa Billy Afiliados
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Ganhe <strong className="text-[#a3e635]">5% (R$ 24,50)</strong> sobre cada pacote de Domínio Próprio + Site Completo (R$ 490,00) vendido pelos seus indicados diretos.
                </p>
              </div>

              {data?.affiliates?.enabled && (
                <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Seu Código Ativo</div>
                  <div className="text-base font-black text-[#a3e635] font-mono tracking-wider">
                    {data?.affiliates?.code || `BILLY-${op?.id || 'OP'}`}
                  </div>
                </div>
              )}
            </div>

            {/* Mensagens de Sucesso ou Erro na Ativação */}
            {affiliateActivationSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{affiliateActivationSuccess}</span>
              </div>
            )}
            {affiliateActivationError && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{affiliateActivationError}</span>
              </div>
            )}

            {/* =========================================================================
                CASO 1: BLOQUEADO (INICIANTE / NÃO ATINGIU BRONZE)
               ========================================================================= */}
            {!data?.affiliates?.enabled && !data?.affiliates?.eligibility?.eligible && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#0f121a] border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Billy Afiliados Bloqueado • Requisito Mínimo: Nível Bronze
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Para garantir a excelência na formação de novos operadores, o programa de afiliação é liberado a partir do Nível Bronze (10 clientes ativos de R$ 29,90/mês e 1 venda de domínio no mês).
                      </p>
                    </div>
                  </div>

                  {/* Dual Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Meta 1: Assinantes Ativos */}
                    {(() => {
                      const cur = data?.affiliates?.eligibility?.activeRecurringCount || 0;
                      const goal = 10;
                      const pct = Math.min(100, Math.round((cur / goal) * 100));
                      const remaining = Math.max(0, goal - cur);
                      return (
                        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">1. Clientes Recorrentes Ativos</span>
                            <span className="font-mono font-bold text-emerald-400">{cur}/{goal}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {remaining === 0 ? (
                              <span className="text-emerald-400 font-bold">✓ Meta concluída!</span>
                            ) : (
                              <span>Faltam <strong className="text-white">{remaining}</strong> clientes de R$ 29,90 para desbloquear.</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Meta 2: Vendas de Domínio no Mês */}
                    {(() => {
                      const cur = data?.affiliates?.eligibility?.monthlyDomainSalesCount || 0;
                      const goal = 1;
                      const pct = cur >= goal ? 100 : 0;
                      return (
                        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-300">2. Vendas de Domínio no Mês</span>
                            <span className="font-mono font-bold text-amber-400">{cur}/{goal}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {cur >= goal ? (
                              <span className="text-emerald-400 font-bold">✓ Meta do mês concluída!</span>
                            ) : (
                              <span>Falta <strong className="text-white">1</strong> venda de Domínio Próprio (R$ 490) neste mês.</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Explicativo de Como Funciona */}
                <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
                    <span>Como Funciona o Programa Billy Afiliados</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                      <strong className="text-white block font-semibold">1. Convide Novos Operadores</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        Ao atingir o Nível Bronze, você recebe um link exclusivo. Candidatos que se cadastrarem por ele ficam vinculados a você perpetuamente.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                      <strong className="text-[#a3e635] block font-semibold">2. Ganhe 5% em Cada Domínio</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        Cada venda de Site Completo + Domínio Próprio (R$ 490,00) confirmada por seus indicados gera <strong>R$ 24,50 líquidos</strong> direto para você.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                      <strong className="text-amber-300 block font-semibold">3. Repasse Integrado no Pix</strong>
                      <p className="text-zinc-400 leading-relaxed">
                        As comissões de afiliados entram automaticamente no seu saldo a resgatar e são pagas junto com o repasse mensal da plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                CASO 2: ELEGÍVEL (BRONZE+ MAS AINDA NÃO ATIVADO)
               ========================================================================= */}
            {!data?.affiliates?.enabled && data?.affiliates?.eligibility?.eligible && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121c10] via-[#0f141d] to-[#121c10] border border-[#84cc16]/40 shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-[#84cc16]/20">
                  🎉
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84cc16]/20 text-[#a3e635] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Nível Bronze Conquistado!
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Você está elegível para se tornar um Padrinho Billy Afiliados!
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-lg mx-auto">
                    Parabéns pelo seu desempenho! Ative seu programa de afiliação agora para gerar seu link exclusivo e faturar <strong className="text-[#a3e635]">5% (R$ 24,50)</strong> em cada pacote de domínio vendido pela sua rede de operadores parceiros.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleActivateAffiliates}
                    disabled={activatingAffiliate}
                    className="py-3.5 px-8 rounded-2xl font-bold text-sm text-black bg-[#84cc16] hover:bg-[#a3e635] transition shadow-lg shadow-[#84cc16]/30 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                  >
                    {activatingAffiliate ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Ativando Billy Afiliados...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Ativar Billy Afiliados Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                CASO 3: ATIVO (PROGRAMA ATIVADO • LINK + CARDS + GRÁFICO + TABELA)
               ========================================================================= */}
            {data?.affiliates?.enabled && (
              <div className="space-y-6">
                {/* Box de Convite e Link Exclusivo */}
                {(() => {
                  const code = data?.affiliates?.code || `BILLY-${op?.id || 'OP'}`;
                  const inviteUrl = data?.affiliates?.inviteUrl || `https://webbilly.com.br/?ref=${code}#trabalhe-aqui`;
                  const shareText = encodeURIComponent(
                    `Olá! Estou trabalhando como parceiro oficial na plataforma Webbilly e convido você para a equipe. Acesse pelo meu link oficial e faça sua inscrição para começar:\n\n${inviteUrl}`
                  );
                  const whatsappShareUrl = `https://wa.me/?text=${shareText}`;

                  return (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c10] to-[#0f141d] border border-[#84cc16]/30 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#84cc16]/20 text-[#a3e635] text-[11px] font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            Link Exclusivo de Indicação
                          </div>
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            Convide operadores e lucre com as vendas da sua rede
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyInviteLink(inviteUrl)}
                            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-[#84cc16] hover:bg-[#a3e635] text-black transition flex items-center gap-1.5 shadow-md shadow-[#84cc16]/20 cursor-pointer"
                          >
                            {copiedInvite ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={whatsappShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between gap-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                        <span className="truncate">{inviteUrl}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0 font-sans">
                          Código: <strong className="text-[#a3e635] font-mono">{code}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 4 Cards de Métricas de Afiliados */}
                {(() => {
                  const m = data?.affiliates?.metrics || {};
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Card 1: Total Convidados */}
                      <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Total Indicados</span>
                        <div className="text-2xl font-black text-white font-mono">
                          {m.totalInvited || 0}
                        </div>
                        <span className="text-[11px] text-zinc-500 block">Cadastrados via link</span>
                      </div>

                      {/* Card 2: Indicados Vendendo no Mês */}
                      <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Vendendo no Mês</span>
                        <div className="text-2xl font-black text-sky-400 font-mono">
                          {m.activeSellingThisMonth || 0}
                        </div>
                        <span className="text-[11px] text-zinc-500 block">Com ao menos 1 venda</span>
                      </div>

                      {/* Card 3: Vendas de Domínio da Rede no Mês */}
                      <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Vendas de Domínio (Mês)</span>
                        <div className="text-2xl font-black text-amber-400 font-mono">
                          {m.monthlyDomainSalesFromNetwork || 0}
                        </div>
                        <span className="text-[11px] text-zinc-500 block">Pacotes de R$ 490 pela rede</span>
                      </div>

                      {/* Card 4: Ganhos Acumulados */}
                      <div className="p-5 rounded-2xl bg-[#11141c] border border-[#84cc16]/30 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#a3e635]">Ganhos de Afiliado</span>
                        <div className="text-2xl font-black text-[#a3e635] font-mono">
                          R$ {(m.totalAffiliateEarned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[11px] text-zinc-500 block">5% em cada venda de domínio</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Gráfico de Evolução de 6 Meses */}
                <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#84cc16]" />
                        <span>Evolução da Rede Billy Afiliados (Últimos 6 Meses)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Acompanhe o crescimento da sua rede de indicados e as comissões geradas mês a mês.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                        <span className="text-zinc-300">Comissões (R$)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-zinc-300">Vendas Domínio</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        <span className="text-zinc-300">Novos Recrutas</span>
                      </div>
                    </div>
                  </div>

                  {/* Renderização das Barras de Evolução */}
                  {(() => {
                    const chart = data?.affiliates?.evolutionChart || [];
                    const maxCommission = Math.max(100, ...chart.map((c: any) => c.commissionAmount || 0));

                    return (
                      <div className="pt-4 grid grid-cols-6 gap-2 sm:gap-4 items-end min-h-[180px] border-b border-white/[0.06] pb-3">
                        {chart.map((item: any, idx: number) => {
                          const heightPct = Math.max(12, Math.round(((item.commissionAmount || 0) / maxCommission) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative">
                              {/* Tooltip Hover */}
                              <div className="absolute -top-20 z-20 hidden group-hover:flex flex-col items-center bg-[#0e121a] border border-[#84cc16]/40 p-2.5 rounded-xl shadow-xl text-[11px] text-white whitespace-nowrap pointer-events-none">
                                <span className="font-bold text-[#a3e635]">{item.monthLabel}</span>
                                <span className="text-zinc-300">Recrutas: <strong>{item.recruitsCount}</strong></span>
                                <span className="text-zinc-300">Vendas Domínio: <strong>{item.domainSales}</strong></span>
                                <span className="text-[#a3e635] font-mono font-bold">R$ {(item.commissionAmount || 0).toFixed(2)}</span>
                              </div>

                              {/* Barra Visual */}
                              <div className="w-full max-w-[48px] bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-1 border border-white/[0.04] group-hover:border-[#84cc16]/50 transition">
                                <div
                                  className="w-full bg-gradient-to-t from-[#84cc16] to-[#a3e635] rounded-lg transition-all duration-500 shadow-md shadow-[#84cc16]/20"
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>

                              {/* Label do Mês */}
                              <div className="text-center">
                                <span className="text-[10px] font-bold text-zinc-400 block group-hover:text-white transition">
                                  {item.monthLabel}
                                </span>
                                <span className="text-[9px] font-mono text-[#a3e635] font-bold block">
                                  R${(item.commissionAmount || 0).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Tabela de Operadores Indicados Diretos */}
                <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#84cc16]" />
                        <span>Operadores Indicados Diretamente por Você</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Lista de colaboradores cadastrados com seu link de afiliação.
                      </p>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-white/[0.08]">
                      {(data?.affiliates?.invitedOperators || []).length} membros na rede
                    </span>
                  </div>

                  {(() => {
                    const recruits = data?.affiliates?.invitedOperators || [];
                    if (recruits.length === 0) {
                      return (
                        <div className="p-8 rounded-xl bg-black/30 border border-white/[0.04] text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto text-sm">
                            👥
                          </div>
                          <p className="text-xs text-zinc-300 font-semibold">
                            Você ainda não possui operadores indicados.
                          </p>
                          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                            Compartilhe seu link exclusivo de parceiro nas redes sociais ou com contatos interessados em trabalhar com a Billy Suite.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-white/[0.08] text-zinc-400 uppercase text-[10px]">
                              <th className="py-3 px-4 font-bold">Operador Convidado</th>
                              <th className="py-3 px-4 font-bold">Data Cadastro</th>
                              <th className="py-3 px-4 font-bold text-center">Status Licença</th>
                              <th className="py-3 px-4 font-bold text-center">Vendas Domínio (Mês)</th>
                              <th className="py-3 px-4 font-bold text-right">Comissões Geradas (R$)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {recruits.map((r: any, idx: number) => {
                              const d = r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '-';
                              return (
                                <tr key={r.id || idx} className="hover:bg-white/[0.02] transition">
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-white">{r.name}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono">{r.email}</div>
                                  </td>
                                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                                    {d}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                                      {r.status || 'Ativo'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                                    {r.domainSalesThisMonth || 0}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#a3e635]">
                                    R$ {(r.monthlyCommissionGenerated || 0).toFixed(2).replace('.', ',')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      </div>

      {/* =========================================================================
          MODAL DE TROCA DE SENHA
         ========================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0f121a] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {!data?.operator?.mustChangePassword && (
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-white">
                {data?.operator?.mustChangePassword ? 'Primeiro Acesso — Defina sua Nova Senha Pessoal' : 'Minha Conta • Alterar Senha'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {data?.operator?.mustChangePassword
                  ? `Olá, ${data?.operator?.name}! Por questões de segurança no primeiro acesso com senha provisória, defina sua nova senha pessoal definitiva (mínimo 8 caracteres).`
                  : 'Atualize sua senha de acesso ao portal do operador corporativo.'}
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">Senha Salva com Sucesso!</div>
                <p className="text-xs text-zinc-400">Suas credenciais já estão atualizadas.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {!data?.operator?.mustChangePassword && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Sua senha atual"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha (mínimo 8 caracteres)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 rounded-xl font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Salvar Nova Senha
                      </>
                    )}
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

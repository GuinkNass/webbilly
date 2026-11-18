'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  CreditCard,
  QrCode,
  Trash2,
  KeyRound,
  Check,
  RefreshCw,
  ShoppingCart,
  MessageSquare,
  Wrench,
  Layers,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Users,
  MessageCircle,
  Smartphone,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface ClientAccount {
  id: string;
  businessName: string;
  domainLogin: string;
  siteSlug: string;
  email?: string;
  phone?: string;
  planType: 'monthly_29_90' | 'custom_domain_490';
  status: 'active' | 'blocked';
  monthlyEditsLimit: number;
  monthlyEditsUsed: number;
  extraEditCredits: number;
  editsResetAt: string;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
  createdAt: string;
}

interface EditRequest {
  id: string;
  title: string;
  description: string;
  photos: string[];
  status: 'enviada' | 'em_andamento' | 'publicada';
  operator_notes?: string;
  is_extra_credit: boolean;
  created_at: string;
  completed_at?: string;
}

interface PaymentRecord {
  id: string;
  value: number;
  status: string;
  billingType: string;
  dueDate: string;
  paymentDate?: string;
  invoiceUrl: string;
  description?: string;
}

interface AffiliateTool {
  id: string;
  name: string;
  category: string;
  description: string;
  benefit?: string;
  logo_url?: string;
  affiliate_link: string;
  is_active: boolean;
}

export default function ClienteDashboardPage() {
  const router = useRouter();

  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'status' | 'alteracoes' | 'financeiro' | 'ferramentas' | 'configuracoes'>('status');

  // Edit Requests
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showNewEditModal, setShowNewEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhotoInput, setEditPhotoInput] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Billing & Payments
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [activePixPayment, setActivePixPayment] = useState<any | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixModalData, setPixModalData] = useState<{ payload?: string; qrCode?: string; invoiceUrl?: string; value?: number } | null>(null);

  // Buy Extra Edit Credit Modal
  const [showBuyExtraModal, setShowBuyExtraModal] = useState(false);
  const [buyingExtra, setBuyingExtra] = useState(false);
  const [buyExtraPixData, setBuyExtraPixData] = useState<{ payload?: string; qrCode?: string; invoiceUrl?: string } | null>(null);
  const [extraEditPrice, setExtraEditPrice] = useState<number>(39.90);
  const [monthlyPlanPrice, setMonthlyPlanPrice] = useState<number>(29.90);

  const formattedExtraPrice = `R$ ${extraEditPrice.toFixed(2).replace('.', ',')}`;
  const formattedMonthlyPrice = `R$ ${monthlyPlanPrice.toFixed(2).replace('.', ',')}`;

  // Analytics & Cliques WhatsApp
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/cliente/analytics');
      if (res.ok) {
        const d = await res.json();
        setAnalytics(d.analytics || null);
      }
    } catch (_) {}
    finally {
      setLoadingAnalytics(false);
    }
  };

  // Affiliate Tools
  const [tools, setTools] = useState<AffiliateTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [confirmCancelText, setConfirmCancelText] = useState('');
  const [cancellingAccount, setCancellingAccount] = useState(false);

  // Feedback copied
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Theme toggle
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Fetch initial profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/cliente/auth/me');
      if (!res.ok) {
        router.push('/cliente/login');
        return;
      }
      const data = await res.json();
      setAccount(data.account);
    } catch (_) {
      router.push('/cliente/login');
    } finally {
      setLoading(false);
    }
  };

  // Fetch edit requests
  const fetchEdits = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/cliente/edits');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (_) {}
    finally {
      setLoadingRequests(false);
    }
  };

  // Fetch billing info
  const fetchBilling = async () => {
    setLoadingBilling(true);
    try {
      const res = await fetch('/api/cliente/cobrancas');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setActivePixPayment(data.activePixPayment || null);
      }
    } catch (_) {}
    finally {
      setLoadingBilling(false);
    }
  };

  // Fetch affiliate tools
  const fetchTools = async () => {
    setLoadingTools(true);
    try {
      const res = await fetch('/api/cliente/ferramentas');
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (_) {}
    finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAnalytics();
    fetch('/api/pricing')
      .then(res => res.json())
      .then(d => {
        if (d?.pricing) {
          if (d.pricing.extra_edit_price) setExtraEditPrice(Number(d.pricing.extra_edit_price));
          if (d.pricing.monthly_plan_price) setMonthlyPlanPrice(Number(d.pricing.monthly_plan_price));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (account) {
      if (activeTab === 'status') fetchAnalytics();
      if (activeTab === 'alteracoes') fetchEdits();
      if (activeTab === 'financeiro') fetchBilling();
      if (activeTab === 'ferramentas') fetchTools();
    }
  }, [account, activeTab]);

  const handleLogout = async () => {
    await fetch('/api/cliente/auth/logout', { method: 'POST' });
    router.push('/cliente/login');
  };

  // Enviar Solicitação de Alteração
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) {
      setEditError('Por favor, informe o título e os detalhes da alteração.');
      return;
    }

    setSubmittingEdit(true);
    setEditError(null);

    const photos = editPhotoInput
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.startsWith('http'));

    try {
      const res = await fetch('/api/cliente/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          photos
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.needsExtraCredit) {
          setShowNewEditModal(false);
          setShowBuyExtraModal(true);
          return;
        }
        throw new Error(data.error || 'Erro ao enviar alteração.');
      }

      setEditTitle('');
      setEditDesc('');
      setEditPhotoInput('');
      setShowNewEditModal(false);
      await fetchEdits();
      await fetchProfile();
    } catch (err: any) {
      setEditError(err.message || 'Falha ao enviar solicitação.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Comprar Crédito de Alteração Extra (R$ 19,90)
  const handleBuyExtraCredit = async () => {
    setBuyingExtra(true);
    try {
      const res = await fetch('/api/cliente/comprar-alteracao', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar cobrança Pix.');
      }

      setBuyExtraPixData({
        payload: data.pixPayload,
        qrCode: data.pixQrCodeImage,
        invoiceUrl: data.invoiceUrl
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar Pix.');
    } finally {
      setBuyingExtra(false);
    }
  };

  // Registrar clique em ferramenta parceira
  const handleToolClick = async (tool: AffiliateTool) => {
    fetch(`/api/cliente/ferramentas/${tool.id}/click`, { method: 'POST' }).catch(() => null);
    window.open(tool.affiliate_link, '_blank', 'noopener,noreferrer');
  };

  // Alterar Senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setPassFeedback(null);

    try {
      const res = await fetch('/api/cliente/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao alterar senha.');

      setPassFeedback({ type: 'success', msg: 'Senha atualizada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassFeedback({ type: 'error', msg: err.message || 'Erro ao atualizar senha.' });
    } finally {
      setChangingPass(false);
    }
  };

  // Cancelamento Definitivo
  const handleConfirmCancelAccount = async () => {
    if (confirmCancelText.trim().toUpperCase() !== 'CANCELAR') {
      alert('Para confirmar, digite exatamente a palavra CANCELAR.');
      return;
    }

    setCancellingAccount(true);
    try {
      const res = await fetch('/api/cliente/cancelar-conta', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar conta.');

      alert('Sua assinatura e todos os dados do seu site foram excluídos definitivamente.');
      router.push('/cliente/login');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar cancelamento. Contate o suporte.');
      setCancellingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Carregando seu painel...</span>
        </div>
      </div>
    );
  }

  if (!account) return null;

  const siteUrl = account.domainLogin.startsWith('http')
    ? account.domainLogin
    : `https://${account.domainLogin}`;

  const remainingMonthlyEdits = Math.max(0, account.monthlyEditsLimit - account.monthlyEditsUsed);
  const totalEditsAvailable = remainingMonthlyEdits + (account.extraEditCredits || 0);

  const resetDateFormatted = account.editsResetAt
    ? new Date(account.editsResetAt).toLocaleDateString('pt-BR')
    : '--/--/----';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b shadow-xs backdrop-blur-md" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
            B
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>{account.businessName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
                {account.status === 'active' ? 'Site Ativo' : 'Suspenso'}
              </span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {account.domainLogin}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)' }}
            title="Alternar Tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="w-full px-4 sm:px-8 border-b overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
          {[
            { id: 'status', label: 'Meu Site Oficial', icon: Globe },
            { id: 'alteracoes', label: 'Fila de Alterações', icon: Layers, badge: totalEditsAvailable },
            { id: 'financeiro', label: 'Faturas & Pix', icon: CreditCard },
            { id: 'ferramentas', label: 'Ferramentas Parceiras', icon: Sparkles },
            { id: 'configuracoes', label: 'Configurações', icon: Wrench }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'hover:opacity-80'
                }`}
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-primary)' }
                    : { color: 'var(--text-secondary)', backgroundColor: 'transparent' }
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* ========================================================================= */}
        {/* ABA 1: MEU SITE OFICIAL */}
        {/* ========================================================================= */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="p-6 sm:p-8 rounded-2xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                      <Globe className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                      Presença Digital Oficial no Ar
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    Seu site está hospedado na nuvem global de ultravelocidade Billy Suite e sincronizado em tempo real.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all hover:opacity-95"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <span>Acessar Meu Site Oficial</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => copyToClipboard(siteUrl, 'site-link')}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all hover:opacity-80"
                      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)', backgroundColor: 'var(--bg-app)' }}
                    >
                      {copiedText === 'site-link' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedText === 'site-link' ? 'Link Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border flex flex-col gap-2 min-w-[240px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Endereço Oficial Publicado
                  </div>
                  <div className="text-sm font-bold font-mono truncate" style={{ color: 'var(--color-primary)' }}>
                    {account.domainLogin}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <span>Status de Publicação:</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo & Seguro
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Plano Atual</span>
                  <FileText className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: 'var(--text-main)' }}>
                  {account.planType === 'custom_domain_490'
                    ? 'Site Completo + Domínio Próprio'
                    : `Mensalidade ${formattedMonthlyPrice} / mês`}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {account.planType === 'custom_domain_490'
                    ? 'Domínio próprio vitalício / Anual'
                    : 'Presença digital contínua'}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Alterações Disponíveis</span>
                  <Layers className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-500">
                  {totalEditsAvailable}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {account.planType === 'monthly_29_90'
                    ? `${remainingMonthlyEdits} inclusas no mês + ${account.extraEditCredits} extras`
                    : `${account.extraEditCredits} créditos avulsos`}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Renovação da Cota</span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: 'var(--text-main)' }}>
                  {resetDateFormatted}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Ciclo de 30 dias para recarregar 3 alterações
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SEÇÃO ANALYTICS: DESEMPENHO & ACESSOS DO SEU SITE */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl border shadow-xs space-y-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                      <BarChart3 className="w-5 h-5" />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                      Desempenho & Acessos do Seu Site
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    Métricas consolidadas de visitas reais e conversões para o seu WhatsApp oficial nos últimos 30 dias.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchAnalytics}
                  disabled={loadingAnalytics}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:opacity-80 cursor-pointer disabled:opacity-50"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)', backgroundColor: 'var(--bg-app)' }}
                  title="Atualizar métricas de acesso"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>{loadingAnalytics ? 'Atualizando...' : 'Atualizar'}</span>
                </button>
              </div>

              {/* 4 Cards de Métricas Principais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Visitas Hoje */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Visitas Hoje</span>
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
                    {analytics?.todayViews || 0}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    {analytics?.todayUniques || 0} visitante(s) único(s)
                  </div>
                </div>

                {/* Card 2: Visitas 30 Dias */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Visitas (30 dias)</span>
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
                    {analytics?.totalViews30d || 0}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {analytics?.totalUniques30d || 0} pessoas diferentes
                  </div>
                </div>

                {/* Card 3: Cliques WhatsApp */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Cliques WhatsApp (30d)</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-emerald-500">
                    {analytics?.totalWhatsapp30d || 0}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {analytics?.todayWhatsapp ? `+${analytics.todayWhatsapp} hoje` : 'Conversões diretas'}
                  </div>
                </div>

                {/* Card 4: % Mobile */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>% Acessos Celular</span>
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <Smartphone className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-amber-500">
                    {analytics?.mobilePercent ?? 0}%
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {analytics?.mobileViews30d || 0} celular • {analytics?.desktopViews30d || 0} PC
                  </div>
                </div>
              </div>

              {/* Gráfico de Barras dos Últimos 14 Dias */}
              <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                      Evolução Diária de Visitas e Conversões no WhatsApp (Últimos 14 dias)
                    </span>
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
                      <span style={{ color: 'var(--text-secondary)' }}>Visitas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                      <span style={{ color: 'var(--text-secondary)' }}>Cliques WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Área do Gráfico */}
                {(() => {
                  const days = analytics?.dailyStats || [];
                  const maxVal = Math.max(
                    ...days.map((d: any) => Math.max(d.views || 0, d.whatsapp || 0)),
                    5
                  );

                  return (
                    <div className="space-y-2 pt-4">
                      <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 relative">
                        {/* Linhas de grade de fundo */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                          <div className="border-b border-dashed" style={{ borderColor: 'var(--text-muted)' }} />
                          <div className="border-b border-dashed" style={{ borderColor: 'var(--text-muted)' }} />
                          <div className="border-b border-dashed" style={{ borderColor: 'var(--text-muted)' }} />
                        </div>

                        {days.map((day: any) => {
                          const viewsHeight = day.views > 0 ? Math.max((day.views / maxVal) * 100, 8) : 3;
                          const waHeight = day.whatsapp > 0 ? Math.max((day.whatsapp / maxVal) * 100, 8) : 3;
                          const isHovered = hoveredDay?.date === day.date;

                          return (
                            <div
                              key={day.date}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                            >
                              {/* Tooltip flutuante no hover */}
                              {isHovered && (
                                <div
                                  className="absolute bottom-full mb-2 z-30 px-3 py-2 rounded-xl text-[11px] shadow-xl border whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none"
                                  style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    borderColor: 'var(--border-strong)',
                                    color: 'var(--text-main)'
                                  }}
                                >
                                  <div className="font-bold border-b pb-1 mb-1 font-mono text-[10px]" style={{ borderColor: 'var(--border-subtle)' }}>
                                    {day.date} ({day.label})
                                  </div>
                                  <div className="text-sky-500 font-semibold flex items-center justify-between gap-3">
                                    <span>Visitas:</span>
                                    <strong>{day.views} ({day.uniques} únicos)</strong>
                                  </div>
                                  <div className="text-emerald-500 font-semibold flex items-center justify-between gap-3">
                                    <span>Cliques WhatsApp:</span>
                                    <strong>{day.whatsapp}</strong>
                                  </div>
                                </div>
                              )}

                              {/* Coluna com as 2 barras emparelhadas */}
                              <div className="w-full max-w-[28px] h-full flex items-end justify-center gap-0.5 sm:gap-1">
                                {/* Barra Visitas */}
                                <div
                                  style={{ height: `${viewsHeight}%` }}
                                  className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                                    day.views > 0
                                      ? 'bg-sky-500 group-hover:bg-sky-400'
                                      : 'bg-slate-300 dark:bg-slate-800'
                                  }`}
                                />
                                {/* Barra WhatsApp */}
                                <div
                                  style={{ height: `${waHeight}%` }}
                                  className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                                    day.whatsapp > 0
                                      ? 'bg-emerald-500 group-hover:bg-emerald-400'
                                      : 'bg-slate-300 dark:bg-slate-800'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Labels dos Dias (Eixo X) */}
                      <div className="flex justify-between gap-1 sm:gap-2 px-1 text-[10px] sm:text-[11px] font-mono text-center" style={{ color: 'var(--text-muted)' }}>
                        {days.map((day: any) => (
                          <div key={day.date} className="flex-1 truncate">
                            {day.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Banner de Ação Rápida */}
            <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ backgroundColor: 'var(--color-primary-soft)', borderColor: 'rgba(20,120,240,0.3)' }}>
              <div className="space-y-1">
                <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  Precisa atualizar fotos, horário ou contatos do seu site?
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Você pode solicitar alterações pelo portal a qualquer momento. Nossa equipe técnica aplica e publica diretamente no seu site.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('alteracoes');
                  setShowNewEditModal(true);
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all hover:opacity-95"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Solicitar Alteração Agora
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: CENTRAL DE ALTERAÇÕES NO SITE */}
        {/* ========================================================================= */}
        {activeTab === 'alteracoes' && (
          <div className="space-y-6">
            {/* Header com Contadores e Botão de Ação */}
            <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                    <Layers className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                    Central de Atualizações do Site
                  </h2>
                </div>
                <p className="text-xs sm:text-sm max-w-xl" style={{ color: 'var(--text-muted)' }}>
                  {account.planType === 'monthly_29_90'
                    ? `Seu plano inclui 3 alterações gratuitas por mês. Você utilizou ${account.monthlyEditsUsed} de 3 neste ciclo. Sua cota renova em ${resetDateFormatted}.`
                    : `No plano Domínio Próprio, utilize seus créditos avulsos ou adquira alterações adicionais por ${formattedExtraPrice} via Pix.`}
                </p>
                {account.extraEditCredits > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{account.extraEditCredits} alteração(ões) extra(s) disponível(is)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setShowNewEditModal(true)}
                  className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-95"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Alteração</span>
                </button>

                <button
                  onClick={() => {
                    setShowBuyExtraModal(true);
                    setBuyExtraPixData(null);
                  }}
                  className="px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)', backgroundColor: 'var(--bg-app)' }}
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-500" />
                  <span>Comprar Alteração Extra ({formattedExtraPrice})</span>
                </button>
              </div>
            </div>

            {/* Lista / Fila de Solicitações */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: 'var(--text-secondary)' }}>
                Linha do Tempo das Solicitações ({requests.length})
              </h3>

              {loadingRequests ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Carregando solicitações...
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 rounded-2xl border text-center space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <Layers className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
                  <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Nenhuma alteração solicitada ainda</div>
                  <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                    Quando precisar trocar fotos, telefone, horário de atendimento ou novos serviços, clique no botão "Nova Alteração".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => {
                    const statusConfig = {
                      enviada: { label: '1. Enviada (Aguardando)', bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Clock },
                      em_andamento: { label: '2. Em Andamento', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: RefreshCw },
                      publicada: { label: '3. Publicada no Site', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 }
                    }[req.status] || { label: req.status, bg: 'bg-slate-500/10', text: 'text-slate-500', icon: Clock };

                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border transition-all space-y-3"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-main)' }}>
                              {req.title}
                            </h4>
                            {req.is_extra_credit && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                Crédito Extra
                              </span>
                            )}
                          </div>

                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                          {req.description}
                        </p>

                        {req.photos && req.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {req.photos.map((p, idx) => (
                              <a
                                key={idx}
                                href={p}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border font-semibold hover:underline"
                                style={{ borderColor: 'var(--border-subtle)', color: 'var(--color-primary)', backgroundColor: 'var(--bg-app)' }}
                              >
                                <span>Foto de Referência {idx + 1}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        )}

                        {req.operator_notes && (
                          <div className="p-3.5 rounded-xl border text-xs space-y-1" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)' }}>
                            <div className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Nota da Equipe Técnica Billy</span>
                            </div>
                            <p style={{ color: 'var(--text-main)' }}>{req.operator_notes}</p>
                          </div>
                        )}

                        <div className="text-[11px] flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                          <span>Solicitado em: {new Date(req.created_at).toLocaleString('pt-BR')}</span>
                          {req.completed_at && (
                            <span className="text-emerald-500 font-medium">
                              Concluído em: {new Date(req.completed_at).toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: FATURAS & PAGAMENTOS */}
        {/* ========================================================================= */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            {/* Overview Financeiro */}
            <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                    Faturamento & Mensalidades
                  </h2>
                </div>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                  Acompanhe seu histórico de cobranças Asaas com suporte instantâneo a Pix e Cartão de Crédito.
                </p>
              </div>

              {activePixPayment && (
                <button
                  onClick={() => {
                    setPixModalData({
                      payload: activePixPayment.pixPayload,
                      qrCode: activePixPayment.pixQrCodeImage,
                      invoiceUrl: activePixPayment.invoiceUrl,
                      value: activePixPayment.value
                    });
                    setShowPixModal(true);
                  }}
                  className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-95"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pagar Fatura com Pix (R$ {Number(activePixPayment.value).toFixed(2)})</span>
                </button>
              )}
            </div>

            {/* Tabela de Pagamentos */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                  Histórico de Faturas ({payments.length})
                </h3>
                <button
                  onClick={fetchBilling}
                  className="p-1.5 rounded-lg border hover:opacity-80 text-xs flex items-center gap-1"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>

              {loadingBilling ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Consultando faturas no Asaas...
                </div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma fatura registrada no momento.
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {payments.map(p => {
                    const isPaid = p.status === 'RECEIVED' || p.status === 'CONFIRMED';
                    return (
                      <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-500/5 transition-colors">
                        <div className="space-y-1">
                          <div className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                            {p.description || `Mensalidade Presença Digital Oficial`}
                          </div>
                          <div className="text-xs flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                            <span>Vencimento: {new Date(p.dueDate).toLocaleDateString('pt-BR')}</span>
                            {p.paymentDate && (
                              <span className="text-emerald-500 font-medium">
                                Pago em: {new Date(p.paymentDate).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
                              R$ {Number(p.value).toFixed(2).replace('.', ',')}
                            </div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {isPaid ? 'CONFIRMADO' : 'PENDENTE'}
                            </span>
                          </div>

                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 hover:opacity-80"
                            style={{ borderColor: 'var(--border-strong)', color: 'var(--color-primary)' }}
                          >
                            <span>2ª Via</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: FERRAMENTAS PARCEIRAS (BILLY AFILIADOS B2B) */}
        {/* ========================================================================= */}
        {activeTab === 'ferramentas' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                  <Sparkles className="w-5 h-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                  Ferramentas Parceiras & Benefícios Exclusivos
                </h2>
              </div>
              <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                Selecionamos as melhores ferramentas do mercado para alavancar seu comércio local com descontos e testes gratuitos exclusivos para clientes Billy Suite.
              </p>
            </div>

            {loadingTools ? (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Carregando ferramentas parceiras...
              </div>
            ) : tools.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Nenhuma ferramenta recomendada no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map(tool => (
                  <div
                    key={tool.id}
                    className="p-6 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-xs"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {tool.logo_url ? (
                            <img
                              src={tool.logo_url}
                              alt={tool.name}
                              className="w-10 h-10 rounded-xl object-contain p-1 border"
                              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                              {tool.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>{tool.name}</h4>
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--color-primary)' }}>{tool.category}</span>
                          </div>
                        </div>

                        {tool.benefit && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                            {tool.benefit}
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {tool.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToolClick(tool)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-95"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <span>Acessar com Benefício Exclusivo</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 5: CONFIGURAÇÕES & CANCELAMENTO DEFINITIVO */}
        {/* ========================================================================= */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            {/* Troca de Senha */}
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                  <KeyRound className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Alterar Minha Senha de Acesso</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mantenha sua conta do painel sempre protegida.</p>
                </div>
              </div>

              {passFeedback && (
                <div
                  className={`mb-4 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2`}
                  style={
                    passFeedback.type === 'success'
                      ? { backgroundColor: 'var(--color-success-soft)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }
                      : { backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }
                  }
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passFeedback.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha atual"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Digite sua nova senha"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {changingPass ? 'Salvando...' : 'Atualizar Senha'}
                </button>
              </form>
            </div>

            {/* Zona de Perigo: Cancelamento Total */}
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'rgba(248,63,50,0.3)' }}>
              <div className="flex items-center gap-2 mb-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold">Zona de Cancelamento Definitivo</h3>
              </div>
              <p className="text-xs leading-relaxed max-w-xl text-red-950/80 dark:text-red-200/80 mb-4">
                Se você não deseja mais manter seu site no ar, você pode encerrar sua assinatura e excluir definitivamente seu site.
                Todas as cobranças futuras no Asaas serão canceladas imediatamente e seus domínios serão desvinculados.
              </p>

              <button
                type="button"
                onClick={() => {
                  setConfirmCancelText('');
                  setShowCancelModal(true);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 shadow-xs hover:bg-red-700 transition-colors"
              >
                Cancelar Assinatura e Encerrar Site
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: NOVA SOLICITAÇÃO DE ALTERAÇÃO */}
      {/* ========================================================================= */}
      {showNewEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg p-6 sm:p-7 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>Solicitar Alteração no Site</h3>
              </div>
              <button
                onClick={() => setShowNewEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Título Resumido
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="ex: Atualizar número de WhatsApp e adicionar fotos do espaço"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Descrição Detalhada do que Mudar
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Explique exatamente os textos, telefones, horários ou seções que deseja alterar no seu site..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Links de Fotos de Referência (opcional - 1 por linha)
                </label>
                <textarea
                  rows={2}
                  value={editPhotoInput}
                  onChange={(e) => setEditPhotoInput(e.target.value)}
                  placeholder="https://drive.google.com/... ou https://instagram.com/p/..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowNewEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {submittingEdit ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPRAR ALTERAÇÃO EXTRA (R$ 19,90 VIA PIX) */}
      {/* ========================================================================= */}
      {showBuyExtraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>Alteração Extra no Site</h3>
              </div>
              <button
                onClick={() => setShowBuyExtraModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {!buyExtraPixData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  Sua cota mensal de alterações gratuitas foi utilizada. Você pode adquirir 1 crédito de alteração avulsa por apenas <strong>{formattedExtraPrice} via Pix</strong>.
                  O crédito é liberado automaticamente após a confirmação do pagamento.
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border font-bold text-sm" style={{ backgroundColor: 'var(--color-primary-soft)', borderColor: 'rgba(20,120,240,0.3)', color: 'var(--color-primary)' }}>
                  <span>Valor da Alteração Avulsa:</span>
                  <span>{formattedExtraPrice}</span>
                </div>

                <button
                  type="button"
                  disabled={buyingExtra}
                  onClick={handleBuyExtraCredit}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {buyingExtra ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Gerar Pix de {formattedExtraPrice}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                {buyExtraPixData.qrCode && (
                  <div className="p-3 bg-white rounded-xl inline-block border mx-auto shadow-xs">
                    <img
                      src={`data:image/png;base64,${buyExtraPixData.qrCode}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                )}

                {buyExtraPixData.payload && (
                  <div className="space-y-2">
                    <button
                      onClick={() => copyToClipboard(buyExtraPixData.payload!, 'pix-payload')}
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {copiedText === 'pix-payload' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedText === 'pix-payload' ? 'Código Copiado!' : 'Copiar Código Pix Copia e Cola'}</span>
                    </button>
                  </div>
                )}

                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Assim que o Pix for confirmado pelo seu banco, seu crédito de alteração será liberado instantaneamente.
                </p>

                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBuyExtraModal(false);
                      fetchProfile();
                    }}
                    className="w-full py-2 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAGAR FATURA PENDENTE COM PIX */}
      {/* ========================================================================= */}
      {showPixModal && pixModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>Pagamento via Pix</h3>
              </div>
              <button
                onClick={() => setShowPixModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-center">
              {pixModalData.qrCode && (
                <div className="p-3 bg-white rounded-xl inline-block border mx-auto shadow-xs">
                  <img
                    src={`data:image/png;base64,${pixModalData.qrCode}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              {pixModalData.payload && (
                <button
                  onClick={() => copyToClipboard(pixModalData.payload!, 'pix-fatura')}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {copiedText === 'pix-fatura' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText === 'pix-fatura' ? 'Código Copiado!' : 'Copiar Pix Copia e Cola'}</span>
                </button>
              )}

              {pixModalData.invoiceUrl && (
                <a
                  href={pixModalData.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <span>Ou pagar com Cartão de Crédito na fatura oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowPixModal(false)}
                  className="w-full py-2 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANCELAMENTO DEFINITIVO DA CONTA */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base">Confirmar Cancelamento Definitivo</h3>
            </div>

            <div className="p-3.5 rounded-xl border text-xs leading-relaxed space-y-2 mb-4" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              <p><strong>Atenção:</strong> Esta ação é irreversível.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Seu site será retirado do ar imediatamente.</li>
                <li>Sua assinatura no Asaas será cancelada sem cobranças futuras.</li>
                <li>Todos os arquivos, imagens e dados serão permanentemente excluídos.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Para confirmar, digite a palavra <strong>CANCELAR</strong> abaixo:
              </label>
              <input
                type="text"
                value={confirmCancelText}
                onChange={(e) => setConfirmCancelText(e.target.value)}
                placeholder="CANCELAR"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold uppercase tracking-wider outline-none text-red-600 border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
              />

              <div className="pt-2 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                >
                  Voltar
                </button>

                <button
                  type="button"
                  disabled={cancellingAccount || confirmCancelText.trim().toUpperCase() !== 'CANCELAR'}
                  onClick={handleConfirmCancelAccount}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 shadow-xs hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  {cancellingAccount ? 'Cancelando...' : 'Confirmar Encerramento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs border-t mt-auto" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)' }}>
        © {new Date().getFullYear()} Billy Suite — Tecnologia & Presença Digital Oficial
      </footer>
    </div>
  );
}

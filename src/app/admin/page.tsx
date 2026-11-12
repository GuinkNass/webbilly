'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardCharts from '@/components/DashboardCharts';
import AdminCustomDomains from '@/components/AdminCustomDomains';
import {
  Users,
  Key,
  Sliders,
  DollarSign,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  ExternalLink,
  Shield,
  Laptop,
  Check,
  AlertTriangle,
  Mail,
  Copy,
  Search,
  Eye,
  Globe,
  CreditCard,
  Plus,
  KeyRound,
  RotateCcw,
  X,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Settings,
  HelpCircle,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'licenses' | 'financial' | 'apis' | 'domains'>('subscriptions');
  const [selectedDomainProject, setSelectedDomainProject] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'TODOS' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('TODOS');
  const [subSearch, setSubSearch] = useState('');

  // Estados de formulário e modal
  const [approvalModalData, setApprovalModalData] = useState<any>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [apiSettings, setApiSettings] = useState<any>({
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    cloudflareAccountId: '',
    cloudflareApiToken: '',
    vercelToken: '',
    mercadopagoAccessToken: '',
    mercadopagoPublicKey: '',
    monthlySubscriptionPrice: 29.90,
    operatorCommissionMonthly: 10.00,
    pixGateway: 'mercadopago',
    pixGatewayKey: '',
    defaultDailyLimit: 50,
    commissionPerSale: 200
  });

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Sincronização dinâmica direta via /api/admin/licenses
      try {
        const licRes = await fetch('/api/admin/licenses');
        if (licRes.ok) {
          const licJson = await licRes.json();
          if (Array.isArray(licJson.licenses)) {
            json.licenses = licJson.licenses;
          }
        }
      } catch (licErr) {
        console.warn('Falha ao sincronizar /api/admin/licenses:', licErr);
      }

      setData(json);
      setApiSettings(json.settings);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Bloquear / Desbloquear Licença
  const handleToggleLicense = async (serialToken: string, currentStatus: string) => {
    try {
      const action = currentStatus === 'BLOQUEADO' ? 'UNBLOCK' : 'BLOCK';
      const res = await fetch('/api/admin/license/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, action })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Licença ${serialToken} atualizada: ${action === 'BLOCK' ? 'Bloqueada em tempo real' : 'Ativada'}`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar licença.');
    }
  };

  // Alternar status de Assinatura Recorrente (Ativar / Suspender)
  const handleToggleSubscription = async (subscriptionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      const res = await fetch('/api/admin/subscriptions/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, status: newStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Assinatura alterada para: ${newStatus === 'active' ? 'Ativo (Site Online)' : 'Suspenso (Inadimplência)'}`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status da assinatura.');
    }
  };

  // Resetar Machine ID
  const handleResetMachine = async (serialToken: string) => {
    if (!confirm('Deseja realmente desvincular o computador atual desta licença? O operador poderá ativar em uma nova máquina.')) return;
    try {
      const res = await fetch('/api/admin/license/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, action: 'RESET_MACHINE' })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Machine ID liberado com sucesso para a licença ${serialToken}`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao liberar máquina.');
    }
  };

  // Gerar Nova Chave Serial Virgem
  const handleGenerateSerial = async () => {
    try {
      const res = await fetch('/api/admin/license/generate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Chave serial virgem gerada: ${json.serialToken} (Copiada para a área de transferência!)`);
      copyToClipboard(json.serialToken);
      setTimeout(() => setActionSuccess(null), 6000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar chave serial.');
    }
  };

  // Resetar Senha Web do Operador
  const handleResetOperatorPassword = async (serialToken: string, operatorId?: string) => {
    if (!confirm('Deseja gerar uma nova senha provisória para este operador? Ele terá que trocá-la no próximo acesso.')) return;
    try {
      const res = await fetch('/api/admin/operator/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Nova senha provisória de ${json.operatorName}: ${json.tempPassword} (Copiada!)`);
      copyToClipboard(json.tempPassword);
      setTimeout(() => setActionSuccess(null), 6000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao resetar senha provisória.');
    }
  };

  // Aprovar Operador e Liberar Licença Desktop
  const handleApproveOperator = async (serialToken: string, operatorId?: string) => {
    if (!confirm(`Deseja aprovar o cadastro do operador e liberar imediatamente o acesso desta licença (${serialToken})?`)) return;
    try {
      const res = await fetch('/api/admin/operators/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(json.message || `Operador aprovado com sucesso! Acesso liberado no app desktop.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar operador.');
    }
  };

  // Alterar Senha Master
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (!adminNewPassword || adminNewPassword.length < 6) {
      setChangePasswordError('A nova senha master deve ter no mínimo 6 caracteres.');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setChangePasswordError('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword,
          confirmPassword: adminConfirmPassword
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setChangePasswordSuccess('Senha Master alterada com sucesso!');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setAdminCurrentPassword('');
        setAdminNewPassword('');
        setAdminConfirmPassword('');
        setChangePasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setChangePasswordError(err.message || 'Erro ao alterar senha master.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Salvar Configurações Centrais de APIs
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess('Configurações de APIs salvas com sucesso! O app desktop sincronizará no próximo heartbeat.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    }
  };

  // Pagar Comissão Pix
  const handlePayPixCommission = async (saleId: string) => {
    const proof = prompt('Informe o código de identificação do comprovante Pix (ou deixe em branco para confirmação automática):');
    try {
      const res = await fetch('/api/admin/sales/pay-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, pixProof: proof })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess('Comissão marcada como paga com sucesso via Pix!');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar pagamento Pix.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência: ' + text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-300">Carregando Synadmin Dashboard...</span>
        </div>
      </div>
    );
  }

  // Filtragem de Assinaturas
  const subscriptionsList = (data?.subscriptions || []).filter((sub: any) => {
    if (subFilter === 'ACTIVE' && sub.status !== 'active') return false;
    if (subFilter === 'SUSPENDED' && sub.status !== 'suspended') return false;
    if (subFilter === 'PENDING' && sub.status !== 'pending') return false;
    if (subSearch) {
      const q = subSearch.toLowerCase();
      const matchSlug = (sub.siteSlug || '').toLowerCase().includes(q);
      const matchName = (sub.clientName || '').toLowerCase().includes(q);
      const matchOp = (sub.operatorName || '').toLowerCase().includes(q);
      if (!matchSlug && !matchName && !matchOp) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-zinc-100 flex font-sans antialiased select-none">
      
      {/* =========================================================================
          1. SIDEBAR LATERAL ESQUERDA (ESTILO SYNADMIN / REACTBOARD)
         ========================================================================= */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#0f121a] border-r border-white/[0.06] flex flex-col justify-between z-40">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center font-black text-indigo-400 text-lg">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">Webbilly</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-mono">
                  MASTER
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Synadmin Central Control</p>
            </div>
          </div>

          {/* Menu de Navegação Vertical */}
          <div className="p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 py-2">
              Gestão da Plataforma
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'subscriptions'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'subscriptions' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Assinaturas SaaS</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'subscriptions' ? 'bg-white/20 text-white' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                }`}>
                  {data?.subscriptions?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('domains')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'domains'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${activeTab === 'domains' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Domínio Próprio</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  R$ 490
                </span>
              </button>

              <button
                onClick={() => setActiveTab('licenses')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'licenses'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Key className={`w-4 h-4 ${activeTab === 'licenses' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Licenças & Operadores</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'licenses' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {data?.licenses?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('financial')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'financial'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className={`w-4 h-4 ${activeTab === 'financial' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Extrato & Repasses</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('apis')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'apis'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${activeTab === 'apis' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span>Configurações & APIs</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-white/[0.08] space-y-2">
          {/* Card Asaas API Status */}
          <div className="p-2.5 rounded-xl bg-[#141824] border border-white/[0.06] text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Asaas API v3
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Cobranças & Webhook Ativos</p>
          </div>

          <Link
            href="/operador"
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] transition flex items-center justify-center gap-2 border border-white/[0.06]"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>Área do Operador</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition flex items-center justify-center gap-2 border border-white/[0.06]"
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
        <header className="sticky top-0 z-30 h-16 bg-[#0f121a]/95 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-8 flex items-center justify-between shrink-0">
          {/* Barra de Busca Global */}
          <div className="relative w-80 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar comércios, seriais, faturas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-1.5 bg-[#08090d] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
              Ctrl K
            </kbd>
          </div>

          {/* Lado Direito da Topbar */}
          <div className="flex items-center gap-3">
            {/* Badge Conexão Asaas */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Asaas v3 Conectado
            </span>

            <button
              onClick={() => {
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
                setAdminCurrentPassword('');
                setAdminNewPassword('');
                setAdminConfirmPassword('');
                setShowChangePasswordModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161a26] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Alterar Senha Master</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] border border-white/[0.08] transition"
              title="Atualizar dados em tempo real"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Avatar / Perfil Admin */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-indigo-900/80 border border-indigo-700/50 flex items-center justify-center text-white text-xs font-bold">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white leading-none">Administrador</div>
                <div className="text-[10px] text-zinc-400 leading-tight">Master Billy</div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            3. ÁREA DE CONTEÚDO PRINCIPAL (COM ESPAÇAMENTO RESPONSIVO PERFEITO)
           ========================================================================= */}
        <main className="px-6 lg:px-8 py-8 flex-1 overflow-x-hidden">
        
        {/* Banner de Feedback */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* =====================================================================
            CARTÕES DE KPIS (PADRÃO SYNADMIN DASHBOARD)
           ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* KPI 1: Sites Ativos */}
          <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between group hover:border-white/[0.12] transition">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                Sites Ativos (Subdomínio)
              </span>
              <div className="text-3xl font-black text-white tracking-tight">
                {data?.metrics?.totalActiveSites || 0}
                <span className="text-xs text-zinc-400 font-normal ml-1.5 font-mono">sites</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>100% adimplentes no ar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 2: MRR Recorrente */}
          <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between group hover:border-white/[0.12] transition">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                MRR Recorrente Total
              </span>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">
                R$ {(data?.metrics?.currentMRR || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-teal-400 font-medium mt-1 flex items-center gap-1">
                <span>R$ 29,90/mês por comércio</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-teal-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 3: Inadimplência */}
          <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between group hover:border-white/[0.12] transition">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                Taxa de Inadimplência
              </span>
              <div className="text-3xl font-black text-rose-400 tracking-tight">
                {data?.metrics?.delinquencyRate || 0}%
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-1">
                {data?.metrics?.totalSuspendedSites || 0} suspensos • {data?.metrics?.totalPendingSites || 0} pendentes
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 4: Repasses Operadores */}
          <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between group hover:border-white/[0.12] transition">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                Repasses Operadores/Mês
              </span>
              <div className="text-3xl font-black text-indigo-400 tracking-tight">
                R$ {(data?.metrics?.monthlyOperatorCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-indigo-300 font-medium mt-1">
                R$ 10,00/mês por site ativo
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* =====================================================================
            SEÇÃO MODULAR: 3 GRÁFICOS ANALÍTICOS (SYNADMIN STYLE)
           ===================================================================== */}
        <DashboardCharts
          mode="admin"
          subscriptions={data?.subscriptions}
          metrics={data?.metrics}
        />

        {/* =====================================================================
            TAB 1: GESTÃO DE ASSINATURAS SAAS (SYNADMIN DATATABLE)
           ===================================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            
            {/* Header da Tabela com Filtros de Pílula */}
            <div className="bg-[#11141c] p-4 rounded-2xl border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setSubFilter('TODOS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    subFilter === 'TODOS'
                      ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Todos ({data?.subscriptions?.length || 0})
                </button>
                <button
                  onClick={() => setSubFilter('ACTIVE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    subFilter === 'ACTIVE'
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Ativos (Em dia)
                </button>
                <button
                  onClick={() => setSubFilter('SUSPENDED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    subFilter === 'SUSPENDED'
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Inadimplentes (Suspensos)
                </button>
                <button
                  onClick={() => setSubFilter('PENDING')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    subFilter === 'PENDING'
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Aguardando Pagamento
                </button>
              </div>

              {/* Busca na Tabela */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar comércio ou slug..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0a0c10] border border-white/[0.08] text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Tabela de Assinaturas Synadmin */}
            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Comércio / Subdomínio</th>
                      <th className="py-3.5 px-4">Cliente / WhatsApp</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Plano</th>
                      <th className="py-3.5 px-4">Renovação</th>
                      <th className="py-3.5 px-4">Operador</th>
                      <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {subscriptionsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-zinc-400 text-xs">
                          Nenhuma assinatura encontrada para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      subscriptionsList.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-4 px-5">
                            <span className="font-bold text-white text-sm block">{sub.clientName}</span>
                            <div className="flex flex-col gap-1 mt-0.5">
                              <a
                                href={`https://${sub.siteSlug}.webbilly.com.br`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline font-mono text-xs inline-flex items-center gap-1"
                              >
                                <span>{sub.siteSlug}.webbilly.com.br</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {(sub.custom_domain || sub.customDomain) && (
                                <a
                                  href={`https://${sub.custom_domain || sub.customDomain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-white hover:text-emerald-400 font-mono text-xs font-bold inline-flex items-center gap-1 bg-[#151a28] px-2 py-0.5 rounded-md border border-white/[0.08] w-fit"
                                  title="Domínio próprio conectado"
                                >
                                  <Globe className="w-3 h-3 text-indigo-400" />
                                  <span>{sub.custom_domain || sub.customDomain}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-300">
                            <div>{sub.clientName}</div>
                            <div className="text-[11px] text-zinc-400">{sub.clientPhone || 'Sem telefone'}</div>
                          </td>
                          <td className="py-4 px-4">
                            {sub.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Ativo (Online)
                              </span>
                            ) : sub.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-950/40 text-rose-400 border border-rose-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Suspenso (Inadimplente)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Aguardando Pagamento
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono">
                            <div className="font-bold text-white">R$ 29,90/mês</div>
                            <div className="text-[10px] text-zinc-400">Recorrente Asaas</div>
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-400 text-xs">
                            <div>{new Date(sub.nextRenewalDate || Date.now()).toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] text-zinc-400">Renovação automática</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-white block">{sub.operatorName || 'Administrador Master'}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">Comissão: R$ 10,00/mês</span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === 'active' ? (
                                <button
                                  onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition flex items-center gap-1"
                                  title="Suspender site e exibir tela de inadimplência"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Suspender</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1"
                                  title="Reativar site no subdomínio"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Reativar</span>
                                </button>
                              )}

                              {sub.checkoutUrl && (
                                <button
                                  onClick={() => copyToClipboard(sub.checkoutUrl)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#161a26] text-zinc-200 border border-white/[0.08] hover:bg-white/[0.06] transition flex items-center gap-1"
                                  title="Copiar Fatura Asaas"
                                >
                                  <CreditCard className="w-3 h-3 text-emerald-400" />
                                  <span>Fatura Asaas</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedDomainProject(sub.id);
                                  setActiveTab('domains');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition flex items-center gap-1"
                                title="Migrar para Domínio Próprio (Opção 2 - R$ 490)"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Domínio</span>
                              </button>
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

        {/* =====================================================================
            TAB: MIGRAÇÃO E VINCULAÇÃO DE DOMÍNIO PRÓPRIO (OPÇÃO 2 - R$ 500)
           ===================================================================== */}
        {activeTab === 'domains' && (
          <AdminCustomDomains
            subscriptions={data?.subscriptions || []}
            onRefresh={loadData}
            selectedProjectId={selectedDomainProject}
          />
        )}

        {/* =====================================================================
            TAB 2: GESTOR DE LICENÇAS E SERIAIS (SYNADMIN DATATABLE)
           ===================================================================== */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            
            {/* Header da Aba com Ação de Gerar Serial */}
            <div className="bg-[#11141c] p-4.5 rounded-2xl border border-white/[0.06] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Licenças & Operadores Provisionados</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Auto-Onboarding Ativo
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gere chaves virgens para novos parceiros. O operador preenche o onboarding no primeiro uso do app desktop.
                </p>
              </div>

              <button
                onClick={handleGenerateSerial}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer border border-indigo-500/30"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Gerar Nova Chave Serial</span>
              </button>
            </div>

            {/* Tabela de Licenças Synadmin */}
            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Chave Serial (Token)</th>
                      <th className="py-3.5 px-4">Operador / E-mail</th>
                      <th className="py-3.5 px-4">Repasse Pix</th>
                      <th className="py-3.5 px-4">Hardware Lock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Ações de Gestão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(data?.licenses || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-zinc-400 text-xs">
                          Nenhuma licença cadastrada.
                        </td>
                      </tr>
                    ) : (
                      (data?.licenses || []).map((lic: any) => {
                        const isPendingApproval = lic.status === 'pending_approval' || lic.status === 'AGUARDANDO_APROVACAO';
                        const isVirgin = lic.status === 'pending_onboarding' || lic.status === 'VIRGEM';
                        const isActive = lic.status === 'active' || lic.status === 'ATIVO';

                        return (
                          <tr key={lic.id || lic.serialToken} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-5 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm bg-[#08090d] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                                  {lic.serialToken}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(lic.serialToken)}
                                  className="text-zinc-400 hover:text-white p-1"
                                  title="Copiar Serial"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-white block">
                                {lic.operatorName && lic.operatorName !== 'Aguardando Onboarding'
                                  ? lic.operatorName
                                  : isVirgin
                                  ? 'Chave Virgem (Sem Nome)'
                                  : 'Operador Não Identificado'}
                              </span>
                              <div className="text-[11px] mt-0.5">
                                {(lic.operatorEmail || lic.email) ? (
                                  <span className="text-zinc-300 font-mono text-[11px] font-medium">{lic.operatorEmail || lic.email}</span>
                                ) : isVirgin ? (
                                  <span className="text-amber-400/90 font-medium italic text-[10px]">Aguardando preenchimento no app</span>
                                ) : (
                                  <span className="text-zinc-500 text-[10px]">E-mail não cadastrado</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs">
                              {lic.pixKey ? (
                                <div>
                                  <span className="text-emerald-400 font-bold">{lic.pixKey}</span>
                                  <div className="text-[10px] text-zinc-400 uppercase">{lic.pixType}</div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 italic">Pendente</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">
                              {lic.machineId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  <span className="truncate max-w-[120px]" title={lic.machineId}>{lic.machineId}</span>
                                  <button
                                    onClick={() => handleResetMachine(lic.serialToken)}
                                    className="text-amber-400 hover:underline text-[10px] ml-1"
                                    title="Desvincular computador"
                                  >
                                    Resetar
                                  </button>
                                </div>
                              ) : (
                                <span className="text-zinc-400">Não vinculado</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                  ● Ativo
                                </span>
                              ) : isPendingApproval ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                                  ● Aguardando Aprovação
                                </span>
                              ) : isVirgin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900/60 text-zinc-300 border border-zinc-700/50">
                                  ● Chave Virgem
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/40 text-rose-400 border border-rose-800/40">
                                  ● Bloqueado
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isPendingApproval && (
                                  <button
                                    onClick={() => handleApproveOperator(lic.serialToken, lic.operatorId)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition border border-emerald-500/30"
                                  >
                                    ✓ Aprovar Operador
                                  </button>
                                )}

                                <button
                                  onClick={() => handleResetOperatorPassword(lic.serialToken, lic.operatorId)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#161a26] text-zinc-300 border border-white/[0.08] hover:bg-white/[0.06] transition"
                                  title="Gerar nova senha provisória de acesso web"
                                >
                                  Resetar Senha
                                </button>

                                <button
                                  onClick={() => handleToggleLicense(lic.serialToken, lic.status)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                    isActive
                                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  {isActive ? 'Bloquear' : 'Desbloquear'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: EXTRATO FINANCEIRO & REPASSES PIX (SYNADMIN DATATABLE)
           ===================================================================== */}
        {activeTab === 'financial' && (
          <div className="space-y-4">
            <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">Modelo SaaS Recorrente & Repasses Pix</h3>
              <p className="text-xs text-zinc-400">
                Cada assinatura ativa gera R$ 29,90/mês, com repasse mensal recorrente de R$ 10,00 para o operador parceiro enquanto o cliente estiver adimplente.
              </p>
            </div>

            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Data / ID</th>
                      <th className="py-3.5 px-4">Operador</th>
                      <th className="py-3.5 px-4">Cliente / Comércio</th>
                      <th className="py-3.5 px-4">Plano Mensal</th>
                      <th className="py-3.5 px-4">Repasse Operador</th>
                      <th className="py-3.5 px-4">Status Pix</th>
                      <th className="py-3.5 px-5 text-right">Ação Financeira</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(data?.sales || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-zinc-400 text-xs">
                          Nenhum repasse de comissão pendente no momento.
                        </td>
                      </tr>
                    ) : (
                      (data?.sales || []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-4 px-5 font-mono">
                            <span className="font-bold text-white">{s.id}</span>
                            <div className="text-[11px] text-zinc-400">
                              {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-white block">{s.operatorName}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{s.operatorId}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-zinc-200">{s.clientName}</div>
                            <div className="text-[11px] text-zinc-400">{s.niche || 'Comércio Local'}</div>
                          </td>
                          <td className="py-4 px-4 font-bold text-white font-mono">
                            R$ 29,90/mês
                          </td>
                          <td className="py-4 px-4 font-bold text-emerald-400 font-mono">
                            R$ 10,00/mês
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.pixStatus === 'PAGO'
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                            }`}>
                              {s.pixStatus === 'PAGO' ? 'Pix Efetuado' : 'Pix Pendente'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            {s.pixStatus === 'PENDENTE' ? (
                              <button
                                onClick={() => handlePayPixCommission(s.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition border border-emerald-500/30"
                              >
                                Pagar Pix
                              </button>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-mono">Liquidado</span>
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

        {/* =====================================================================
            TAB 4: CONFIGURAÇÕES CENTRAIS & APIS
           ===================================================================== */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
              <h3 className="text-sm font-bold text-white mb-1">Controle Central de Credenciais & APIs</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Todas as chaves salvas aqui são criptografadas e sincronizadas automaticamente com as máquinas dos operadores no heartbeat do app desktop.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Google Gemini API Key (IA)</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiSettings.geminiApiKey || ''}
                      onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Vercel Deploy Token</label>
                    <input
                      type="password"
                      placeholder="verc_tok_..."
                      value={apiSettings.vercelToken || ''}
                      onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Preço Mensalidade SaaS (R$)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={apiSettings.monthlySubscriptionPrice || 29.90}
                      onChange={(e) => setApiSettings({ ...apiSettings, monthlySubscriptionPrice: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Repasse Mensal por Assinatura (R$)</label>
                    <input
                      type="number"
                      step="0.50"
                      value={apiSettings.operatorCommissionMonthly || 10.00}
                      onChange={(e) => setApiSettings({ ...apiSettings, operatorCommissionMonthly: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition border border-indigo-500/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Salvar e Sincronizar Configurações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      </div>

      {/* =========================================================================
          MODAL: ALTERAR SENHA MASTER
         ========================================================================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Alterar Senha Master</span>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePasswordError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {changePasswordError}
              </div>
            )}

            {changePasswordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                {changePasswordSuccess}
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Senha Atual</label>
                <input
                  type="password"
                  required
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nova Senha</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090d] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition border border-indigo-500/30"
                >
                  {changePasswordLoading ? 'Salvando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

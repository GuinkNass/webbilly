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
  Sparkles,
  Phone
} from 'lucide-react';
import { startAdminTour } from '@/lib/tours';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'licenses' | 'candidates' | 'financial' | 'apis' | 'domains' | 'affiliates'>('subscriptions');
  const [selectedDomainProject, setSelectedDomainProject] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'TODOS' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CANCELLATION_REQUESTED'>('TODOS');
  const [subSearch, setSubSearch] = useState('');

  // Estados de Cancelamento Definitivo (Asaas + Vercel + Supabase)
  const [cancelDefinitiveSub, setCancelDefinitiveSub] = useState<any | null>(null);
  const [cancelDefinitiveLoading, setCancelDefinitiveLoading] = useState(false);
  const [cancelDefinitiveSuccess, setCancelDefinitiveSuccess] = useState<string | null>(null);
  const [cancelDefinitiveError, setCancelDefinitiveError] = useState<string | null>(null);

  const handleExecuteDefinitiveCancellation = async () => {
    if (!cancelDefinitiveSub) return;
    setCancelDefinitiveLoading(true);
    setCancelDefinitiveError(null);
    setCancelDefinitiveSuccess(null);
    try {
      const res = await fetch('/api/admin/subscriptions/cancel-definitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: cancelDefinitiveSub.id,
          siteSlug: cancelDefinitiveSub.siteSlug || cancelDefinitiveSub.slug
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao executar cancelamento definitivo.');

      setCancelDefinitiveSuccess('Cancelamento definitivo executado com sucesso no Asaas, Vercel e Supabase.');
      await loadData();
      setTimeout(() => {
        setCancelDefinitiveSub(null);
        setCancelDefinitiveSuccess(null);
      }, 2000);
    } catch (err: any) {
      setCancelDefinitiveError(err.message || 'Falha ao executar cancelamento.');
    } finally {
      setCancelDefinitiveLoading(false);
    }
  };

  // Estados de formulário e modal
  const [approvalModalData, setApprovalModalData] = useState<any>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Modal de Provisionamento de E-mail Corporativo @webbilly.com.br
  const [provisionModal, setProvisionModal] = useState<{
    isOpen: boolean;
    operatorId: string;
    operatorName: string;
    suggestedPrefix: string;
    customPrefix: string;
    loading: boolean;
    result?: {
      corporateEmail: string;
      tempPassword?: string;
      larkProvisioned: boolean;
      message: string;
    };
    error?: string;
  } | null>(null);
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
  const [candidateSearch, setCandidateSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

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

  // Disparo automático do Tour Admin Master no primeiro acesso
  useEffect(() => {
    if (!loading && data) {
      try {
        const hasSeenTour = localStorage.getItem('webbilly_tour_admin_v1');
        if (!hasSeenTour) {
          const timer = setTimeout(() => {
            startAdminTour((tab) => setActiveTab(tab as any));
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [loading, data]);

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

  // Abrir Modal de Provisionamento de E-mail Corporativo @webbilly
  const handleOpenProvisionModal = (lic: any) => {
    const op = (data?.operators || []).find((o: any) =>
      (lic.operatorId && o.id === lic.operatorId) ||
      (lic.serialToken && (o.serialToken || '').trim().toUpperCase() === lic.serialToken.trim().toUpperCase())
    );
    const targetId = op?.id || lic.operatorId || lic.id;
    const targetName = op?.name || lic.operatorName || 'Operador';

    const cleanPrefix = targetName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');

    setProvisionModal({
      isOpen: true,
      operatorId: targetId,
      operatorName: targetName,
      suggestedPrefix: cleanPrefix,
      customPrefix: cleanPrefix,
      loading: false
    });
  };

  // Confirmar Provisionamento via API
  const handleConfirmProvisionEmail = async () => {
    if (!provisionModal) return;
    setProvisionModal(prev => prev ? { ...prev, loading: true, error: undefined } : null);

    try {
      const res = await fetch('/api/admin/operators/provision-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: provisionModal.operatorId,
          customPrefix: provisionModal.customPrefix
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao provisionar e-mail corporativo.');

      setProvisionModal(prev => prev ? {
        ...prev,
        loading: false,
        result: {
          corporateEmail: json.corporateEmail,
          tempPassword: json.tempPassword,
          larkProvisioned: json.larkProvisioned,
          message: json.message
        }
      } : null);

      await loadData();
    } catch (err: any) {
      setProvisionModal(prev => prev ? {
        ...prev,
        loading: false,
        error: err.message || 'Erro ao provisionar e-mail corporativo.'
      } : null);
    }
  };

  // Aprovação Oficial de Candidatura (Gera Serial, E-mail Corporativo e Senha Provisória)
  const handleApproveCandidate = async (operatorId: string, candidateName: string) => {
    if (!confirm(`Deseja aprovar a candidatura de ${candidateName}? O sistema gerará o e-mail corporativo (@webbilly.com.br), senha provisória e chave serial do programa desktop, disparando automaticamente para o e-mail pessoal.`)) return;

    setApprovingId(operatorId);
    try {
      const res = await fetch('/api/admin/operators/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao aprovar candidato.');

      setActionSuccess(`✓ ${json.message}`);
      setTimeout(() => setActionSuccess(null), 8000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar operador.');
    } finally {
      setApprovingId(null);
    }
  };

  // Recusa Cordial por Contingência Operacional (Banco de Talentos)
  const handleRejectCandidate = async (operatorId: string, candidateName: string) => {
    if (!confirm(`Deseja recusar a candidatura de ${candidateName} por contingência operacional? O candidato receberá um e-mail cordial informando que seu perfil permanecerá no banco de talentos.`)) return;

    setRejectingId(operatorId);
    try {
      const res = await fetch('/api/admin/operators/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao recusar candidatura.');

      setActionSuccess(`✕ ${json.message}`);
      setTimeout(() => setActionSuccess(null), 8000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao recusar operador.');
    } finally {
      setRejectingId(null);
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
  const pendingCancellationsCount = (data?.subscriptions || []).filter(
    (s: any) => (s.cancellationRequested || s.cancellation_requested) && s.status !== 'cancelled'
  ).length;

  const subscriptionsList = (data?.subscriptions || []).filter((sub: any) => {
    if (subFilter === 'ACTIVE' && sub.status !== 'active') return false;
    if (subFilter === 'SUSPENDED' && sub.status !== 'suspended') return false;
    if (subFilter === 'PENDING' && sub.status !== 'pending') return false;
    if (subFilter === 'CANCELLATION_REQUESTED' && !sub.cancellationRequested && !sub.cancellation_requested) return false;
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
                id="tour-admin-nav-subscriptions"
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
                id="tour-admin-nav-domains"
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
                id="tour-admin-nav-licenses"
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

              {/* Fila de Triagem de Candidaturas */}
              <button
                id="tour-admin-nav-candidates"
                onClick={() => setActiveTab('candidates')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'candidates'
                    ? 'bg-amber-600/90 text-white font-medium border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'candidates' ? 'text-white' : 'text-amber-400 group-hover:text-amber-300'}`} />
                  <span>Candidaturas Pendentes</span>
                </div>
                {((data?.operators || []).filter((o: any) => o.status === 'PENDENTE').length > 0) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 font-mono">
                    {(data?.operators || []).filter((o: any) => o.status === 'PENDENTE').length}
                  </span>
                )}
              </button>

              <button
                id="tour-admin-nav-financial"
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
                onClick={() => setActiveTab('affiliates')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'affiliates'
                    ? 'bg-indigo-600/90 text-white font-medium border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'affiliates' ? 'text-white' : 'text-[#84cc16] group-hover:text-lime-300'}`} />
                  <span>Billy Afiliados</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'affiliates' ? 'bg-white/20 text-white' : 'bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40'
                }`}>
                  5%
                </span>
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
        <header
          id="tour-admin-header"
          className="sticky top-0 z-30 h-16 bg-[#0f121a]/95 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-8 flex items-center justify-between shrink-0"
        >
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
            {/* Botão Oficial do Tour Admin Master */}
            <button
              onClick={() => startAdminTour((tab) => setActiveTab(tab as any))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#a3e635] hover:text-white border border-[#84cc16]/40 transition shadow-sm cursor-pointer"
              title="Iniciar Tour Guiado do Painel Admin Master"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>? Tour Admin</span>
            </button>

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
          <div id="tour-admin-subscriptions" className="space-y-4">
            
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
                <button
                  onClick={() => setSubFilter('CANCELLATION_REQUESTED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    subFilter === 'CANCELLATION_REQUESTED'
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50'
                      : pendingCancellationsCount > 0
                      ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 animate-pulse'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cancelamento Solicitado</span>
                  {pendingCancellationsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono">
                      {pendingCancellationsCount}
                    </span>
                  )}
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
                      subscriptionsList.map((sub: any) => {
                        const hasCancellationRequest = Boolean(sub.cancellationRequested || sub.cancellation_requested);
                        return (
                        <tr
                          key={sub.id}
                          className={`${hasCancellationRequest ? 'bg-rose-500/[0.05] border-l-4 border-l-rose-500' : ''} hover:bg-white/[0.02] transition`}
                        >
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
                          <td className="py-4 px-4 space-y-1">
                            <div>
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
                              ) : sub.status === 'cancelled' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                  Cancelado Definitivo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  Aguardando Pagamento
                                </span>
                              )}
                            </div>

                            {hasCancellationRequest && sub.status !== 'cancelled' && (
                              <div className="pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>Cancelamento Solicitado</span>
                                </span>
                                {(sub.cancellationReason || sub.cancellation_reason) && (
                                  <div className="text-[10px] text-zinc-300 mt-0.5 max-w-xs break-words">
                                    Motivo: &ldquo;{sub.cancellationReason || sub.cancellation_reason}&rdquo;
                                  </div>
                                )}
                              </div>
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
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {/* Botão Cancelamento Definitivo */}
                              {sub.status !== 'cancelled' && (
                                <button
                                  onClick={() => {
                                    setCancelDefinitiveSub(sub);
                                    setCancelDefinitiveError(null);
                                    setCancelDefinitiveSuccess(null);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                    hasCancellationRequest
                                      ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950/50'
                                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                                  }`}
                                  title="Cancelar cobrança no Asaas e excluir subdomínio na Vercel"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Cancelar Definitivo</span>
                                </button>
                              )}

                              {sub.status === 'active' ? (
                                <button
                                  onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition flex items-center gap-1"
                                  title="Suspender site e exibir tela de inadimplência"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Suspender</span>
                                </button>
                              ) : sub.status === 'suspended' ? (
                                <button
                                  onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1"
                                  title="Reativar site no subdomínio"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Reativar</span>
                                </button>
                              ) : null}

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
            TAB: MIGRAÇÃO E VINCULAÇÃO DE DOMÍNIO PRÓPRIO
           ===================================================================== */}
        {activeTab === 'domains' && (
          <div id="tour-admin-domains">
            <AdminCustomDomains
              subscriptions={data?.subscriptions || []}
              onRefresh={loadData}
              selectedProjectId={selectedDomainProject}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 2: GESTOR DE LICENÇAS E SERIAIS (SYNADMIN DATATABLE)
           ===================================================================== */}
        {activeTab === 'licenses' && (
          <div id="tour-admin-operators" className="space-y-4">
            
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
                      <th className="py-3.5 px-4 text-center">Medalha & Ranking</th>
                      <th className="py-3.5 px-4">Repasse Pix</th>
                      <th className="py-3.5 px-4">Hardware Lock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Ações de Gestão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(data?.licenses || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-zinc-400 text-xs">
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

                              {/* E-mail Corporativo @webbilly */}
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                {lic.corporate_email ? (
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                                    <Mail className="w-3 h-3 text-cyan-400" />
                                    <span>{lic.corporate_email}</span>
                                    <button
                                      onClick={() => copyToClipboard(lic.corporate_email)}
                                      className="text-cyan-400 hover:text-white p-0.5 cursor-pointer"
                                      title="Copiar e-mail corporativo"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    {lic.lark_provisioned && (
                                      <span className="text-[9px] text-emerald-400 bg-emerald-950/50 px-1 py-0.2 rounded border border-emerald-800/40">
                                        Lark OK
                                      </span>
                                    )}
                                  </div>
                                ) : !isVirgin ? (
                                  <button
                                    onClick={() => handleOpenProvisionModal(lic)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition cursor-pointer"
                                    title="Criar e-mail corporativo oficial @webbilly.com.br"
                                  >
                                    <Mail className="w-3 h-3 text-emerald-400" />
                                    <span>+ Gerar E-mail @webbilly</span>
                                  </button>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {lic.referred_by_name && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                    <span>Padrinho:</span>
                                    <strong className="text-white">{lic.referred_by_name}</strong>
                                  </span>
                                )}
                                {lic.affiliate_enabled ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/30">
                                    <span>Afiliados:</span>
                                    <span className="font-mono">{lic.affiliate_code || 'Ativo'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 text-zinc-500">
                                    Afiliados: Inativo
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Medalha & Ranking do Operador */}
                            <td className="py-4 px-4 text-center">
                              {(() => {
                                const cleanSerial = (lic.serialToken || '').trim().toUpperCase();
                                const op = (data?.operators || []).find((o: any) =>
                                  (o.serialToken || '').trim().toUpperCase() === cleanSerial ||
                                  (lic.operatorId && o.id === lic.operatorId)
                                );
                                if (!op || !op.medal) {
                                  return <span className="text-zinc-600 text-[10px]">-</span>;
                                }

                                return (
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${op.medal?.badgeBg || 'bg-zinc-800'} ${op.medal?.badgeText || 'text-zinc-400'} ${op.medal?.badgeBorder || 'border-zinc-700'}`}>
                                      <span>{op.medal?.icon || '🌱'}</span>
                                      <span>{op.medal?.name || 'Iniciante'}</span>
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                      <span className="font-mono text-emerald-400 font-bold">#{op.rank || 1}</span>
                                      <span>•</span>
                                      <span className="font-mono">{op.rankingScore || 0} pts</span>
                                    </div>
                                    {op.hasMedalUpgradeBonus && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        +20% Bônus
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
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
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                    lic.corporate_email
                                      ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/50'
                                      : 'bg-[#161a26] text-zinc-300 border-white/[0.08] hover:bg-white/[0.06]'
                                  }`}
                                  title={
                                    lic.corporate_email
                                      ? 'Resetar senha corporativa e enviar credenciais provisórias'
                                      : 'Gerar nova senha provisória de acesso web'
                                  }
                                >
                                  {lic.corporate_email ? 'Resetar Senha Corporativa' : 'Resetar Senha'}
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
            TAB: FILA DE TRIAGEM & ADMISSÃO DE CANDIDATURAS PENDENTES
           ===================================================================== */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Triagem & Admissão
                  </span>
                  <h3 className="text-base font-bold text-white">Candidaturas de Novos Operadores</h3>
                </div>
                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  Candidatos que submeteram a ficha oficial em <code className="text-cyan-300 font-mono">/trabalheconosco/candidatura</code>. Ao aprovar, o sistema gera automaticamente a <strong>Chave Serial Billy Desktop</strong>, a caixa postal corporativa <strong>@webbilly.com.br</strong>, a <strong>senha provisória</strong> e notifica o candidato por e-mail pessoal.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    placeholder="Buscar por nome, CPF, cidade ou e-mail..."
                    className="w-64 pl-9 pr-3 py-2 bg-[#08090d] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b0e14] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Candidato / Identificação</th>
                      <th className="py-3.5 px-4">Contato Oficial</th>
                      <th className="py-3.5 px-4">Região & Endereço</th>
                      <th className="py-3.5 px-4">Recebimento Pix</th>
                      <th className="py-3.5 px-4">Experiência Comercial</th>
                      <th className="py-3.5 px-5 text-right">Ações de Triagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(() => {
                      const pendingList = (data?.operators || []).filter((o: any) => {
                        const isPending = o.status === 'PENDENTE' || o.status === 'pending';
                        if (!isPending) return false;
                        if (!candidateSearch) return true;
                        const term = candidateSearch.toLowerCase();
                        return (
                          (o.name || '').toLowerCase().includes(term) ||
                          (o.email || '').toLowerCase().includes(term) ||
                          (o.cpf || '').includes(term) ||
                          (o.city_state || '').toLowerCase().includes(term)
                        );
                      });

                      if (pendingList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-400 text-xs">
                              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-2 text-zinc-500">
                                <Users className="w-6 h-6" />
                              </div>
                              <p className="font-semibold text-zinc-300">Nenhuma candidatura pendente no momento.</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">Todas as fichas de operadores já foram triadas ou aprovadas.</p>
                            </td>
                          </tr>
                        );
                      }

                      return pendingList.map((cand: any) => {
                        const cleanDigits = (cand.whatsapp || '').replace(/\D/g, '');
                        const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;
                        const waUrl = cleanDigits ? `https://wa.me/${formattedPhone}` : null;
                        const isApproving = approvingId === cand.id;
                        const isRejecting = rejectingId === cand.id;

                        return (
                          <tr key={cand.id || cand.email} className="hover:bg-white/[0.02] transition">
                            {/* Candidato / Identificação */}
                            <td className="py-4 px-5">
                              <span className="font-bold text-white text-sm block">
                                {cand.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                {cand.cpf && (
                                  <span className="font-mono text-zinc-400 text-[11px]">
                                    CPF: {cand.cpf}
                                  </span>
                                )}
                                <span className="text-zinc-600">•</span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {cand.createdAt ? new Date(cand.createdAt).toLocaleDateString('pt-BR') : 'Data não registrada'}
                                </span>
                              </div>
                              {cand.referred_by_name && (
                                <div className="mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                    <span>Padrinho:</span>
                                    <strong className="text-white">{cand.referred_by_name}</strong>
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Contato Oficial */}
                            <td className="py-4 px-4 space-y-1">
                              <div>
                                {waUrl ? (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold transition"
                                    title="Chamar candidato no WhatsApp"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{cand.whatsapp}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                  </a>
                                ) : (
                                  <span className="text-zinc-400 font-mono text-[11px]">{cand.whatsapp}</span>
                                )}
                              </div>
                              <div>
                                <a
                                  href={`mailto:${cand.email}`}
                                  className="text-zinc-300 hover:text-white font-mono text-[11px] hover:underline"
                                >
                                  {cand.email}
                                </a>
                              </div>
                            </td>

                            {/* Região & Endereço */}
                            <td className="py-4 px-4">
                              <span className="font-semibold text-white block">
                                {cand.city_state || cand.cityState || 'Região não informada'}
                              </span>
                              <div className="text-[11px] text-zinc-400 mt-0.5 space-y-0.5">
                                {cand.neighborhood && <div>Bairro: {cand.neighborhood}</div>}
                                {cand.address && <div className="truncate max-w-[200px]" title={cand.address}>{cand.address}</div>}
                                {cand.cep && <div className="font-mono text-[10px]">CEP: {cand.cep}</div>}
                              </div>
                            </td>

                            {/* Recebimento Pix */}
                            <td className="py-4 px-4">
                              {cand.pixKey || cand.pix_key ? (
                                <div className="space-y-0.5">
                                  <span className="text-emerald-400 font-mono font-bold text-xs block">
                                    {cand.pixKey || cand.pix_key}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                                    Tipo: {(cand.pixType || cand.pix_type || 'CPF')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-500 italic text-[11px]">Não cadastrada</span>
                              )}
                            </td>

                            {/* Experiência Comercial */}
                            <td className="py-4 px-4 max-w-[240px]">
                              {cand.experience ? (
                                <p className="text-zinc-300 text-[11px] line-clamp-3 leading-relaxed" title={cand.experience}>
                                  {cand.experience}
                                </p>
                              ) : (
                                <span className="text-zinc-500 italic text-[11px]">Sem detalhes informados</span>
                              )}
                            </td>

                            {/* Ações de Triagem */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Botão Aprovar e Criar Conta @webbilly */}
                                <button
                                  onClick={() => handleApproveCandidate(cand.id, cand.name)}
                                  disabled={isApproving || isRejecting}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#65a30d] text-zinc-950 transition flex items-center gap-1.5 shadow-md shadow-[#84cc16]/20 cursor-pointer disabled:opacity-50"
                                  title="Aprovar candidato, gerar serial, e-mail @webbilly e enviar credenciais por e-mail"
                                >
                                  {isApproving ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Aprovando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Aprovar @webbilly</span>
                                    </>
                                  )}
                                </button>

                                {/* Botão Negar por Contingência */}
                                <button
                                  onClick={() => handleRejectCandidate(cand.id, cand.name)}
                                  disabled={isApproving || isRejecting}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  title="Negar por contingência operacional e manter em banco de talentos"
                                >
                                  {isRejecting ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Recusando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3" />
                                      <span>Contingência</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
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
          <div id="tour-admin-payouts" className="space-y-4">
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

        {/* =====================================================================
            TAB 5: RANKING & EVOLUÇÃO BILLY AFILIADOS (AUDITORIA DE REDES)
           ===================================================================== */}
        {activeTab === 'affiliates' && (
          <div className="space-y-6">
            {/* Header da Aba */}
            <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#a3e635] text-xs font-bold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Módulo Executivo • Billy Afiliados
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Ranking & Evolução da Rede de Afiliados
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Auditoria de padrinhos, taxa de ativação de indicados, volume de vendas de domínio da rede e repasses de 5% (R$ 24,50).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30">
                  Comissão Rede: 5% (R$ 24,50)
                </span>
              </div>
            </div>

            {/* 4 Cards de Resumo Executivo */}
            {(() => {
              const sponsors = data?.affiliateSponsors || [];
              const totalRecruits = sponsors.reduce((acc: number, s: any) => acc + (s.totalRecruits || 0), 0);
              const totalMonthlySales = sponsors.reduce((acc: number, s: any) => acc + (s.monthlyNetworkDomainSales || 0), 0);
              const totalCommissions = sponsors.reduce((acc: number, s: any) => acc + (s.totalEarnedCommissions || 0), 0);

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Padrinhos Ativos</span>
                    <span className="text-2xl font-black text-white font-mono">{sponsors.length}</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">Operadores com rede</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Indicados na Base</span>
                    <span className="text-2xl font-black text-sky-400 font-mono">{totalRecruits}</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">Cadastrados via convite</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Vendas Domínio (Mês)</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">{totalMonthlySales}</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">Pacotes R$ 490 pela rede</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#11141c] border border-[#84cc16]/30">
                    <span className="text-[10px] uppercase font-bold text-[#a3e635] block">Comissões 5% Acumuladas</span>
                    <span className="text-2xl font-black text-[#a3e635] font-mono">
                      R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">Geradas para padrinhos</span>
                  </div>
                </div>
              );
            })()}

            {/* Gráfico Comparativo dos Maiores Padrinhos */}
            <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#84cc16]" />
                    <span>Ranking dos Maiores Padrinhos (Volume de Rede & Comissões)</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Classificação baseada em indicados ativos vendendo e volume de comissões geradas.
                  </p>
                </div>
              </div>

              {(() => {
                const sponsors = data?.affiliateSponsors || [];
                if (sponsors.length === 0) {
                  return (
                    <div className="p-8 rounded-xl bg-black/30 border border-white/[0.04] text-center text-xs text-zinc-500">
                      Nenhum padrinho com indicados ou comissões registradas até o momento.
                    </div>
                  );
                }

                const maxCommissions = Math.max(100, ...sponsors.map((s: any) => s.totalEarnedCommissions || 0));

                return (
                  <div className="space-y-3 pt-2">
                    {sponsors.map((s: any, idx: number) => {
                      const pct = Math.max(8, Math.round(((s.totalEarnedCommissions || 0) / maxCommissions) * 100));
                      return (
                        <div key={s.sponsorId || idx} className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-2 group hover:border-[#84cc16]/40 transition">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold font-mono text-[11px] flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-white block">{s.sponsorName}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">Código: {s.affiliateCode} • {s.sponsorEmail}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-[#a3e635] text-sm block">
                                R$ {(s.totalEarnedCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {s.totalRecruits} indicados ({s.recruitsSellingThisMonthCount} vendendo no mês)
                              </span>
                            </div>
                          </div>

                          {/* Barra de Progresso Visual */}
                          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#84cc16] to-[#a3e635] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Tabela de Auditoria de Redes Billy Afiliados */}
            <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#84cc16]" />
                    <span>Tabela de Auditoria Completa de Redes</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Detalhamento de cada padrinho, rede de indicados, taxa de ativação e status dos repasses de 5%.
                  </p>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-white/[0.08]">
                  {(data?.affiliateSponsors || []).length} redes cadastradas
                </span>
              </div>

              {(() => {
                const sponsors = data?.affiliateSponsors || [];
                if (sponsors.length === 0) {
                  return (
                    <div className="p-8 rounded-xl bg-black/30 border border-white/[0.04] text-center text-xs text-zinc-500">
                      Nenhuma rede de afiliados para auditar no momento.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-zinc-400 uppercase text-[10px]">
                          <th className="py-3 px-4 font-bold">Padrinho (Patrocinador)</th>
                          <th className="py-3 px-4 font-bold">Indicados Cadastrados</th>
                          <th className="py-3 px-4 font-bold text-center">Taxa de Ativação</th>
                          <th className="py-3 px-4 font-bold text-center">Vendas Domínio (Mês)</th>
                          <th className="py-3 px-4 font-bold text-right">Repasses 5% (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {sponsors.map((s: any, idx: number) => {
                          const recruits = s.recruits || [];
                          return (
                            <tr key={s.sponsorId || idx} className="hover:bg-white/[0.02] transition">
                              <td className="py-4 px-4">
                                <div className="font-semibold text-white">{s.sponsorName}</div>
                                <div className="text-[10px] text-zinc-400 font-mono">{s.sponsorEmail}</div>
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/30">
                                  <span>Código: {s.affiliateCode}</span>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="font-medium text-zinc-200">
                                  {s.totalRecruits} {s.totalRecruits === 1 ? 'indicado' : 'indicados'}
                                </div>
                                {recruits.length > 0 && (
                                  <div className="text-[10px] text-zinc-400 mt-1 space-y-0.5 max-w-xs truncate">
                                    {recruits.slice(0, 3).map((r: any, rIdx: number) => (
                                      <div key={rIdx} className="truncate">
                                        • {r.name} ({r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '-'})
                                      </div>
                                    ))}
                                    {recruits.length > 3 && (
                                      <div className="text-zinc-500 italic">+ {recruits.length - 3} outros</div>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="py-4 px-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className={`font-mono font-bold text-sm ${
                                    s.activationRate >= 50 ? 'text-emerald-400' : s.activationRate > 0 ? 'text-amber-400' : 'text-zinc-500'
                                  }`}>
                                    {s.activationRate}%
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    {s.activeRecruitsCount}/{s.totalRecruits} ativos
                                  </span>
                                </div>
                              </td>

                              <td className="py-4 px-4 text-center font-mono font-bold text-amber-400">
                                {s.monthlyNetworkDomainSales}
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="font-mono font-bold text-[#a3e635] text-sm">
                                  R$ {(s.totalEarnedCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[10px] text-zinc-400 space-x-1.5 mt-0.5">
                                  <span title="Disponível para saque">Disp: <strong className="text-emerald-400 font-mono">R${(s.availableCommissions || 0).toFixed(0)}</strong></span>
                                  <span>•</span>
                                  <span title="Solicitado neste mês">Sol: <strong className="text-amber-300 font-mono">R${(s.requestedCommissions || 0).toFixed(0)}</strong></span>
                                  <span>•</span>
                                  <span title="Já pago">Pago: <strong className="text-zinc-300 font-mono">R${(s.paidCommissionsAmount || 0).toFixed(0)}</strong></span>
                                </div>
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

      {/* =========================================================================
          MODAL: PROVISIONAR E-MAIL CORPORATIVO (@webbilly.com.br)
         ========================================================================= */}
      {provisionModal && provisionModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#11141c] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Provisionar E-mail Corporativo</h3>
                  <p className="text-[11px] text-zinc-400">Operador: <strong className="text-white">{provisionModal.operatorName}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setProvisionModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {provisionModal.error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{provisionModal.error}</span>
              </div>
            )}

            {provisionModal.result ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>E-mail Corporativo Gerado com Sucesso!</span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">
                    {provisionModal.result.message}
                  </p>
                </div>

                <div className="bg-[#08090d] border border-white/[0.08] rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-zinc-400 text-[10px] block uppercase font-sans">E-mail Corporativo (@webbilly.com.br)</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-cyan-300 font-bold text-sm">{provisionModal.result.corporateEmail}</span>
                      <button
                        onClick={() => copyToClipboard(provisionModal.result!.corporateEmail)}
                        className="text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </button>
                    </div>
                  </div>

                  {provisionModal.result.tempPassword && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-zinc-400 text-[10px] block uppercase font-sans">Senha Provisória (Troca Obrigatória no 1º Acesso)</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-amber-300 font-bold text-sm">{provisionModal.result.tempPassword}</span>
                        <button
                          onClick={() => copyToClipboard(provisionModal.result!.tempPassword!)}
                          className="text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/[0.06] text-[10px] font-sans">
                    <span className="text-zinc-400 block uppercase font-sans mb-1">Status Lark Suite</span>
                    {provisionModal.result.larkProvisioned ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Caixa postal provisionada via Lark API com sucesso.
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        Modo Seguro / Manual: Crie o usuário no console do Lark Suite (<code className="text-zinc-300">mail.larksuite.com</code>) usando o endereço e a senha acima.
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setProvisionModal(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Prefixo do E-mail Corporativo
                  </label>
                  <div className="flex items-center rounded-xl bg-[#08090d] border border-white/[0.08] focus-within:border-cyan-500 px-3 py-2 transition">
                    <input
                      type="text"
                      value={provisionModal.customPrefix}
                      onChange={(e) => setProvisionModal({ ...provisionModal, customPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, '') })}
                      placeholder="nome.sobrenome"
                      className="bg-transparent text-white text-xs focus:outline-none flex-1 font-mono"
                    />
                    <span className="text-cyan-400 font-mono text-xs font-bold pl-1">
                      @webbilly.com.br
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Endereço final: <span className="font-mono text-cyan-300">{provisionModal.customPrefix || 'nome.sobrenome'}@webbilly.com.br</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.05] text-[11px] text-zinc-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Automação Integrada</span>
                  </div>
                  <p>
                    1. Salva o e-mail oficial no cadastro do operador no Supabase.
                  </p>
                  <p>
                    2. Cria a senha temporária inicial (<code className="text-amber-300 font-mono">Billy@2026#XXXX</code>) com troca obrigatória no primeiro acesso.
                  </p>
                  <p>
                    3. Notifica o operador por e-mail com as credenciais de acesso corporativo.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setProvisionModal(null)}
                    disabled={provisionModal.loading}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmProvisionEmail}
                    disabled={provisionModal.loading || !provisionModal.customPrefix}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition border border-cyan-500/30 flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20"
                  >
                    {provisionModal.loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Provisionando...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Confirmar e Criar E-mail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CANCELAMENTO DEFINITIVO 1-CLIQUE (ASAAS + VERCEL + SUPABASE)
         ========================================================================= */}
      {cancelDefinitiveSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#11141c] border border-rose-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-base">Confirmar Cancelamento Definitivo</h3>
              </div>
              <button
                onClick={() => setCancelDefinitiveSub(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Cliente:</span>
                  <span className="font-bold text-white">{cancelDefinitiveSub.clientName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-zinc-400">Subdomínio:</span>
                  <span className="text-sky-400 font-bold">{cancelDefinitiveSub.siteSlug || cancelDefinitiveSub.slug}.webbilly.com.br</span>
                </div>
                {cancelDefinitiveSub.asaasSubscriptionId && (
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">ID Assinatura Asaas:</span>
                    <span className="text-emerald-400">{cancelDefinitiveSub.asaasSubscriptionId}</span>
                  </div>
                )}
                {(cancelDefinitiveSub.cancellationReason || cancelDefinitiveSub.cancellation_reason) && (
                  <div className="pt-1.5 border-t border-white/[0.06]">
                    <span className="text-amber-400 font-semibold block text-[11px]">Motivo informado pelo Operador:</span>
                    <p className="text-zinc-300 italic text-[11px] mt-0.5">
                      &ldquo;{cancelDefinitiveSub.cancellationReason || cancelDefinitiveSub.cancellation_reason}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[11px] space-y-1 text-rose-300">
                <div className="font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Ações Irreversíveis que Serão Executadas:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                  <li><strong>Asaas:</strong> exclusão imediata da assinatura recorrente (DELETE /v3/subscriptions) para cessar qualquer cobrança futura.</li>
                  <li><strong>Vercel:</strong> exclusão do subdomínio e projeto na infraestrutura Vercel + suspensão no Edge Config.</li>
                  <li><strong>Supabase:</strong> status marcado como &quot;cancelled&quot; e site_status como &quot;deleted&quot;.</li>
                </ul>
              </div>
            </div>

            {cancelDefinitiveError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cancelDefinitiveError}</span>
              </div>
            )}

            {cancelDefinitiveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{cancelDefinitiveSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelDefinitiveSub(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleExecuteDefinitiveCancellation}
                disabled={cancelDefinitiveLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition border border-rose-500/40 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-950/40"
              >
                {cancelDefinitiveLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelando no Asaas e Vercel...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Confirmar Cancelamento Definitivo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

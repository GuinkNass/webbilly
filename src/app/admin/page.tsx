'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  RotateCcw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'licenses' | 'candidates' | 'financial' | 'apis'>('subscriptions');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'TODOS' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('TODOS');
  const [subSearch, setSubSearch] = useState('');

  // Estados de formulário e modal
  const [approvalModalData, setApprovalModalData] = useState<any>(null);
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

  const [filterCandidate, setFilterCandidate] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'RECUSADO'>('TODOS');
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

  // Aprovar ou Recusar Candidato
  const handleReviewCandidate = async (candidateId: string, action: 'APROVAR' | 'RECUSAR') => {
    try {
      const res = await fetch('/api/candidates/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (action === 'APROVAR') {
        setApprovalModalData(json);
      } else {
        setActionSuccess(`Candidatura recusada com sucesso.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar ação no candidato.');
    }
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

      setActionSuccess(`Assinatura ${subscriptionId} alterada para: ${newStatus === 'active' ? 'Ativo (Site Online)' : 'Suspenso (Tela de Inadimplência Ativada)'}`);
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
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Carregando Painel Administrativo Master...</span>
        </div>
      </div>
    );
  }

  const filteredCandidates = (data?.candidates || []).filter((c: any) => {
    if (filterCandidate !== 'TODOS' && c.status !== filterCandidate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.whatsapp.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-16">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Billy Master Admin</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  CENTRAL CONTROL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">WebBilly - Gestão Centralizada da Operação</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/operador"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              Área do Operador
            </Link>
            <button
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-zinc-800"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner de Feedback */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Métricas do Topo: Pivot SaaS Recorrente (R$ 29,90/mês) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Sites Ativos no Subdomínio
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {data?.metrics?.totalActiveSites || 0} sites
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Assinaturas adimplentes</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              MRR Atual (Recorrente)
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              R$ {(data?.metrics?.currentMRR || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Base: R$ 29,90/mês por cliente</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Inadimplência / Suspensos
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {data?.metrics?.delinquencyRate || 0}%
            </div>
            <span className="text-[10px] text-zinc-500">
              {data?.metrics?.totalSuspendedSites || 0} suspensos • {data?.metrics?.totalPendingSites || 0} pendentes
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Comissões Parceiros/Mês
            </span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              R$ {(data?.metrics?.monthlyOperatorCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Repasse recorrente de R$ 10/site</span>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-zinc-800 mb-6 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'subscriptions'
                ? 'border-emerald-500 text-white bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            Gestão de Assinaturas (R$ 29,90/mês)
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data?.subscriptions?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'candidates'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Candidatos a Operadores
            {data?.metrics?.pendingCandidatesCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {data.metrics.pendingCandidatesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'licenses'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Gestor de Licenças & Seriais
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
              {data?.licenses?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'financial'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Extrato Financeiro Global
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'apis'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Controle Central de APIs
          </button>
        </div>

        {/* ========================================================= */}
        {/* CONTEÚDO DA ABA PRINCIPAL: GESTÃO DE ASSINATURAS (SAAS)   */}
        {/* ========================================================= */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {(['TODOS', 'ACTIVE', 'SUSPENDED', 'PENDING'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSubFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      subFilter === st
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {st === 'TODOS' && 'Todos'}
                    {st === 'ACTIVE' && 'Ativos (Online)'}
                    {st === 'SUSPENDED' && 'Suspensos (Inadimplentes)'}
                    {st === 'PENDING' && 'Pendentes'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar comércio, slug ou cliente..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tabela de Assinaturas */}
            <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Comércio / Subdomínio</th>
                      <th className="py-3.5 px-4">Cliente / WhatsApp</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Plano</th>
                      <th className="py-3.5 px-4">Renovação</th>
                      <th className="py-3.5 px-4">Operador</th>
                      <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {data?.subscriptions
                      ?.filter((s: any) => {
                        if (subFilter === 'ACTIVE') return s.status === 'active';
                        if (subFilter === 'SUSPENDED') return s.status === 'suspended';
                        if (subFilter === 'PENDING') return s.status === 'pending';
                        return true;
                      })
                      ?.filter((s: any) => {
                        if (!subSearch.trim()) return true;
                        const term = subSearch.toLowerCase();
                        return (
                          s.clientName?.toLowerCase().includes(term) ||
                          s.siteSlug?.toLowerCase().includes(term) ||
                          s.clientPhone?.includes(term) ||
                          s.operatorName?.toLowerCase().includes(term)
                        );
                      })
                      ?.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">
                              {sub.clientName}
                            </div>
                            <a
                              href={`https://${sub.siteSlug}.webbilly.com.br`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 hover:underline mt-0.5"
                            >
                              <span>{sub.siteSlug}.webbilly.com.br</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-zinc-200 font-medium">{sub.clientName}</div>
                            {sub.clientPhone ? (
                              <a
                                href={`https://wa.me/55${sub.clientPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-zinc-400 hover:text-emerald-400 font-mono flex items-center gap-1 mt-0.5"
                              >
                                <span>{sub.clientPhone}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Não informado</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {sub.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Ativo (Online)
                              </span>
                            )}
                            {sub.status === 'suspended' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <Lock className="w-3 h-3" />
                                Suspenso (Inadimplente)
                              </span>
                            )}
                            {sub.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                Pendente
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-white font-mono">
                              R$ {sub.monthlyPrice ? sub.monthlyPrice.toFixed(2).replace('.', ',') : '29,90'}/mês
                            </div>
                            <span className="text-[10px] text-zinc-500">Recorrente Mercado Pago</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-zinc-300 font-medium">
                              {sub.nextRenewalDate ? new Date(sub.nextRenewalDate).toLocaleDateString('pt-BR') : '—'}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {sub.status === 'suspended' ? 'Vencido' : 'Renovação automática'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-zinc-300 font-medium">
                              {sub.operatorName || 'Carlos Eduardo Silva'}
                            </span>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Comissão: R$ 10,00/mês
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botão Suspender / Reativar */}
                              <button
                                onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                  sub.status === 'active'
                                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                }`}
                                title={sub.status === 'active' ? 'Suspender site por inadimplência' : 'Reativar site do cliente'}
                              >
                                {sub.status === 'active' ? (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    <span>Suspender</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    <span>Reativar</span>
                                  </>
                                )}
                              </button>

                              {/* Botão Copiar Link de Cobrança */}
                              <button
                                onClick={() => copyToClipboard(sub.checkoutUrl || `https://webbilly.com.br/site/${sub.siteSlug}?checkout=open`)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition flex items-center gap-1 border border-zinc-700"
                                title="Copiar link de checkout do Mercado Pago"
                              >
                                <Copy className="w-3 h-3 text-emerald-400" />
                                <span>Cobrança</span>
                              </button>

                              {/* Botão Visualizar Site */}
                              <Link
                                href={`/site/${sub.siteSlug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition border border-transparent hover:border-zinc-700"
                                title="Visualizar site ao vivo"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 1: CANDIDATOS */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                {(['TODOS', 'PENDENTE', 'APROVADO', 'RECUSADO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterCandidate(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filterCandidate === st
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st === 'PENDENTE' ? 'Pendentes' : st === 'APROVADO' ? 'Aprovados' : 'Recusados'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar candidato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Tabela de Candidatos */}
            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Candidato</th>
                      <th className="py-3 px-4">Contato / Localidade</th>
                      <th className="py-3 px-4">Chave Pix</th>
                      <th className="py-3 px-4">Currículo / LinkedIn</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum candidato encontrado neste filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{c.name}</div>
                            <div className="text-[11px] text-zinc-400 font-normal">{c.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <a
                              href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                            >
                              {c.whatsapp}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-[11px] text-zinc-500">{c.city}/{c.state}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-[10px] text-zinc-500 uppercase block">{c.pixType}</span>
                            <span className="text-zinc-300">{c.pixKey}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {c.resumeUrl ? (
                              <a
                                href={c.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                Ver Perfil
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-zinc-600">Não informado</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === 'APROVADO'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : c.status === 'RECUSADO'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {c.status === 'PENDENTE' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleReviewCandidate(c.id, 'APROVAR')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                                  title="Aprova e gera o Token Serial com 1 clique"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleReviewCandidate(c.id, 'RECUSAR')}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 border border-zinc-700 hover:border-rose-500/40 text-xs transition flex items-center gap-1"
                                  title="Recusar candidatura"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Recusar
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Processado</span>
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

        {/* CONTEÚDO DA ABA 2: GESTOR DE LICENÇAS E SERIAIS */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Licenças & Operadores Provisionados</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Auto-Onboarding Ativo
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gere chaves virgens para novos parceiros. O operador preenche o onboarding no primeiro uso do app desktop.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateSerial}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/30 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gerar Nova Chave Serial</span>
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Token Serial</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Operador</th>
                      <th className="py-3 px-4">CPF</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Dados Pix</th>
                      <th className="py-3 px-4">Data Ativação</th>
                      <th className="py-3 px-4">Senha Provisória</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.licenses || []).map((l: any) => {
                      const isVirgin = (l.status === 'pending_onboarding' || l.status === 'pending_activation') && !l.operatorId;
                      const isPendingApproval = l.status === 'pending_approval' || (l.operatorId && (l.status === 'pending_activation' || l.status === 'pending_onboarding'));
                      const isBlocked = l.status === 'BLOQUEADO' || l.status === 'revoked';

                      return (
                        <tr key={l.serialToken} className="hover:bg-zinc-800/40 transition">
                          {/* Serial */}
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                            <div className="flex items-center gap-2">
                              <span>{l.serialToken}</span>
                              <button
                                onClick={() => copyToClipboard(l.serialToken)}
                                className="text-zinc-500 hover:text-white"
                                title="Copiar chave serial"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {l.machineId && (
                              <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Laptop className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{l.machineId}</span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isVirgin
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : isPendingApproval
                                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 animate-pulse'
                                  : isBlocked
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {isVirgin
                                ? '● Pendente (Virgem)'
                                : isPendingApproval
                                ? '⏳ Aguardando Aprovação'
                                : isBlocked
                                ? '● Bloqueado / Revogado'
                                : '● Ativo'}
                            </span>
                          </td>

                          {/* Operador */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">
                              {l.operatorName || (isVirgin ? 'Aguardando Onboarding' : '—')}
                            </span>
                            {l.operatorId && (
                              <span className="text-[10px] text-zinc-500 font-mono">{l.operatorId}</span>
                            )}
                          </td>

                          {/* CPF */}
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {l.cpf ? (
                              <span>{l.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                            ) : (
                              <span className="text-zinc-600 italic">Pendente</span>
                            )}
                          </td>

                          {/* WhatsApp */}
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {l.whatsapp || <span className="text-zinc-600 italic">Pendente</span>}
                          </td>

                          {/* E-mail */}
                          <td className="py-3.5 px-4 text-zinc-300">
                            {l.email || <span className="text-zinc-600 italic">Pendente</span>}
                          </td>

                          {/* Dados Pix */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {l.pixKey ? (
                              <div>
                                <span className="text-emerald-400 font-bold block">{l.pixKey}</span>
                                <span className="text-[10px] text-zinc-500 uppercase">{l.pixType || 'PIX'}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600 italic">Pendente</span>
                            )}
                          </td>

                          {/* Data de Ativação / Criação */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                            {l.activatedAt
                              ? new Date(l.activatedAt).toLocaleDateString('pt-BR')
                              : l.createdAt
                              ? `${new Date(l.createdAt).toLocaleDateString('pt-BR')} (Criado)`
                              : '—'}
                          </td>

                          {/* Senha Provisória Web */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {l.tempPasswordPlain ? (
                              <div className="flex items-center gap-1.5">
                                <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                                  {l.tempPasswordPlain}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(l.tempPasswordPlain)}
                                  className="text-zinc-500 hover:text-white"
                                  title="Copiar senha provisória"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ) : l.operatorId ? (
                              <span className="text-emerald-400 text-[10px] font-semibold">
                                Senha Pessoal Definida
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">Aguardando Onboarding</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPendingApproval && (
                                <button
                                  onClick={() => handleApproveOperator(l.serialToken, l.operatorId)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-md shadow-emerald-600/30"
                                  title="Aprova o operador e libera o acesso no Billy Suite Desktop imediatamente"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>✓ Aprovar Operador</span>
                                </button>
                              )}

                              {l.machineId && (
                                <button
                                  onClick={() => handleResetMachine(l.serialToken)}
                                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 transition"
                                  title="Desvincula a máquina (permite ativar em outro PC)"
                                >
                                  Liberar PC
                                </button>
                              )}

                              {l.operatorId && (
                                <button
                                  onClick={() => handleResetOperatorPassword(l.serialToken, l.operatorId)}
                                  className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] transition flex items-center gap-1"
                                  title="Gera nova senha provisória e força troca no login web"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>Reset Senha</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleLicense(l.serialToken, l.status)}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                                  isBlocked
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-600/80 hover:bg-rose-500 text-white'
                                }`}
                              >
                                {isBlocked ? (
                                  <>
                                    <Unlock className="w-3 h-3" /> Reativar
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" /> Revogar
                                  </>
                                )}
                              </button>
                            </div>
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

        {/* CONTEÚDO DA ABA 3: EXTRATO FINANCEIRO GLOBAL */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-zinc-800">
              <h3 className="text-base font-bold text-white mb-2">Relatório de Vendas Fechadas e Repasse Pix</h3>
              <p className="text-xs text-zinc-400">
                Cada site ativado gera uma receita de R$ 600,00, da qual <strong>R$ 200,00</strong> é creditada diretamente ao Operador comercial.
              </p>
            </div>

            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Data / ID</th>
                      <th className="py-3 px-4">Operador</th>
                      <th className="py-3 px-4">Cliente / Nicho</th>
                      <th className="py-3 px-4">Valor Total</th>
                      <th className="py-3 px-4">Comissão Operador</th>
                      <th className="py-3 px-4">Status do Pix</th>
                      <th className="py-3 px-4 text-right">Ação Financeira</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.sales || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhuma venda registrada até o momento.
                        </td>
                      </tr>
                    ) : (
                      (data?.sales || []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-white">{s.id}</span>
                            <div className="text-[11px] text-zinc-500">
                              {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{s.operatorName}</span>
                            <span className="text-[11px] text-zinc-500 font-mono">{s.operatorId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-200">{s.clientName}</div>
                            <div className="text-[11px] text-zinc-400">{s.niche || 'Nicho Comercial'}</div>
                            {s.siteUrl && (
                              <a
                                href={s.siteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-400 hover:underline inline-flex items-center gap-1"
                              >
                                Ver Site Gerado <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">
                            R$ {s.saleValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                            R$ {s.commissionValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.pixStatus === 'PAGO'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {s.pixStatus === 'PAGO' ? 'Pix Efetuado' : 'Pix Pendente'}
                            </span>
                            {s.pixPaidAt && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Pago em {new Date(s.pixPaidAt).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {s.pixStatus === 'PENDENTE' ? (
                              <button
                                onClick={() => handlePayPixCommission(s.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                              >
                                Pagar Pix
                              </button>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Liquidado</span>
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

        {/* CONTEÚDO DA ABA 4: CONTROLE CENTRAL DE APIS */}
        {activeTab === 'apis' && (
          <div className="max-w-3xl">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-base font-bold text-white">Gerenciador Central de Chaves e Limites</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Estas credenciais são injetadas em tempo de execução no app Billy Suite Desktop do operador através da validação da licença. Os operadores não têm acesso direto às chaves raw.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiSettings.geminiApiKey || ''}
                    onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="AQ.Ab8RN6LImQKyoWgqw..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      Modelo Gemini Ativo
                    </label>
                    <select
                      value={apiSettings.geminiModel || 'gemini-3.8-flash'}
                      onChange={(e) => setApiSettings({ ...apiSettings, geminiModel: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      Limite Diário por Operador (Gerações/dia)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={apiSettings.defaultDailyLimit || 50}
                      onChange={(e) => setApiSettings({ ...apiSettings, defaultDailyLimit: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                    Deploy Automático (Cloudflare & Vercel)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cloudflare Account ID</label>
                      <input
                        type="text"
                        value={apiSettings.cloudflareAccountId || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, cloudflareAccountId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cloudflare API Token</label>
                      <input
                        type="password"
                        value={apiSettings.cloudflareApiToken || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, cloudflareApiToken: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] text-zinc-400 mb-1">Vercel Token (Deploy alternativo)</label>
                    <input
                      type="password"
                      value={apiSettings.vercelToken || ''}
                      onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Mercado Pago & Assinatura Recorrente SaaS (R$ 29,90/mês)
                    </h4>
                    <a
                      href="https://www.mercadopago.com.br/developers/panel/app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Painel Mercado Pago Developers</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Access Token (Produção)</label>
                      <input
                        type="password"
                        value={apiSettings.mercadopagoAccessToken || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, mercadopagoAccessToken: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        placeholder="APP_USR-..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Public Key (Produção)</label>
                      <input
                        type="text"
                        value={apiSettings.mercadopagoPublicKey || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, mercadopagoPublicKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        placeholder="APP_USR-..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Valor da Mensalidade SaaS (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={apiSettings.monthlySubscriptionPrice ?? 29.90}
                        onChange={(e) => setApiSettings({ ...apiSettings, monthlySubscriptionPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        placeholder="29.90"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Repasse Mensal por Assinatura ao Operador (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={apiSettings.operatorCommissionMonthly ?? 10.00}
                        onChange={(e) => setApiSettings({ ...apiSettings, operatorCommissionMonthly: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        placeholder="10.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    Gateway Pix & Repasse
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Gateway Provedor</label>
                      <select
                        value={apiSettings.pixGateway || 'mercadopago'}
                        onChange={(e) => setApiSettings({ ...apiSettings, pixGateway: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="mercadopago">Mercado Pago API Pix</option>
                        <option value="asaas">Asaas Pix Gateway</option>
                        <option value="manual">Manual com comprovante</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Comissão por Venda (R$)</label>
                      <input
                        type="number"
                        value={apiSettings.commissionPerSale || 200}
                        onChange={(e) => setApiSettings({ ...apiSettings, commissionPerSale: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Sliders className="w-4 h-4" />
                  Salvar e Sincronizar Configurações Centrais
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE CANDIDATO APROVADO COM SERIAL GERADO */}
      {approvalModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Operador Aprovado com Sucesso!</h3>
                <p className="text-xs text-zinc-400">Token Serial único gerado e conta de operador criada.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs mb-4">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Operador:</span>
                <span className="text-white font-bold">{approvalModalData.operator?.name}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Token Serial Oficial:</span>
                <div className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-indigo-500/30 text-indigo-300 font-bold text-sm">
                  <span>{approvalModalData.operator?.serialToken}</span>
                  <button
                    onClick={() => copyToClipboard(approvalModalData.operator?.serialToken)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">E-mail de Login:</span>
                  <span className="text-zinc-300">{approvalModalData.operator?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Senha Inicial:</span>
                  <span className="text-emerald-400 font-bold">{approvalModalData.operator?.initialPassword}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 mb-4">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> E-mail enviado automaticamente ao operador
              </div>
              <p className="text-zinc-500">
                O operador já pode acessar a Área do Operador e ativar o aplicativo Billy Suite Desktop com este serial.
              </p>
            </div>

            <button
              onClick={() => setApprovalModalData(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Concluir e Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

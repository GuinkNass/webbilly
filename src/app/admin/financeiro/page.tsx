'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Users,
  Sparkles,
  Key,
  ShieldCheck,
  Layers,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Copy,
  Receipt,
  FileText,
  AlertTriangle,
  Globe
} from 'lucide-react';

export default function AdminFinancialPage() {
  const { data, loading, error, loadData, setActionSuccess } = useAdmin();

  const [activeTabSub, setActiveTabSub] = useState<'financial' | 'asaas' | 'affiliates' | 'apis'>('financial');

  // Configurações de API
  const [apiSettings, setApiSettings] = useState<any>(data?.settings || {
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    cloudflareAccountId: '',
    cloudflareApiToken: '',
    vercelToken: '',
    mercadopagoAccessToken: '',
    monthlySubscriptionPrice: 29.90,
    operatorCommissionMonthly: 10.00,
    defaultDailyLimit: 50
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Cobranças Asaas
  const [asaasData, setAsaasData] = useState<any | null>(null);
  const [loadingAsaas, setLoadingAsaas] = useState(false);
  const [asaasError, setAsaasError] = useState<string | null>(null);
  const [asaasFilter, setAsaasFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'OVERDUE'>('ALL');
  const [asaasSearch, setAsaasSearch] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAsaasData = async () => {
    setLoadingAsaas(true);
    setAsaasError(null);
    try {
      const res = await fetch('/api/admin/asaas-cobrancas', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao buscar cobranças no Asaas');
      setAsaasData(json);
    } catch (err: any) {
      setAsaasError(err.message || 'Erro ao carregar cobranças Asaas');
    } finally {
      setLoadingAsaas(false);
    }
  };

  useEffect(() => {
    loadAsaasData();
  }, []);

  const handleCancelCharge = async (payment: any) => {
    setCancellingId(payment.id);
    try {
      const res = await fetch('/api/admin/asaas-cobrancas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          subscriptionId: payment.subscriptionId,
          siteSlug: payment.siteSlug
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao cancelar cobrança no Asaas');

      setActionSuccess(`Cobrança ${payment.id} cancelada com sucesso no Asaas e no sistema!`);
      setConfirmCancelModal(null);
      await loadAsaasData();
      await loadData();
    } catch (err: any) {
      alert(`Erro ao cancelar cobrança: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar parâmetros.');

      setSettingsSuccess('Parâmetros e chaves salvos com sucesso!');
      setActionSuccess('Configurações da plataforma atualizadas.');
      setTimeout(() => setSettingsSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      setSettingsError(err.message || 'Falha ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando controle financeiro e APIs...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados</h2>
        <p className="text-xs text-zinc-300">{error}</p>
      </div>
    );
  }

  const payoutRequests = data?.payoutRequests || [];
  const affiliateMetrics = data?.affiliatesAdmin || {};

  // Filtro de cobranças Asaas
  const filteredAsaasPayments = (asaasData?.payments || []).filter((p: any) => {
    if (asaasFilter === 'PENDING' && p.status !== 'PENDING') return false;
    if (asaasFilter === 'CONFIRMED' && p.status !== 'RECEIVED' && p.status !== 'CONFIRMED') return false;
    if (asaasFilter === 'OVERDUE' && p.status !== 'OVERDUE') return false;

    if (asaasSearch.trim()) {
      const q = asaasSearch.toLowerCase().trim();
      const matchName = (p.clientName || '').toLowerCase().includes(q);
      const matchSlug = (p.siteSlug || '').toLowerCase().includes(q);
      const matchSubdomain = (p.subdomain || '').toLowerCase().includes(q);
      const matchId = (p.id || '').toLowerCase().includes(q);
      const matchSubId = (p.subscriptionId || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchSubdomain && !matchId && !matchSubId && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner de Vídeo em Loop do Financeiro Asaas */}
      <div className="w-full h-36 md:h-44 rounded-2xl overflow-hidden relative border border-white/10 mb-5 shadow-2xl bg-[#090d0b]">
        <video
          src="/videos/fundo-asaas-header.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090d0b]/60 via-transparent to-[#090d0b]/30" />
      </div>

      {/* Header com Navegação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2 font-mono">
            <DollarSign className="w-3.5 h-3.5" />
            Controle de Caixa
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Financeiro, Asaas & Repasses Pix
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitoramento em tempo real do Asaas, cobranças emitidas, cancelamento de testes com 1 clique e liquidação de repasses Pix.
          </p>
        </div>

        <div className="flex flex-wrap p-1 bg-[#0a0d14] rounded-xl border border-white/[0.06] text-xs gap-1">
          <button
            onClick={() => setActiveTabSub('financial')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'financial'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Repasses Pix ({payoutRequests.length})
          </button>
          <button
            onClick={() => {
              setActiveTabSub('asaas');
              if (!asaasData) loadAsaasData();
            }}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTabSub === 'asaas'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Cobranças Asaas
            {asaasData?.summary?.pending ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono ml-1 font-bold">
                {asaasData.summary.pending}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTabSub('affiliates')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'affiliates'
                ? 'bg-[#84cc16] text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Billy Afiliados
          </button>
          <button
            onClick={() => setActiveTabSub('apis')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'apis'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Configurações & APIs
          </button>
        </div>
      </div>

      {/* ABA 1: REPASSES PIX */}
      {activeTabSub === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total Solicitado no Mês</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                R$ {(data?.stats?.totalRequestedPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Repasses dos operadores</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Total Já Liquidado</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                R$ {(data?.stats?.totalPaidPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Pix com comprovante</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-amber-400">Aguardando Pagamento</span>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                R$ {(data?.stats?.pendingPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Pendentes no caixa</span>
            </div>
          </div>

          <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Operador</th>
                    <th className="py-3.5 px-4">Mês de Referência</th>
                    <th className="py-3.5 px-4">Chave Pix Cadastrada</th>
                    <th className="py-3.5 px-4">Valor do Repasse</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Data Solicitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {payoutRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                        Nenhuma solicitação de repasse registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    payoutRequests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">{req.operatorName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{req.operatorEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">
                          {req.monthRef || 'Mês Ativo'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400">
                          {req.pixKey} ({req.pixType || 'CPF'})
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                          R$ {req.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3.5 px-4">
                          <ActionTooltip
                            title="Status do Repasse"
                            description={req.status === 'PAGO' ? 'Comissão transferida para a chave Pix do operador com comprovante emitido.' : 'Aguardando processamento e liquidação do Pix pelo financeiro.'}
                            side="top"
                          >
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block cursor-default ${
                                req.status === 'PAGO'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              }`}
                            >
                              {req.status === 'PAGO' ? '● Liquidado' : '● Aguardando Pix'}
                            </span>
                          </ActionTooltip>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400 text-[11px]">
                          {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('pt-BR') : '—'}
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

      {/* ABA 2: COBRANÇAS & ASSINATURAS ASAAS */}
      {activeTabSub === 'asaas' && (
        <div className="space-y-6">
          {/* Alertas de Erro */}
          {asaasError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{asaasError}</span>
              </div>
              <button
                onClick={loadAsaasData}
                className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-white font-semibold text-[11px] transition cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Cards de Métricas Asaas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-bold">Total no Asaas</span>
                <Receipt className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {asaasData?.summary?.total || 0}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                R$ {(asaasData?.summary?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} emitidos
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[10px] uppercase font-bold">Aguardando Pagamento</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                {asaasData?.summary?.pending || 0}
              </div>
              <span className="text-[11px] text-amber-400/80 font-mono">
                R$ {(asaasData?.summary?.pendingValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em aberto
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] uppercase font-bold">Pagas / Confirmadas</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {asaasData?.summary?.received || 0}
              </div>
              <span className="text-[11px] text-emerald-400/80 font-mono">
                R$ {(asaasData?.summary?.receivedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liquidado
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-[10px] uppercase font-bold">Assinaturas Recorrentes</span>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-1">
                {asaasData?.summary?.subscriptionsCount || 0}
              </div>
              <span className="text-[11px] text-zinc-500">
                Contratos ativos no Asaas
              </span>
            </div>
          </div>

          {/* Barra de Filtros, Busca e Ações */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f121a] p-4 rounded-2xl border border-white/[0.06]">
            {/* Filtros por Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setAsaasFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'ALL'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todas ({asaasData?.summary?.total || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-amber-300'
                }`}
              >
                Aguardando ({asaasData?.summary?.pending || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-emerald-300'
                }`}
              >
                Pagas ({asaasData?.summary?.received || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'OVERDUE'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                    : 'text-zinc-400 hover:text-rose-300'
                }`}
              >
                Vencidas ({asaasData?.summary?.overdue || 0})
              </button>
            </div>

            {/* Busca e Botão de Atualizar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar cliente, slug, pay_..."
                  value={asaasSearch}
                  onChange={(e) => setAsaasSearch(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <ActionTooltip title="Recarregar Asaas" description="Consulta as cobranças e assinaturas em tempo real na API do Asaas." side="top">
                <button
                  onClick={loadAsaasData}
                  disabled={loadingAsaas}
                  className="p-2 bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAsaas ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </ActionTooltip>
            </div>
          </div>

          {/* Tabela de Cobranças */}
          <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Subdomínio</th>
                    <th className="py-3.5 px-4">Identificador Asaas</th>
                    <th className="py-3.5 px-4">Valor & Método</th>
                    <th className="py-3.5 px-4">Vencimento</th>
                    <th className="py-3.5 px-4">Status Asaas</th>
                    <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {loadingAsaas && !asaasData ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-7 h-7 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono">Consultando API oficial do Asaas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAsaasPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                        Nenhuma cobrança encontrada para os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredAsaasPayments.map((p: any) => {
                      const isOverdue = p.status === 'OVERDUE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date());
                      const isPaid = p.status === 'RECEIVED' || p.status === 'CONFIRMED';
                      const isPending = p.status === 'PENDING';

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition">
                          {/* Cliente / Subdomínio */}
                          <td className="py-3.5 px-4 max-w-[240px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white block truncate">{p.clientName}</span>
                              {p.isFirstInstallment && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 shrink-0">
                                  1ª Parcela
                                </span>
                              )}
                            </div>
                            {p.subdomain ? (
                              <a
                                href={`https://${p.subdomain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                              >
                                {p.subdomain}
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Sem subdomínio vinculado</span>
                            )}
                          </td>

                          {/* Identificador Asaas */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="text-zinc-300 bg-[#161a26] px-2 py-0.5 rounded border border-white/[0.06]">
                                {p.id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(p.id, p.id)}
                                className="text-zinc-500 hover:text-white transition cursor-pointer"
                                title="Copiar ID"
                              >
                                {copiedId === p.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {p.subscriptionId ? (
                              <div className="text-[10px] text-zinc-400 font-mono mt-1 flex items-center gap-1">
                                <span className="text-zinc-500">Assinatura:</span>
                                <span className="text-indigo-300">{p.subscriptionId}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Cobrança Avulsa</span>
                            )}
                          </td>

                          {/* Valor & Método */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-sm">
                              R$ {Number(p.value || 0).toFixed(2)}
                            </div>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono border bg-white/[0.03] text-zinc-300 border-white/[0.08]">
                              {p.billingType === 'PIX'
                                ? '⚡ Pix'
                                : p.billingType === 'CREDIT_CARD'
                                ? '💳 Cartão'
                                : p.billingType === 'BOLETO'
                                ? '📄 Boleto'
                                : 'Flex (Pix/Cartão)'}
                            </span>
                          </td>

                          {/* Vencimento */}
                          <td className="py-3.5 px-4">
                            <span className={`font-mono text-xs block ${isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-300'}`}>
                              {p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono block">
                              Criada em {p.dateCreated ? new Date(p.dateCreated + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                            </span>
                          </td>

                          {/* Status Asaas */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 cursor-default ${
                                isPaid
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : p.status === 'PENDING'
                                  ? isOverdue
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                    : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                  : p.status === 'OVERDUE'
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700/40'
                              }`}
                            >
                              {isPaid
                                ? '● Paga / Confirmada'
                                : isOverdue
                                ? '● Vencida'
                                : p.status === 'PENDING'
                                ? '● Aguardando Pagamento'
                                : `● ${p.status}`}
                            </span>
                          </td>

                          {/* Ações Rápidas */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Botão Abrir Fatura */}
                              {p.invoiceUrl && (
                                <ActionTooltip title="Abrir Fatura Asaas" description="Abre a tela de checkout e pagamento oficial do Asaas." side="top">
                                  <a
                                    href={p.invoiceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 px-2.5 rounded-lg bg-[#161a26] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                                  >
                                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                                    <span>Fatura</span>
                                  </a>
                                </ActionTooltip>
                              )}

                              {/* Botão Cancelar Cobrança (para testes e pendências) */}
                              <ActionTooltip
                                title="Cancelar no Asaas"
                                description="Exclui definitivamente esta cobrança na API do Asaas e cancela o status no sistema."
                                side="top"
                              >
                                <button
                                  onClick={() => setConfirmCancelModal(p)}
                                  disabled={cancellingId === p.id}
                                  className="p-1.5 px-2.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-rose-200 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Cancelar</span>
                                </button>
                              </ActionTooltip>
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

          {/* Modal de Confirmação de Cancelamento */}
          {confirmCancelModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#11141c] border border-rose-800/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Cancelar Cobrança no Asaas?</h3>
                    <p className="text-xs text-zinc-400">Esta ação cancelará permanentemente a cobrança no gateway.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">ID da Cobrança:</span>
                    <span className="text-white font-bold">{confirmCancelModal.id}</span>
                  </div>
                  {confirmCancelModal.subscriptionId && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Assinatura Vinculada:</span>
                      <span className="text-indigo-400 font-bold">{confirmCancelModal.subscriptionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cliente / Site:</span>
                    <span className="text-cyan-400">{confirmCancelModal.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Valor da Cobrança:</span>
                    <span className="text-white font-bold">R$ {Number(confirmCancelModal.value || 0).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Ideal para limpar cobranças de testes ou propostas abandonadas. Se houver assinatura vinculada, ela também será cancelada sem novas cobranças.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmCancelModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelCharge(confirmCancelModal)}
                    disabled={cancellingId === confirmCancelModal.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
                  >
                    {cancellingId === confirmCancelModal.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Sim, Cancelar Definitivo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: BILLY AFILIADOS */}
      {activeTabSub === 'affiliates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c10] to-[#0f141d] border border-[#84cc16]/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 text-[#a3e635] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Supervisão da Rede Billy Afiliados</h3>
                <p className="text-xs text-zinc-400">Regra oficial: 5% (R$ 24,50) para o padrinho em cada pacote de domínio vendido.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total de Padrinhos Ativos</span>
                <span className="text-2xl font-black text-white font-mono">{affiliateMetrics.totalAffiliatesCount || (data?.operators || []).filter((o: any) => o.affiliate_enabled).length || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Vendas de Domínio por Rede</span>
                <span className="text-2xl font-black text-[#a3e635] font-mono">{affiliateMetrics.totalNetworkSalesCount || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Comissões Pagas à Rede</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">R$ {(affiliateMetrics.totalAffiliateCommissionsPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: CONFIGURAÇÕES & APIS */}
      {activeTabSub === 'apis' && (
        <div className="p-6 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Parâmetros Operacionais da Plataforma</h3>
            <p className="text-xs text-zinc-400">Ajuste os valores de assinatura, comissões e credenciais das APIs integradas.</p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Bloco de Preços e Comissões */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Mensalidade Base SaaS (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.monthlySubscriptionPrice}
                  onChange={(e) => setApiSettings({ ...apiSettings, monthlySubscriptionPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Repasse Recorrente Operador (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.operatorCommissionMonthly}
                  onChange={(e) => setApiSettings({ ...apiSettings, operatorCommissionMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Limite Diário Padrão de Sites
                </label>
                <input
                  type="number"
                  value={apiSettings.defaultDailyLimit}
                  onChange={(e) => setApiSettings({ ...apiSettings, defaultDailyLimit: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Bloco de Chaves de API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiSettings.geminiApiKey || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Modelo Gemini Primário
                </label>
                <input
                  type="text"
                  value={apiSettings.geminiModel || 'gemini-3.8-flash'}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiModel: e.target.value })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Cloudflare API Token
                </label>
                <input
                  type="password"
                  value={apiSettings.cloudflareApiToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, cloudflareApiToken: e.target.value })}
                  placeholder="Token com permissões DNS / Zone"
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Vercel Token (Edge Config & Projects)
                </label>
                <input
                  type="password"
                  value={apiSettings.vercelToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                  placeholder="vercel_..."
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <ActionTooltip
                title="Salvar Parâmetros"
                description="Atualiza as chaves de API, credenciais e taxas de comissão no banco de dados."
                side="top"
              >
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? 'Salvando Parâmetros...' : 'Salvar Todas as Configurações'}
                </button>
              </ActionTooltip>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

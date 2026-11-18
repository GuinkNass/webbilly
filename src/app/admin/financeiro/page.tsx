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

  const [activeTabSub, setActiveTabSub] = useState<'financial' | 'pricing' | 'asaas' | 'affiliates' | 'apis'>('financial');

  // Estados de Tabela de Preços Dinâmica & Modo Teste
  const [platformPricing, setPlatformPricing] = useState({
    monthly_plan_price: 29.90,
    custom_domain_price: 490.00,
    extra_edit_price: 39.90,
    operator_commission_percent: 50.00,
    affiliate_bonus_percent: 5.00
  });
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingFeedback, setPricingFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPlatformPricing = async () => {
    setLoadingPricing(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const json = await res.json();
      if (res.ok && json.pricing) {
        setPlatformPricing({
          monthly_plan_price: Number(json.pricing.monthly_plan_price) || 29.90,
          custom_domain_price: Number(json.pricing.custom_domain_price) || 490.00,
          extra_edit_price: Number(json.pricing.extra_edit_price) || 39.90,
          operator_commission_percent: Number(json.pricing.operator_commission_percent) || 50.00,
          affiliate_bonus_percent: Number(json.pricing.affiliate_bonus_percent) || 5.00
        });
      }
    } catch (_) {}
    finally {
      setLoadingPricing(false);
    }
  };

  const handleSavePricing = async (customPayload?: any) => {
    setSavingPricing(true);
    setPricingFeedback(null);
    try {
      const payload = customPayload || platformPricing;
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao atualizar tabela de preços');
      if (json.pricing) {
        setPlatformPricing({
          monthly_plan_price: Number(json.pricing.monthly_plan_price) || 29.90,
          custom_domain_price: Number(json.pricing.custom_domain_price) || 490.00,
          extra_edit_price: Number(json.pricing.extra_edit_price) || 39.90,
          operator_commission_percent: Number(json.pricing.operator_commission_percent) || 50.00,
          affiliate_bonus_percent: Number(json.pricing.affiliate_bonus_percent) || 5.00
        });
      }
      setPricingFeedback({ type: 'success', text: json.message || 'Tabela de preços salva com sucesso!' });
      setActionSuccess(json.message || 'Tabela de preços atualizada com sucesso!');
    } catch (err: any) {
      setPricingFeedback({ type: 'error', text: err.message || 'Falha ao salvar preços' });
    } finally {
      setSavingPricing(false);
    }
  };

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

  // Billy Afiliados Admin States
  const [togglingOpId, setTogglingOpId] = useState<string | null>(null);
  const [affiliateActionMsg, setAffiliateActionMsg] = useState<string | null>(null);

  const handleToggleAffiliate = async (operatorId: string, currentEnabled: boolean) => {
    setTogglingOpId(operatorId);
    setAffiliateActionMsg(null);
    try {
      const res = await fetch('/api/admin/afiliados/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId, enabled: !currentEnabled })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao alterar status do afiliado');
      setAffiliateActionMsg(json.message);
      setActionSuccess(json.message);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao alterar afiliado: ${err.message}`);
    } finally {
      setTogglingOpId(null);
    }
  };

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
    loadPlatformPricing();
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
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando controle financeiro e APIs...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados</h2>
        <p className="text-xs text-slate-700 dark:text-slate-300">{error}</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1c1d27] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2 font-mono">
            <DollarSign className="w-3.5 h-3.5" />
            Controle de Caixa
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Financeiro, Asaas & Repasses Pix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoramento em tempo real do Asaas, cobranças emitidas, cancelamento de testes com 1 clique e liquidação de repasses Pix.
          </p>
        </div>

        <div className="flex flex-wrap p-1 bg-slate-50 dark:bg-[#14161f] rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs gap-1">
          <button
            onClick={() => setActiveTabSub('financial')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'financial'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-white'
            }`}
          >
            Repasses Pix ({payoutRequests.length})
          </button>
          <button
            onClick={() => {
              setActiveTabSub('pricing');
              loadPlatformPricing();
            }}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTabSub === 'pricing'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Tabela de Preços & Teste
            {platformPricing.monthly_plan_price === 5 && platformPricing.custom_domain_price === 5 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono ml-1 font-bold">
                TESTE
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTabSub('asaas');
              if (!asaasData) loadAsaasData();
            }}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTabSub === 'asaas'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-white'
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-white'
            }`}
          >
            Billy Afiliados
          </button>
          <button
            onClick={() => setActiveTabSub('apis')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'apis'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-white'
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
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Solicitado no Mês</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                R$ {(data?.stats?.totalRequestedPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Repasses dos operadores</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Total Já Liquidado</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                R$ {(data?.stats?.totalPaidPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Pix com comprovante</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-amber-400">Aguardando Pagamento</span>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                R$ {(data?.stats?.pendingPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Pendentes no caixa</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1d27] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#14161f] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px] border-b border-slate-200 dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Operador</th>
                    <th className="py-3.5 px-4">Mês de Referência</th>
                    <th className="py-3.5 px-4">Chave Pix Cadastrada</th>
                    <th className="py-3.5 px-4">Valor do Repasse</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Data Solicitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {payoutRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        Nenhuma solicitação de repasse registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    payoutRequests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">{req.operatorName}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{req.operatorEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
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
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400 text-[11px]">
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

      {/* ABA: TABELA DE PREÇOS & MODO TESTE ASAAS */}
      {activeTabSub === 'pricing' && (
        <div className="space-y-6">
          {/* Header e Descrição */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold block mb-1">
                  Gestão Central de Cobranças • Asaas & Checkout
                </span>
                <h3 className="text-lg font-bold text-white">Tabela Oficial de Preços & Modo de Teste</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Altere em tempo real todos os valores cobrados nas propostas, checkouts e alterações avulsas. Os valores são persistidos no Supabase e sincronizados instantaneamente nos webhooks do Asaas.
                </p>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={savingPricing}
                  onClick={() => handleSavePricing({ action: 'apply_test' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aplicar Modo Teste (R$ 5,00)</span>
                </button>

                <button
                  type="button"
                  disabled={savingPricing}
                  onClick={() => handleSavePricing({ action: 'restore_official' })}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                  <span>Restaurar Oficiais (R$ 29,90)</span>
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {pricingFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  pricingFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {pricingFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{pricingFeedback.text}</span>
              </div>
            )}

            {/* Status Atual do Modo */}
            {platformPricing.monthly_plan_price === 5 && platformPricing.custom_domain_price === 5 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-200 text-sm mb-0.5">
                    MODO DE TESTE ATIVO (R$ 5,00)
                  </strong>
                  <span>
                    Todas as novas propostas comerciais e checkouts emitirão cobranças no valor mínimo de <strong>R$ 5,00</strong> permitido pelo gateway Asaas para testes reais via Pix e Cartão. Clique em <em>"Restaurar Oficiais"</em> para retornar aos valores comerciais de produção antes de divulgar aos clientes.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-emerald-200 text-sm mb-0.5">
                    PREÇOS OFICIAIS DE PRODUÇÃO ATIVOS
                  </strong>
                  <span>
                    A plataforma está operando normalmente com os preços oficiais de mercado. As cobranças recorrentes e compras avulsas seguem a tabela abaixo.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Grid de Configurações de Preços e Comissões */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Mensalidade Subdomínio */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                  Plano Recorrente
                </span>
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Mensalidade Subdomínio Oficial (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="5.00"
                    value={platformPricing.monthly_plan_price}
                    onChange={(e) =>
                      setPlatformPricing({
                        ...platformPricing,
                        monthly_plan_price: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cobrança recorrente mensal via Asaas (Pix ou Cartão). Valor padrão: <strong>R$ 29,90/mês</strong>.
              </p>
            </div>

            {/* Card 2: Domínio Próprio Completo */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Pacote Completo 1 Ano
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Site + Domínio Próprio .com.br (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="5.00"
                    value={platformPricing.custom_domain_price}
                    onChange={(e) =>
                      setPlatformPricing({
                        ...platformPricing,
                        custom_domain_price: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pagamento único à vista via Pix com registro no Registro.br e hospedagem por 1 ano. Valor padrão: <strong>R$ 490,00</strong>.
              </p>
            </div>

            {/* Card 3: Alteração Extra Avulsa */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                  Portal do Cliente
                </span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Alteração Extra Avulsa (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="5.00"
                    value={platformPricing.extra_edit_price}
                    onChange={(e) =>
                      setPlatformPricing({
                        ...platformPricing,
                        extra_edit_price: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cobrança Pix no portal do cliente para solicitações que excedem a cota mensal. Valor padrão: <strong>R$ 39,90</strong>.
              </p>
            </div>
          </div>

          {/* Grid de Comissões e Repasses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Comissão Operador
                </span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Repasse do Operador Responsável (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={platformPricing.operator_commission_percent}
                    onChange={(e) =>
                      setPlatformPricing({
                        ...platformPricing,
                        operator_commission_percent: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Percentual repassado ao operador criador do site em cada mensalidade e plano contratado (Padrão: <strong>50,00%</strong>).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                  Bônus de Indicação
                </span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Comissão Billy Afiliados (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={platformPricing.affiliate_bonus_percent}
                    onChange={(e) =>
                      setPlatformPricing({
                        ...platformPricing,
                        affiliate_bonus_percent: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Percentual creditado ao afiliado pelo link de indicação oficial em cada pagamento recebido (Padrão: <strong>5,00%</strong>).
              </p>
            </div>
          </div>

          {/* Simulador de Repasses e Botão de Salvar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#14161f] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  Simulação em Tempo Real da Distribuição de Receitas
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Previsão exata de repasses por pagamento recebido de acordo com a tabela atual:
                </p>
              </div>

              <button
                type="button"
                disabled={savingPricing}
                onClick={() => handleSavePricing()}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              >
                {savingPricing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando Preços...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Tabela de Preços</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              {/* Simulação Mensalidade */}
              <div className="p-4 rounded-xl bg-[#1c1d27] border border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-sky-300 block">
                  Mensalidade: R$ {platformPricing.monthly_plan_price.toFixed(2).replace('.', ',')}
                </span>
                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operador ({platformPricing.operator_commission_percent}%):</span>
                    <strong className="text-emerald-400">
                      R$ {((platformPricing.monthly_plan_price * platformPricing.operator_commission_percent) / 100).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Afiliado ({platformPricing.affiliate_bonus_percent}%):</span>
                    <strong className="text-blue-400">
                      R$ {((platformPricing.monthly_plan_price * platformPricing.affiliate_bonus_percent) / 100).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-slate-400">Margem Webbilly:</span>
                    <strong className="text-white">
                      R$ {(platformPricing.monthly_plan_price * (1 - (platformPricing.operator_commission_percent + platformPricing.affiliate_bonus_percent) / 100)).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Simulação Domínio Próprio */}
              <div className="p-4 rounded-xl bg-[#1c1d27] border border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-emerald-300 block">
                  Domínio Próprio: R$ {platformPricing.custom_domain_price.toFixed(2).replace('.', ',')}
                </span>
                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operador ({platformPricing.operator_commission_percent}%):</span>
                    <strong className="text-emerald-400">
                      R$ {((platformPricing.custom_domain_price * platformPricing.operator_commission_percent) / 100).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Afiliado ({platformPricing.affiliate_bonus_percent}%):</span>
                    <strong className="text-blue-400">
                      R$ {((platformPricing.custom_domain_price * platformPricing.affiliate_bonus_percent) / 100).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-slate-400">Margem Webbilly:</span>
                    <strong className="text-white">
                      R$ {(platformPricing.custom_domain_price * (1 - (platformPricing.operator_commission_percent + platformPricing.affiliate_bonus_percent) / 100)).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                </div>
              </div>
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
                className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-slate-900 dark:text-white font-semibold text-[11px] transition cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Cards de Métricas Asaas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] uppercase font-bold">Total no Asaas</span>
                <Receipt className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {asaasData?.summary?.total || 0}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                R$ {(asaasData?.summary?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} emitidos
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
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

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
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

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-[10px] uppercase font-bold">Assinaturas Recorrentes</span>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-1">
                {asaasData?.summary?.subscriptionsCount || 0}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Contratos ativos no Asaas
              </span>
            </div>
          </div>

          {/* Barra de Filtros, Busca e Ações */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1c1d27] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.06]">
            {/* Filtros por Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setAsaasFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'ALL'
                    ? 'bg-white/10 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                Todas ({asaasData?.summary?.total || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-amber-300'
                }`}
              >
                Aguardando ({asaasData?.summary?.pending || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-300'
                }`}
              >
                Pagas ({asaasData?.summary?.received || 0})
              </button>
              <button
                onClick={() => setAsaasFilter('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  asaasFilter === 'OVERDUE'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-rose-300'
                }`}
              >
                Vencidas ({asaasData?.summary?.overdue || 0})
              </button>
            </div>

            {/* Busca e Botão de Atualizar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar cliente, slug, pay_..."
                  value={asaasSearch}
                  onChange={(e) => setAsaasSearch(e.target.value)}
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <ActionTooltip title="Recarregar Asaas" description="Consulta as cobranças e assinaturas em tempo real na API do Asaas." side="top">
                <button
                  onClick={loadAsaasData}
                  disabled={loadingAsaas}
                  className="p-2 bg-[#161a26] hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-700 dark:text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAsaas ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </ActionTooltip>
            </div>
          </div>

          {/* Tabela de Cobranças */}
          <div className="bg-white dark:bg-[#1c1d27] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#14161f] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px] border-b border-slate-200 dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Subdomínio</th>
                    <th className="py-3.5 px-4">Identificador Asaas</th>
                    <th className="py-3.5 px-4">Valor & Método</th>
                    <th className="py-3.5 px-4">Vencimento</th>
                    <th className="py-3.5 px-4">Status Asaas</th>
                    <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {loadingAsaas && !asaasData ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-7 h-7 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono">Consultando API oficial do Asaas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAsaasPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                        Nenhuma cobrança encontrada para os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredAsaasPayments.map((p: any) => {
                      const isOverdue = p.status === 'OVERDUE' || (p.status === 'PENDING' && new Date(p.dueDate) < new Date());
                      const isPaid = p.status === 'RECEIVED' || p.status === 'CONFIRMED';
                      const isPending = p.status === 'PENDING';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                          {/* Cliente / Subdomínio */}
                          <td className="py-3.5 px-4 max-w-[240px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">{p.clientName}</span>
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
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">Sem subdomínio vinculado</span>
                            )}
                          </td>

                          {/* Identificador Asaas */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="text-slate-700 dark:text-slate-300 bg-[#161a26] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06]">
                                {p.id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(p.id, p.id)}
                                className="text-slate-400 dark:text-slate-500 hover:text-white transition cursor-pointer"
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
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1">
                                <span className="text-slate-400 dark:text-slate-500">Assinatura:</span>
                                <span className="text-indigo-300">{p.subscriptionId}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">Cobrança Avulsa</span>
                            )}
                          </td>

                          {/* Valor & Método */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-sm">
                              R$ {Number(p.value || 0).toFixed(2)}
                            </div>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono border bg-white/[0.03] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]">
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
                            <span className={`font-mono text-xs block ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                              {p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
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
                                  : 'bg-zinc-900 text-slate-500 dark:text-slate-400 border-zinc-700/40'
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
                                    className="p-1.5 px-2.5 rounded-lg bg-[#161a26] hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-zinc-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
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
              <div className="bg-white dark:bg-[#1c1d27] border border-rose-800/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Cancelar Cobrança no Asaas?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Esta ação cancelará permanentemente a cobrança no gateway.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.06] text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">ID da Cobrança:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{confirmCancelModal.id}</span>
                  </div>
                  {confirmCancelModal.subscriptionId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Assinatura Vinculada:</span>
                      <span className="text-indigo-400 font-bold">{confirmCancelModal.subscriptionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Cliente / Site:</span>
                    <span className="text-cyan-400">{confirmCancelModal.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Valor da Cobrança:</span>
                    <span className="text-slate-900 dark:text-white font-bold">R$ {Number(confirmCancelModal.value || 0).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ideal para limpar cobranças de testes ou propostas abandonadas. Se houver assinatura vinculada, ela também será cancelada sem novas cobranças.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmCancelModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-white transition cursor-pointer"
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
          {/* Header & 4 KPIs Globais */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c10] to-[#0f141d] border border-blue-200 dark:border-blue-800/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Supervisão da Rede Billy Afiliados</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Regra oficial: 5% (R$ 24,50) para o padrinho em cada pacote de Domínio Próprio (R$ 490,00) vendido.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-blue-600 dark:text-blue-400 font-bold">
                  Comissão Base: 5% (R$ 24,50/venda)
                </span>
              </div>
            </div>

            {/* 4 Cards de KPIs Globais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Padrinhos Ativos</span>
                <span className="text-2xl font-black text-white font-mono">
                  {affiliateMetrics.totalAffiliatesCount || (data?.operators || []).filter((o: any) => o.affiliate_enabled).length || 0}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Com link liberado</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Indicados</span>
                <span className="text-2xl font-black text-sky-400 font-mono">
                  {affiliateMetrics.totalRecruitsCount || (data?.operators || []).filter((o: any) => o.referred_by_operator_id).length || 0}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Na rede de operadores</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Vendas de Domínio</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {affiliateMetrics.totalNetworkSalesCount || (affiliateMetrics.commissions || []).length || 0}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Pacotes R$ 490 na rede</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total de Bônus</span>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  R$ {(affiliateMetrics.totalAffiliateCommissionsGenerated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  Pagos: R$ {(affiliateMetrics.totalAffiliateCommissionsPaid || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback de Alteração */}
          {affiliateActionMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{affiliateActionMsg}</span>
            </div>
          )}

          {/* TABELA 1: GESTÃO DE OPERADORES & LIBERAÇÃO MANUAL */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Gestão de Afiliados & Liberação Manual</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Controle individual de acesso ao programa de afiliação e geração de códigos exclusivos.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {(data?.operators || []).length} operadores cadastrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4 font-bold">Operador</th>
                    <th className="py-3 px-4 font-bold">Código Afiliado</th>
                    <th className="py-3 px-4 font-bold text-center">Status Afiliado</th>
                    <th className="py-3 px-4 font-bold text-center">Indicados</th>
                    <th className="py-3 px-4 font-bold text-right">Comissões Geradas</th>
                    <th className="py-3 px-4 font-bold text-right">Ação Admin Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(() => {
                    const ops = data?.operators || [];
                    const allComms = affiliateMetrics.commissions || [];
                    if (ops.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                            Nenhum operador localizado no sistema.
                          </td>
                        </tr>
                      );
                    }

                    return ops.map((op: any) => {
                      const recruitsCount = ops.filter((o: any) => o.referred_by_operator_id === op.id).length;
                      const opComms = allComms.filter((c: any) => c.affiliate_operator_id === op.id);
                      const commsTotal = opComms.reduce((acc: number, c: any) => acc + (Number(c.commission_amount) || 24.50), 0);
                      const isEnabled = Boolean(op.affiliate_enabled);
                      const codeDisplay = op.affiliate_code || `BILLY-${op.id}`;

                      return (
                        <tr key={op.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{op.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{op.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-zinc-200 bg-black/40 px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.06] text-[11px] font-bold">
                                {codeDisplay}
                              </span>
                              <ActionTooltip title="Copiar Link" description={`Copiar link de convite: https://webbilly.com.br/?ref=${codeDisplay}#candidatura`} side="top">
                                <button
                                  onClick={() => copyToClipboard(`https://webbilly.com.br/?ref=${codeDisplay}#candidatura`, op.id)}
                                  className="p-1 rounded hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                  {copiedId === op.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </ActionTooltip>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isEnabled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                                <Sparkles className="w-3 h-3" />
                                Liberado VIP
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                                Bloqueado
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-sky-400">
                            {recruitsCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            R$ {commsTotal.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleAffiliate(op.id, isEnabled)}
                              disabled={togglingOpId === op.id}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer disabled:opacity-50 ${
                                isEnabled
                                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                                  : 'bg-blue-50 dark:bg-blue-900/30 hover:bg-[#84cc16]/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                              }`}
                            >
                              {togglingOpId === op.id ? (
                                <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : isEnabled ? (
                                'Bloquear Afiliado'
                              ) : (
                                'Liberar Afiliado'
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELA 2: ÁRVORE & HISTÓRICO DE INDICAÇÕES E BÔNUS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Árvore & Histórico de Indicações e Comissões (R$ 24,50)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rastreabilidade perpétua de quem indicou quem e bonificações creditadas via webhook Asaas.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {(affiliateMetrics.commissions || []).length} comissões registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4 font-bold">Padrinho (Quem Indicou)</th>
                    <th className="py-3 px-4 font-bold">Operador Indicado (Quem Entrou)</th>
                    <th className="py-3 px-4 font-bold">Data & Referência</th>
                    <th className="py-3 px-4 font-bold text-center">Status Pagamento</th>
                    <th className="py-3 px-4 font-bold text-right">Comissão Afiliado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(() => {
                    const comms = affiliateMetrics.commissions || [];
                    if (comms.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                            Nenhuma comissão de afiliado registrada ainda. Quando um operador indicado vender um pacote de R$ 490,00, a comissão de R$ 24,50 aparecerá aqui automaticamente.
                          </td>
                        </tr>
                      );
                    }

                    return comms.map((c: any, idx: number) => {
                      const d = c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-';
                      return (
                        <tr key={c.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{c.sponsor_name || c.affiliate_operator_id}</div>
                            {c.sponsor_code && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Código: {c.sponsor_code}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-200">{c.invited_name || c.invited_operator_id}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Venda: {c.lead_or_sale_id || '-'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            <div>{d}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{c.month_ref || ''}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.payout_status === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {c.payout_status === 'paid' ? 'Pago' : 'Disponível'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            + R$ {(Number(c.commission_amount) || 24.50).toFixed(2).replace('.', ',')}
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

      {/* ABA 4: CONFIGURAÇÕES & APIS */}
      {activeTabSub === 'apis' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Parâmetros Operacionais da Plataforma</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ajuste os valores de assinatura, comissões e credenciais das APIs integradas.</p>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mensalidade Base SaaS (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.monthlySubscriptionPrice}
                  onChange={(e) => setApiSettings({ ...apiSettings, monthlySubscriptionPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Repasse Recorrente Operador (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.operatorCommissionMonthly}
                  onChange={(e) => setApiSettings({ ...apiSettings, operatorCommissionMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Limite Diário Padrão de Sites
                </label>
                <input
                  type="number"
                  value={apiSettings.defaultDailyLimit}
                  onChange={(e) => setApiSettings({ ...apiSettings, defaultDailyLimit: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Bloco de Chaves de API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiSettings.geminiApiKey || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Modelo Gemini Primário
                </label>
                <input
                  type="text"
                  value={apiSettings.geminiModel || 'gemini-3.8-flash'}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiModel: e.target.value })}
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cloudflare API Token
                </label>
                <input
                  type="password"
                  value={apiSettings.cloudflareApiToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, cloudflareApiToken: e.target.value })}
                  placeholder="Token com permissões DNS / Zone"
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vercel Token (Edge Config & Projects)
                </label>
                <input
                  type="password"
                  value={apiSettings.vercelToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                  placeholder="vercel_..."
                  className="w-full bg-[#161a26] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
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

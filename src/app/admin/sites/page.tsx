'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminCustomDomains from '@/components/AdminCustomDomains';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  ExternalLink,
  AlertTriangle,
  X,
  Send,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Globe,
  Layers,
  Copy,
  MessageCircle,
  ShieldCheck,
  Trash2
} from 'lucide-react';

function getSubdomain(sub: any): string {
  if (!sub) return '';
  const candidate = sub.siteSlug || sub.slug || sub.site_slug || sub.subdomain || sub.subdominio;
  if (candidate && typeof candidate === 'string' && candidate.trim() && candidate !== 'undefined') {
    return candidate.trim().toLowerCase();
  }
  if (typeof sub.id === 'string' && sub.id.startsWith('sub_') && sub.id.length > 4) {
    return sub.id.replace(/^sub_/, '').trim().toLowerCase();
  }
  return '';
}

function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
}

function getReceiptText(receipt: any): string {
  const d = receipt.cancelledAt ? new Date(receipt.cancelledAt) : new Date();
  const dateStr = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const subdom = receipt.subdomain ? `${receipt.subdomain}.webbilly.com.br` : 'webbilly.com.br';
  return `*COMPROVANTE OFICIAL DE ENCERRAMENTO DE ASSINATURA — WEBBILLY*

Prezado(a) *${receipt.clientName}*,
Confirmamos que a solicitação de cancelamento da assinatura do seu site foi processada e concluída com sucesso.

📋 *DADOS DO ENCERRAMENTO:*
• *Protocolo Oficial:* ${receipt.protocol}
• *Estabelecimento:* ${receipt.clientName}
• *Subdomínio:* ${subdom}
• *Valor da Mensalidade:* R$ 29,90/mês (Cobranças cessadas no Asaas)
• *Data/Hora do Encerramento:* ${dateStr}
• *Status:* Encerrado Definitivo

✅ *GARANTIA DE ENCERRAMENTO:*
Informamos que não haverá nenhuma cobrança futura vinculada a esta assinatura no cartão de crédito ou Pix. O site foi retirado do ar conforme solicitado.

Caso deseje reativar seu site profissional no futuro com a Webbilly, basta entrar em contato com nossa equipe.

Agradecemos pela parceria!
*Equipe Webbilly Brasil*
https://webbilly.com.br`;
}

function AdminSitesContent() {
  const searchParams = useSearchParams();
  const { data, setData, loading, error, searchQuery, loadData, setActionSuccess } = useAdmin();

  const [subFilter, setSubFilter] = useState<'TODOS' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CANCELLATION_REQUESTED'>('TODOS');

  // Ativa automaticamente o filtro de cancelamento caso venha por query param
  useEffect(() => {
    const statusParam = searchParams.get('status') || searchParams.get('filter');
    if (statusParam && (statusParam.toLowerCase() === 'cancellation_requested' || statusParam.toUpperCase() === 'CANCELLATION_REQUESTED')) {
      setSubFilter('CANCELLATION_REQUESTED');
    }
  }, [searchParams]);

  // Estados de Sincronização em Tempo Real com Vercel
  const [syncingVercel, setSyncingVercel] = useState(false);

  // Estados de Exclusão Definitiva Completa (Vercel + Edge Config + Asaas + Supabase)
  const [deleteTargetSub, setDeleteTargetSub] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados de Cancelamento Definitivo (Asaas + Vercel + Supabase)
  const [cancelDefinitiveSub, setCancelDefinitiveSub] = useState<any | null>(null);
  const [cancelDefinitiveLoading, setCancelDefinitiveLoading] = useState(false);
  const [cancelDefinitiveSuccess, setCancelDefinitiveSuccess] = useState<string | null>(null);
  const [cancelDefinitiveError, setCancelDefinitiveError] = useState<string | null>(null);

  // Modal de Comprovante de Encerramento (Pós-cancelamento)
  const [closureReceipt, setClosureReceipt] = useState<{
    protocol: string;
    clientName: string;
    subdomain: string;
    clientPhone: string;
    asaasSubscriptionId: string;
    cancelledAt: string;
  } | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Estados de Limpeza / Cancelamento de Pendência no Asaas
  const [cleaningPending, setCleaningPending] = useState(false);

  // Estados de Credenciais do Portal do Cliente
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [credentialsModalSub, setCredentialsModalSub] = useState<any | null>(null);
  const [copiedCreds, setCopiedCreds] = useState<string | null>(null);
  const [updatingAccount, setUpdatingAccount] = useState(false);

  const loadClientAccounts = async () => {
    try {
      const res = await fetch('/api/admin/client-accounts');
      if (res.ok) {
        const json = await res.json();
        setClientAccounts(json.accounts || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadClientAccounts();
  }, []);

  const handleCancelPendingAsaas = async (sub: any) => {
    if (!confirm(`Deseja cancelar imediatamente a cobrança pendente de "${sub.clientName}" no Asaas? Isso impedirá qualquer débito ou geração de fatura futura.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/subscriptions/cancel-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: sub.id,
          siteSlug: sub.siteSlug
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao cancelar pendência no Asaas.');

      setActionSuccess(`Cobrança de "${sub.clientName}" cancelada no Asaas com sucesso.`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Falha ao cancelar pendência no Asaas.');
    }
  };

  const handleCleanAllPendingAsaas = async () => {
    if (!confirm('Deseja cancelar no Asaas TODAS as assinaturas que estão com status Pendente e sem nenhum pagamento realizado? Isso garante zero cobranças indevidas em aberto.')) {
      return;
    }
    setCleaningPending(true);
    try {
      const res = await fetch('/api/admin/subscriptions/cancel-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelAll: true })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao limpar pendências no Asaas.');

      setActionSuccess(`${json.totalCancelled || 0} assinaturas pendentes foram canceladas e limpas no Asaas.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Falha ao limpar pendências.');
    } finally {
      setCleaningPending(false);
    }
  };

  const handleSyncVercel = async () => {
    setSyncingVercel(true);
    try {
      const res = await fetch('/api/admin/sites', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao sincronizar subdomínios.');

      await loadData();
      setActionSuccess(`Sincronização concluída com sucesso! ${json.totalSites || 0} subdomínio(s) verificados na Vercel e Supabase.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Falha ao sincronizar subdomínios com a Vercel.');
    } finally {
      setSyncingVercel(false);
    }
  };

  const handleDeleteSubdomainDefinitive = async () => {
    if (!deleteTargetSub) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const subDomain = getSubdomain(deleteTargetSub);
      const res = await fetch('/api/admin/sites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: deleteTargetSub.id,
          siteSlug: subDomain,
          customDomain: deleteTargetSub.custom_domain || deleteTargetSub.customDomain,
          asaasSubscriptionId: deleteTargetSub.asaas_subscription_id || deleteTargetSub.asaasSubscriptionId
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao excluir subdomínio.');

      // Atualiza o estado local imediatamente para feedback instantâneo na tela
      if (setData) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            subscriptions: (prev.subscriptions || []).filter((s: any) => {
              const sSlug = getSubdomain(s);
              return s.id !== deleteTargetSub.id && (!subDomain || sSlug !== subDomain);
            })
          };
        });
      }

      setActionSuccess(`Subdomínio ${subDomain ? `${subDomain}.webbilly.com.br` : deleteTargetSub.clientName} excluído definitivamente.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setDeleteTargetSub(null);
      await loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'Falha ao processar exclusão definitiva do subdomínio.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

      const targetSub = cancelDefinitiveSub;
      const cleanProtocol = json.protocol || json.details?.protocol || `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Preenche comprovante oficial para visualização e envio via WhatsApp
      setClosureReceipt({
        protocol: cleanProtocol,
        clientName: json.details?.clientName || targetSub.clientName || 'Cliente',
        subdomain: getSubdomain(targetSub) || json.details?.siteSlug || '',
        clientPhone: json.details?.clientPhone || targetSub.clientPhone || '',
        asaasSubscriptionId: json.details?.asaasSubscriptionId || targetSub.asaasSubscriptionId || 'Encerrada',
        cancelledAt: json.details?.cancelledAt || new Date().toISOString()
      });

      setCancelDefinitiveSub(null);
      await loadData();
    } catch (err: any) {
      setCancelDefinitiveError(err.message || 'Falha ao executar cancelamento.');
    } finally {
      setCancelDefinitiveLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando sites e assinaturas SaaS...</span>
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

  const allSubscriptions = data?.subscriptions || [];
  const pendingCancellationsCount = allSubscriptions.filter(
    (s: any) => s.cancellationRequested || s.cancellation_requested
  ).length;

  const subscriptions = allSubscriptions.filter((sub: any) => {
    if (subFilter === 'ACTIVE' && sub.status !== 'active') return false;
    if (subFilter === 'SUSPENDED' && sub.status !== 'suspended') return false;
    if (subFilter === 'PENDING' && sub.status !== 'pending') return false;
    if (subFilter === 'CANCELLATION_REQUESTED' && !sub.cancellationRequested && !sub.cancellation_requested) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const subDomain = getSubdomain(sub);
    return (
      (subDomain && subDomain.includes(q)) ||
      (sub.clientName && sub.clientName.toLowerCase().includes(q)) ||
      (sub.clientPhone && sub.clientPhone.toLowerCase().includes(q)) ||
      (sub.id && String(sub.id).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header com Filtros Rápidos e Sincronização Vercel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1c1d27] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold mb-2 font-mono">
            <Globe className="w-3.5 h-3.5" />
            Supervisão SaaS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão de Sites & Assinaturas Recorrentes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle de cobranças Asaas, sincronização de subdomínios Vercel e exclusão definitiva completa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão Sincronizar Subdomínios Vercel */}
          <ActionTooltip
            title="Sincronizar Subdomínios Vercel"
            description="Revalida imediatamente a lista de subdomínios ativos na Vercel e no Supabase (cache: no-store)."
            side="bottom"
          >
            <button
              onClick={handleSyncVercel}
              disabled={syncingVercel}
              className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-2 disabled:opacity-50 shrink-0 shadow-sm shadow-sky-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${syncingVercel ? 'animate-spin' : ''}`} />
              <span>{syncingVercel ? 'Sincronizando...' : 'Sincronizar Subdomínios Vercel'}</span>
            </button>
          </ActionTooltip>

          {/* Filtros em Abas */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0a0d14] rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'ACTIVE', label: 'Ativos' },
            { id: 'SUSPENDED', label: 'Suspensos' },
            { id: 'PENDING', label: 'Pendentes' },
            { id: 'CANCELLATION_REQUESTED', label: 'Cancelamento Solicitado', count: pendingCancellationsCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                subFilter === tab.id
                  ? tab.id === 'CANCELLATION_REQUESTED'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    subFilter === tab.id
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Banner de Blindagem Asaas para Assinaturas Pendentes */}
      {subFilter === 'PENDING' && (
        <div className="bg-[#14120a] border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Blindagem Contra Cobrança Indevida Asaas</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assinaturas pendentes nunca pagas podem ser canceladas em lote no gateway para evitar débitos ou cobranças abertas.
              </p>
            </div>
          </div>
          <button
            onClick={handleCleanAllPendingAsaas}
            disabled={cleaningPending}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 text-amber-400" />
            <span>{cleaningPending ? 'Limpando...' : 'Cancelar Todas as Pendências no Asaas'}</span>
          </button>
        </div>
      )}

      {/* Tabela de Assinaturas */}
      <div className="bg-white dark:bg-[#1c1d27] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden">
        
        {/* Visualização em Cards no Mobile (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Nenhuma assinatura encontrada para o filtro atual.
            </div>
          ) : (
            subscriptions.map((sub: any) => {
              const subDomain = getSubdomain(sub);
              const isPublished = Boolean(subDomain || sub.deployedUrl || sub.custom_domain || sub.customDomain);
              const isOnline = sub.status === 'active' && isPublished;
              const isSuspended = sub.status === 'suspended';
              const isCancelled = sub.status === 'cancelled';
              const isCancellationRequested = Boolean(sub.cancellationRequested || sub.cancellation_requested);

              return (
                <div key={sub.id} className={`p-4 space-y-3 ${isCancellationRequested ? 'bg-rose-50 dark:bg-rose-950/20 border-l-4 border-l-rose-500' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        {sub.clientName || 'Cliente'}
                      </span>
                      {subDomain ? (
                        <a
                          href={`https://${subDomain}.webbilly.com.br`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>{subDomain}.webbilly.com.br</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sem subdomínio</span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                        isOnline
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : isSuspended
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isOnline ? 'No Ar' : isSuspended ? 'Suspenso' : isCancelled ? 'Cancelado' : 'Offline'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-white/[0.05]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Telefone / Whats</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{sub.clientPhone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Mensalidade</span>
                      <span className="font-bold text-slate-900 dark:text-white">R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}/mês</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => setCredentialsModalSub(sub)}
                      className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/30 min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Credenciais</span>
                    </button>

                    {subDomain && (
                      <a
                        href={`https://${subDomain}.webbilly.com.br`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 min-h-[44px] flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Site</span>
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteTargetSub(sub)}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="Excluir Definitivamente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabela Desktop (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#14161f] text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Subdomínio Oficial</th>
                <th className="py-3.5 px-4">Cliente / Estabelecimento</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4">Mensalidade</th>
                <th className="py-3.5 px-4">Status Asaas</th>
                <th className="py-3.5 px-4 text-right">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Nenhuma assinatura encontrada para o filtro atual.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub: any) => {
                  const subDomain = getSubdomain(sub);
                  const isPublished = Boolean(subDomain || sub.deployedUrl || sub.custom_domain || sub.customDomain);
                  const isOnline = sub.status === 'active' && isPublished;
                  const isSuspended = sub.status === 'suspended';
                  const isCancelled = sub.status === 'cancelled';
                  const isCancellationRequested = Boolean(sub.cancellationRequested || sub.cancellation_requested);

                  const retentionMessage = `Olá ${sub.clientName || ''}! Aqui é da equipe Webbilly Brasil sobre a sua solicitação de cancelamento da assinatura do site ${subDomain ? `${subDomain}.webbilly.com.br` : ''}. Posso te ajudar com alguma dúvida ou suporte?`;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition ${
                        isCancellationRequested
                          ? 'bg-rose-950/20 border-l-4 border-l-rose-500 hover:bg-rose-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        {subDomain ? (
                          <ActionTooltip title="Abrir Subdomínio" description="Acessa o site público do cliente hospedado no subdomínio oficial." side="top">
                            <a
                              href={`https://${subDomain}.webbilly.com.br`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sky-400 hover:underline inline-flex items-center gap-1.5"
                            >
                              <span>{subDomain}.webbilly.com.br</span>
                              <ExternalLink className="w-3 h-3 text-sky-400" />
                            </a>
                          </ActionTooltip>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">Subdomínio não configurado</span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">ID: {sub.id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">{sub.clientName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{sub.planName || 'Assinatura Mensal R$ 29,90'}</span>
                        {sub.cancellationReason && (
                          <span className="text-[10px] text-rose-300 block italic mt-0.5">
                            Motivo: "{sub.cancellationReason}"
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {sub.clientPhone ? (
                          <a
                            href={getWhatsAppUrl(sub.clientPhone, retentionMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400 hover:underline inline-flex items-center gap-1"
                            title="Chamar no WhatsApp"
                          >
                            <span>{sub.clientPhone}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-900 dark:text-white font-bold">R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}/mês</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">+R$ {(sub.operatorCommissionMonthly ?? 10.00).toFixed(2)} repasse</span>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          <ActionTooltip title="Status Real da Assinatura" description="Situação real do site: online e publicado, suspenso por inadimplência ou offline." side="top">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block cursor-default ${
                                isOnline
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : isSuspended
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                  : isCancelled
                                  ? 'bg-zinc-800 text-slate-500 dark:text-slate-400 border-zinc-700'
                                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                              }`}
                            >
                              {isOnline
                                ? '● No Ar (Ativo)'
                                : isSuspended
                                ? '● Suspenso (Inadimplente)'
                                : isCancelled
                                ? '● Cancelado'
                                : '● Offline / Não Publicado'}
                            </span>
                          </ActionTooltip>
                        </div>
                        {isCancellationRequested && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Cancelamento Solicitado</span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {isCancellationRequested ? (
                            <>
                              {/* Botão de Chamar no WhatsApp */}
                              {sub.clientPhone && (
                                <ActionTooltip
                                  title="Chamar no WhatsApp"
                                  description="Entra em contato com o cliente para negociar retenção ou alinhar encerramento formal."
                                  side="top"
                                >
                                  <a
                                    href={getWhatsAppUrl(sub.clientPhone, retentionMessage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Send className="w-3 h-3 text-emerald-400" />
                                    <span>Chamar WhatsApp</span>
                                  </a>
                                </ActionTooltip>
                              )}

                              {/* Botão de Encerrar Definitivo */}
                              <ActionTooltip
                                title="Encerrar Definitivo"
                                description="Exclui a assinatura no Asaas, desativa o subdomínio na Vercel e gera o comprovante oficial de cancelamento."
                                side="top"
                              >
                                <button
                                  onClick={() => {
                                    setCancelDefinitiveSub(sub);
                                    setCancelDefinitiveError(null);
                                    setCancelDefinitiveSuccess(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 text-[10px] font-bold transition cursor-pointer shadow-lg shadow-rose-950/50 inline-flex items-center gap-1 animate-pulse"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Encerrar Definitivo</span>
                                </button>
                              </ActionTooltip>
                            </>
                          ) : (
                            <>
                              {/* Botão de Toggle Ativar/Suspender */}
                              {sub.status !== 'pending' && (
                                <ActionTooltip
                                  title={sub.status === 'active' ? 'Suspender Site' : 'Ativar Site'}
                                  description={sub.status === 'active' ? 'Bloqueia o acesso ao site via Edge Config por inadimplência.' : 'Libera o acesso ao site reativando o subdomínio.'}
                                  side="top"
                                >
                                  <button
                                    onClick={() => handleToggleSubscription(sub.id, sub.status)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                                      sub.status === 'active'
                                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    }`}
                                  >
                                    {sub.status === 'active' ? 'Suspender' : 'Ativar'}
                                  </button>
                                </ActionTooltip>
                              )}

                              {/* Ação rápida para status pendente (Blindagem Asaas) */}
                              {sub.status === 'pending' && (
                                <ActionTooltip
                                  title="Cancelar Pendência no Asaas"
                                  description="Cancela a assinatura e faturas pendentes no Asaas antes que ocorra débito ou cobrança indevida."
                                  side="top"
                                >
                                  <button
                                    onClick={() => handleCancelPendingAsaas(sub)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3 text-amber-400" />
                                    <span>Cancelar no Asaas</span>
                                  </button>
                                </ActionTooltip>
                              )}

                              {/* Botão de Cancelamento Definitivo */}
                              <ActionTooltip
                                title="Cancelar Definitivo"
                                description="Cancela a assinatura no Asaas, desativa o subdomínio na Vercel e encerra o cliente."
                                side="top"
                              >
                                <button
                                  onClick={() => {
                                    setCancelDefinitiveSub(sub);
                                    setCancelDefinitiveError(null);
                                    setCancelDefinitiveSuccess(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-600/30 text-[10px] font-bold transition cursor-pointer"
                                >
                                  Cancelar Definitivo
                                </button>
                              </ActionTooltip>
                            </>
                          )}

                          <ActionTooltip title="Credenciais do Cliente" description="Acessar dados de login, senha e WhatsApp do portal /cliente." side="top">
                            <button
                              onClick={() => setCredentialsModalSub(sub)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 inline-flex items-center gap-1 cursor-pointer text-[10px] font-bold"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Credenciais</span>
                            </button>
                          </ActionTooltip>

                          {subDomain ? (
                            <ActionTooltip title="Ver Site Online" description="Abre o site gerado em nova aba para conferir o visual e dados." side="top">
                              <a
                                href={`https://${subDomain}.webbilly.com.br`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 inline-flex items-center justify-center cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </ActionTooltip>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-slate-100 dark:border-white/[0.05] inline-flex items-center justify-center cursor-not-allowed opacity-40"
                              title="Subdomínio não configurado"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Botão de Excluir Definitivo (Vercel + Edge Config + Asaas + Supabase) */}
                          <ActionTooltip
                            title="Excluir Definitivo"
                            description="Apaga permanentemente o subdomínio da Vercel, remove do Edge Config, cancela no Asaas e exclui do Supabase."
                            side="top"
                          >
                            <button
                              onClick={() => {
                                setDeleteTargetSub(sub);
                                setDeleteError(null);
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 inline-flex items-center justify-center cursor-pointer transition hover:scale-105"
                              title="Excluir Subdomínio Definitivo"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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

      {/* Componente de Gestão de Domínios Próprios Personalizados */}
      <div className="mt-8">
        <AdminCustomDomains
          subscriptions={data?.subscriptions || []}
          onRefresh={loadData}
        />
      </div>

      {/* Modal de Cancelamento Definitivo */}
      {cancelDefinitiveSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1d27] border border-red-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!cancelDefinitiveLoading) setCancelDefinitiveSub(null);
              }}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Executar Cancelamento Definitivo</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {getSubdomain(cancelDefinitiveSub)
                    ? `${getSubdomain(cancelDefinitiveSub)}.webbilly.com.br`
                    : cancelDefinitiveSub.clientName || cancelDefinitiveSub.id}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-300 space-y-2">
              <p>
                <strong>Atenção Administrador Master:</strong> Esta ação é irreversível e executará simultaneamente:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <li>Cancelamento definitivo da cobrança recorrente no gateway <strong>Asaas</strong>.</li>
                <li>Desativação imediata do subdomínio e projeto na <strong>Vercel</strong>.</li>
                <li>Atualização do registro para status <code>cancelled</code> no <strong>Supabase</strong>.</li>
                <li>Geração automática do <strong>Comprovante Oficial com Protocolo ENC-2026</strong>.</li>
              </ul>
            </div>

            {cancelDefinitiveError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {cancelDefinitiveError}
              </div>
            )}

            {cancelDefinitiveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                {cancelDefinitiveSuccess}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={cancelDefinitiveLoading}
                onClick={() => setCancelDefinitiveSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={cancelDefinitiveLoading}
                onClick={handleExecuteDefinitiveCancellation}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-red-950/50 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{cancelDefinitiveLoading ? 'Cancelando...' : 'Confirmar Cancelamento Definitivo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprovante de Cancelamento Definitivo (Pós-Encerramento) */}
      {closureReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 text-white">
            <button
              onClick={() => {
                setClosureReceipt(null);
                setCopiedReceipt(false);
              }}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold mb-0.5">
                  <CheckCircle className="w-3 h-3" />
                  Cancelamento Processado com Sucesso
                </div>
                <h3 className="font-bold text-white text-base">Comprovante Oficial de Encerramento</h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111622] border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-500 dark:text-slate-400">Protocolo Oficial:</span>
                <span className="font-bold text-sky-400 text-sm tracking-wide">{closureReceipt.protocol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cliente:</span>
                <span className="font-semibold text-white">{closureReceipt.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Subdomínio:</span>
                <span className="text-slate-700 dark:text-slate-300">{closureReceipt.subdomain ? `${closureReceipt.subdomain}.webbilly.com.br` : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">WhatsApp de Contato:</span>
                <span className="text-emerald-400">{closureReceipt.clientPhone || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status Asaas & Vercel:</span>
                <span className="text-rose-400 font-bold">Encerrado / Cobranças Cessadas</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
              <strong>Próximo Passo Recomendado:</strong> Envie o comprovante oficial diretamente no WhatsApp do cliente para formalizar o encerramento com transparência.
            </div>

            <div className="space-y-2 pt-1">
              {closureReceipt.clientPhone ? (
                <a
                  href={getWhatsAppUrl(closureReceipt.clientPhone, getReceiptText(closureReceipt))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Comprovante via WhatsApp</span>
                </a>
              ) : null}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getReceiptText(closureReceipt));
                    setCopiedReceipt(true);
                    setTimeout(() => setCopiedReceipt(false), 3000);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedReceipt ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Copiar Texto do Comprovante</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setClosureReceipt(null);
                    setCopiedReceipt(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white font-semibold text-xs transition border border-white/10 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Definitiva Completa (Vercel + Edge Config + Asaas + Supabase) */}
      {deleteTargetSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1d27] border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!deleteLoading) setDeleteTargetSub(null);
              }}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Exclusão Definitiva de Subdomínio</h3>
                <span className="text-xs text-rose-400 font-mono font-bold">
                  {getSubdomain(deleteTargetSub)
                    ? `${getSubdomain(deleteTargetSub)}.webbilly.com.br`
                    : deleteTargetSub.clientName || deleteTargetSub.id}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200 space-y-2">
              <p className="font-semibold text-rose-300">
                Atenção: Esta ação é definitiva e irreversível!
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                Ao confirmar a exclusão deste subdomínio, o sistema executará as seguintes ações em cascata:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <li><strong className="text-white">Vercel REST API:</strong> Remove apontamentos e desvincula o domínio do projeto.</li>
                <li><strong className="text-white">Vercel Edge Config:</strong> Suspende e desativa o roteamento de borda do slug.</li>
                <li><strong className="text-white">Asaas Gateway:</strong> Cancela faturas pendentes e cancela a assinatura recorrente associada.</li>
                <li><strong className="text-white">Supabase & Banco de Dados:</strong> Remove o registro da tabela <code className="text-rose-300 font-mono">subscriptions</code> e do banco local.</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTargetSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteSubdomainDefinitive}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Excluindo da Vercel...' : 'Confirmar Exclusão Definitiva'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Credenciais do Portal do Cliente */}
      {credentialsModalSub && (() => {
        const targetSlug = getSubdomain(credentialsModalSub);
        const acc = clientAccounts.find(a => (a.site_slug && a.site_slug.toLowerCase() === targetSlug) || a.id === credentialsModalSub.id);
        const domainLogin = acc?.domain_login || `${targetSlug}.webbilly.com.br`;
        const initialPass = acc?.initial_password_plain || 'Billy4829';
        const clientStatus = acc?.status || 'active';
        const waMsg = `Olá! O seu portal oficial do cliente Billy Suite está liberado.\n\n🌐 Acesse: https://webbilly.com.br/cliente\n🔑 Login (Domínio): ${domainLogin}\n🔒 Senha: ${initialPass}\n\nPor lá você pode acompanhar seu site, solicitar alterações gratuitas e consultar faturas.`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="relative w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
              <button
                type="button"
                onClick={() => setCredentialsModalSub(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Credenciais do Portal do Cliente</h3>
                  <span className="text-xs text-blue-500 font-mono font-bold">
                    {credentialsModalSub.clientName || domainLogin}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Domínio / Login:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{domainLogin}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Senha Inicial:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                    {initialPass}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status do Acesso:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${clientStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {clientStatus === 'active' ? 'Liberado / Ativo' : 'Bloqueado'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cota de Alterações:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {acc ? `${acc.monthly_edits_used || 0} / ${acc.monthly_edits_limit || 3} utilizadas (${acc.extra_edit_credits || 0} extras)` : '3 por mês'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {credentialsModalSub.clientPhone && (
                  <a
                    href={getWhatsAppUrl(credentialsModalSub.clientPhone, waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Acesso no WhatsApp do Cliente</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(waMsg);
                    setCopiedCreds('creds');
                    setTimeout(() => setCopiedCreds(null), 2500);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCreds === 'creds' ? 'Mensagem Copiada!' : 'Copiar Mensagem Pronta'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                {acc && (
                  <button
                    type="button"
                    disabled={updatingAccount}
                    onClick={async () => {
                      setUpdatingAccount(true);
                      try {
                        const next = clientStatus === 'active' ? 'blocked' : 'active';
                        await fetch(`/api/admin/client-accounts/${acc.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: next })
                        });
                        await loadClientAccounts();
                      } finally {
                        setUpdatingAccount(false);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${clientStatus === 'active' ? 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10' : 'text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10'}`}
                  >
                    {clientStatus === 'active' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCredentialsModalSub(null)}
                  className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function AdminSitesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando painel de sites...</span>
        </div>
      </div>
    }>
      <AdminSitesContent />
    </Suspense>
  );
}

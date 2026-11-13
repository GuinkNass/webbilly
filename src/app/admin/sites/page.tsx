'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import AdminCustomDomains from '@/components/AdminCustomDomains';
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
  Layers
} from 'lucide-react';

export default function AdminSitesPage() {
  const { data, loading, error, searchQuery, loadData, setActionSuccess } = useAdmin();

  const [subFilter, setSubFilter] = useState<'TODOS' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CANCELLATION_REQUESTED'>('TODOS');

  // Estados de Cancelamento Definitivo (Asaas + Vercel + Supabase)
  const [cancelDefinitiveSub, setCancelDefinitiveSub] = useState<any | null>(null);
  const [cancelDefinitiveLoading, setCancelDefinitiveLoading] = useState(false);
  const [cancelDefinitiveSuccess, setCancelDefinitiveSuccess] = useState<string | null>(null);
  const [cancelDefinitiveError, setCancelDefinitiveError] = useState<string | null>(null);

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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando sites e assinaturas SaaS...</span>
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

  const subscriptions = (data?.subscriptions || []).filter((sub: any) => {
    if (subFilter === 'ACTIVE' && sub.status !== 'active') return false;
    if (subFilter === 'SUSPENDED' && sub.status !== 'suspended') return false;
    if (subFilter === 'PENDING' && sub.status !== 'pending') return false;
    if (subFilter === 'CANCELLATION_REQUESTED' && !sub.cancellationRequested && !sub.cancellation_requested) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sub.slug && sub.slug.toLowerCase().includes(q)) ||
      (sub.clientName && sub.clientName.toLowerCase().includes(q)) ||
      (sub.clientPhone && sub.clientPhone.toLowerCase().includes(q)) ||
      (sub.id && String(sub.id).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header com Filtros Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold mb-2 font-mono">
            <Globe className="w-3.5 h-3.5" />
            Supervisão SaaS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão de Sites & Assinaturas Recorrentes
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de cobranças Asaas, suspensão automática no Edge Config e cancelamento definitivo.
          </p>
        </div>

        {/* Filtros em Abas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0a0d14] rounded-xl border border-white/[0.06] text-xs">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'ACTIVE', label: 'Ativos' },
            { id: 'SUSPENDED', label: 'Suspensos' },
            { id: 'PENDING', label: 'Pendentes' },
            { id: 'CANCELLATION_REQUESTED', label: 'Cancelamento Solicitado' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                subFilter === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Assinaturas */}
      <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Subdomínio Oficial</th>
                <th className="py-3.5 px-4">Cliente / Estabelecimento</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4">Mensalidade</th>
                <th className="py-3.5 px-4">Status Asaas</th>
                <th className="py-3.5 px-4 text-right">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhuma assinatura encontrada para o filtro atual.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition">
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
                      <span className="text-[11px] text-zinc-400">{sub.planName || 'Assinatura Mensal R$ 29,90'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {sub.clientPhone || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white font-bold">R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}/mês</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">+R$ {(sub.operatorCommissionMonthly ?? 10.00).toFixed(2)} repasse</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            sub.status === 'active'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : sub.status === 'suspended'
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}
                        >
                          {sub.status === 'active' ? '● No Ar (Ativo)' : sub.status === 'suspended' ? '● Suspenso (Inadimplente)' : sub.status === 'cancelled' ? '● Cancelado' : '● Pendente'}
                        </span>
                      </div>
                      {(sub.cancellationRequested || sub.cancellation_requested) && (
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Cancelamento Solicitado pelo Operador</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão de Toggle Ativar/Suspender */}
                        <button
                          onClick={() => handleToggleSubscription(sub.id, sub.status)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                            sub.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                          title="Alternar suspensão no Edge Config"
                        >
                          {sub.status === 'active' ? 'Suspender' : 'Ativar'}
                        </button>

                        {/* Botão de Cancelamento Definitivo */}
                        <button
                          onClick={() => {
                            setCancelDefinitiveSub(sub);
                            setCancelDefinitiveError(null);
                            setCancelDefinitiveSuccess(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-600/30 text-[10px] font-bold transition cursor-pointer"
                          title="Cancelar definitivamente no Asaas e desativar subdomínio"
                        >
                          Cancelar Definitivo
                        </button>

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
          <div className="bg-[#11141c] border border-red-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!cancelDefinitiveLoading) setCancelDefinitiveSub(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Executar Cancelamento Definitivo</h3>
                <span className="text-xs text-zinc-400 font-mono">{cancelDefinitiveSub.slug}.webbilly.com.br</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-300 space-y-2">
              <p>
                <strong>Atenção Administrador Master:</strong> Esta ação é irreversível e executará simultaneamente:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-zinc-300">
                <li>Cancelamento definitivo da cobrança recorrente no gateway <strong>Asaas</strong>.</li>
                <li>Desativação imediata do subdomínio e projeto na <strong>Vercel</strong>.</li>
                <li>Atualização do registro para status <code>cancelled</code> no <strong>Supabase</strong>.</li>
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
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
    </div>
  );
}

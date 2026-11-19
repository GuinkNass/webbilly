'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOperator } from '@/contexts/OperatorContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  ExternalLink,
  AlertTriangle,
  X,
  Send,
  Sparkles,
  Globe
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

export default function OperatorSitesPage() {
  const { data, loading, error, stats, op, searchQuery, loadData } = useOperator();

  // Estados de Solicitação de Encerramento/Cancelamento de Cliente
  const [cancelModalSub, setCancelModalSub] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelSubmitting, setCancelSubmitting] = useState<boolean>(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);

  const handleConfirmCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSub || !cancelReason.trim()) return;
    setCancelSubmitting(true);
    setCancelErrorMsg(null);
    setCancelSuccessMsg(null);
    try {
      const res = await fetch('/api/operador/request-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteSlug: getSubdomain(cancelModalSub) || cancelModalSub.siteSlug || cancelModalSub.slug,
          reason: cancelReason.trim(),
          operatorId: data?.operator?.id || op?.id
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao solicitar encerramento.');
      setCancelSuccessMsg('Solicitação registrada com sucesso! O Admin Master fará o cancelamento definitivo no Asaas e Vercel.');
      await loadData();
      setTimeout(() => {
        setCancelModalSub(null);
        setCancelSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setCancelErrorMsg(err.message || 'Falha ao enviar solicitação.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const filteredSubscriptions = (data?.subscriptions || []).filter((sub: any) => {
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando sites ativos...</span>
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

  return (
    <div className="space-y-6">
      {/* Header com Resumo e MRR */}
      <div className="p-5 rounded-2xl bg-[#11141C] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
            Seus Clientes no Modelo SaaS Recorrente
          </span>
          <p className="text-xs text-zinc-300 mt-1">
            Cada cliente ativo gera <strong className="text-emerald-400">R$ 10,00/mês</strong> de comissão recorrente repassada para sua chave Pix cadastrada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400 font-mono">
            MRR Atual: <strong className="text-emerald-400 font-bold">R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00 / mês</strong>
          </div>
          <Link
            href="/operador/estudio"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Novo Site</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Sites Ativos */}
      <div className="bg-[#11141C] rounded-2xl border border-white/[0.06] overflow-hidden">
        
        {/* Visualização em Cards no Mobile (< 768px) */}
        <div className="block md:hidden divide-y divide-white/[0.05]">
          {filteredSubscriptions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              {searchQuery ? 'Nenhum site encontrado com este termo.' : 'Nenhum cliente ativo no momento. Crie sites no Billy Studio Web para começar!'}
            </div>
          ) : (
            filteredSubscriptions.map((sub: any) => {
              const subDomain = getSubdomain(sub);
              const isPublished = Boolean(subDomain || sub.deployedUrl || sub.custom_domain || sub.customDomain);
              const isOnline = sub.status === 'active' && isPublished;
              const isSuspended = sub.status === 'suspended';
              const isCancelled = sub.status === 'cancelled';

              return (
                <div key={sub.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-zinc-100 block">
                        {sub.clientName || 'Cliente'}
                      </span>
                      {subDomain ? (
                        <a
                          href={`https://${subDomain}.webbilly.com.br`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>{subDomain}.webbilly.com.br</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Sem subdomínio</span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                        isOnline
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isSuspended
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : isCancelled
                          ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isOnline ? 'No Ar' : isSuspended ? 'Suspenso' : isCancelled ? 'Cancelado' : 'Offline'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/[0.05]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Telefone / Whats</span>
                      <span className="font-mono text-zinc-300">{sub.clientPhone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Mensalidade</span>
                      <span className="font-bold text-zinc-100">R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}/mês</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <a
                      href={subDomain ? `https://webbilly.com.br/api/subscription/create-checkout?slug=${subDomain}` : (sub.checkoutUrl || '#')}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold border border-white/[0.06] min-h-[44px] flex items-center justify-center transition"
                    >
                      Checkout Asaas
                    </a>
                    {subDomain && (
                      <a
                        href={`https://${subDomain}.webbilly.com.br`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
                        title="Ver Site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabela Desktop (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090B10] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.06]">
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
                    {searchQuery ? 'Nenhum site encontrado com este termo de busca.' : 'Nenhum cliente ativo no momento. Use o Billy Studio Web para gerar sites e fechar vendas no WhatsApp!'}
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub: any) => {
                  const subDomain = getSubdomain(sub);
                  const isPublished = Boolean(subDomain || sub.deployedUrl || sub.custom_domain || sub.customDomain);
                  const isOnline = sub.status === 'active' && isPublished;
                  const isSuspended = sub.status === 'suspended';
                  const isCancelled = sub.status === 'cancelled';

                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition duration-150">
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
                          <span className="text-zinc-500 italic">Sem subdomínio</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-200">
                        {sub.clientName || 'Cliente sem nome'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {sub.clientPhone || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        R$ {sub.monthlyPrice?.toFixed(2) || '29.90'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                            isOnline
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isSuspended
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : isCancelled
                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isOnline ? 'No Ar' : isSuspended ? 'Suspenso' : isCancelled ? 'Cancelado' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status !== 'cancelled' && (
                            <>
                              {sub.cancellationRequested || sub.cancellation_requested ? (
                                <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                                  Cancelamento Solicitado
                                </span>
                              ) : (
                                <ActionTooltip title="Solicitar Encerramento" description="Abre o formulário para enviar ao Admin Master o pedido de cancelamento deste cliente." side="top">
                                  <button
                                    onClick={() => {
                                      setCancelModalSub(sub);
                                      setCancelReason('');
                                      setCancelErrorMsg(null);
                                      setCancelSuccessMsg(null);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[10px] border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Solicitar Encerramento</span>
                                  </button>
                                </ActionTooltip>
                              )}
                            </>
                          )}
                          <ActionTooltip title="Link de Checkout" description="Abre o link oficial do Asaas para conferir ou assinar a cobrança." side="top">
                            <a
                              href={subDomain ? `https://webbilly.com.br/api/subscription/create-checkout?slug=${subDomain}` : (sub.checkoutUrl || '#')}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-medium text-[11px] transition border border-white/[0.06] inline-block"
                            >
                              Checkout Asaas
                            </a>
                          </ActionTooltip>
                          {subDomain ? (
                            <ActionTooltip title="Ver Site Online" description="Abre o site gerado em nova aba para conferir o visual e dados." side="top">
                              <a
                                href={`https://${subDomain}.webbilly.com.br`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 inline-flex items-center justify-center cursor-pointer transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </ActionTooltip>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-white/[0.05] inline-flex items-center justify-center cursor-not-allowed opacity-40"
                              title="Subdomínio não configurado"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Modal de Solicitação de Encerramento / Cancelamento */}
      {cancelModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#11141C] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!cancelSubmitting) setCancelModalSub(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h3 className="font-bold text-zinc-100 text-base">Solicitar Encerramento de Assinatura</h3>
                <span className="text-xs text-zinc-400 font-mono">{cancelModalSub.slug || cancelModalSub.siteSlug}.webbilly.com.br</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
              <p>
                <strong>Atenção:</strong> Esta solicitação será enviada imediatamente para o <strong>Admin Master</strong>.
              </p>
              <p className="text-[11px] text-zinc-400">
                O Admin realizará o cancelamento definitivo da cobrança no Asaas e a suspensão do domínio na Vercel.
              </p>
            </div>

            <form onSubmit={handleConfirmCancellation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Motivo do Cancelamento / Observações:
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Cliente fechou o restaurante, solicitou pausa temporária, etc."
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {cancelErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {cancelErrorMsg}
                </div>
              )}

              {cancelSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  {cancelSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={cancelSubmitting}
                  onClick={() => setCancelModalSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting || !cancelReason.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{cancelSubmitting ? 'Enviando...' : 'Confirmar Solicitação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  ExternalLink,
  AlertTriangle,
  X,
  Send,
  Sparkles,
  Download
} from 'lucide-react';

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
          siteSlug: cancelModalSub.slug || cancelModalSub.siteSlug,
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
    return (
      (sub.slug && sub.slug.toLowerCase().includes(q)) ||
      (sub.clientName && sub.clientName.toLowerCase().includes(q)) ||
      (sub.clientPhone && sub.clientPhone.toLowerCase().includes(q)) ||
      (sub.id && String(sub.id).toLowerCase().includes(q))
    );
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
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
      <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
            Seus Clientes no Modelo SaaS Recorrente
          </span>
          <p className="text-xs text-zinc-300 mt-1">
            Cada cliente ativo gera <strong>R$ 10,00/mês</strong> de comissão recorrente repassada para sua chave Pix cadastrada.
          </p>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          MRR Atual: <strong className="text-emerald-400 font-bold">R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00 / mês</strong>
        </div>
      </div>

      {/* Tabela de Sites Ativos */}
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
                    {searchQuery ? 'Nenhum site encontrado com este termo de busca.' : 'Nenhum cliente ativo no momento. Dispare demonstrações no Billy Desktop com o link de checkout!'}
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition duration-150">
                    <td className="py-3.5 px-4 font-mono">
                      <ActionTooltip title="Abrir Subdomínio" description="Acessa o site público do cliente hospedado no subdomínio oficial." side="top">
                        <a
                          href={`https://${sub.slug}.webbilly.com.br`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-sky-400 hover:underline inline-flex items-center gap-1.5"
                        >
                          <span>{sub.slug}.webbilly.com.br</span>
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                        </a>
                      </ActionTooltip>
                      <span className="text-[10px] text-zinc-500 block">ID: {sub.id}</span>
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
                    <td className="py-3.5 px-4 space-y-1">
                      <div>
                        <ActionTooltip title="Status da Assinatura" description="Indica a situação da recorrência mensal e funcionamento do site." side="top">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block cursor-default ${
                              sub.status === 'active'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : sub.status === 'suspended'
                                ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                            }`}
                          >
                            {sub.status === 'active' ? '● No Ar (Ativo)' : sub.status === 'suspended' ? '● Suspenso (Inadimplente)' : sub.status === 'cancelled' ? '● Cancelado' : '● Pendente'}
                          </span>
                        </ActionTooltip>
                      </div>
                      {(sub.cancellationRequested || sub.cancellation_requested) && (
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Cancelamento Solicitado (Aguardando Admin)</span>
                          </span>
                        </div>
                      )}
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
                            href={`https://webbilly.com.br/api/subscription/create-checkout?slug=${sub.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-zinc-800 text-white font-medium text-[11px] transition border border-white/[0.08] inline-block"
                          >
                            Link Checkout
                          </a>
                        </ActionTooltip>
                        <ActionTooltip title="Ver Site Online" description="Abre o site gerado em nova aba para conferir o visual e dados." side="top">
                          <a
                            href={`https://${sub.slug}.webbilly.com.br`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 inline-flex items-center justify-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </ActionTooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ferramentas de Trabalho e Image Downloader */}
      <div className="p-6 rounded-2xl bg-[#0f121a] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center p-2 shrink-0">
            <img src="/icone-marca/image-downloader.png" alt="Extensão Image Downloader" className="w-10 h-10 object-contain rounded-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Extensão Image Downloader para Chrome</h4>
            <p className="text-xs text-zinc-400">Baixe fotos e cardápios de clientes com um clique para carregar no gerador desktop Billy.</p>
          </div>
        </div>
        <ActionTooltip title="Instalar Image Downloader" description="Abre a Chrome Web Store para instalar a extensão de download rápido de imagens." side="left">
          <a
            href="https://chromewebstore.google.com/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Acessar Chrome Web Store</span>
          </a>
        </ActionTooltip>
      </div>

      {/* Modal de Solicitação de Encerramento / Cancelamento */}
      {cancelModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!cancelSubmitting) setCancelModalSub(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Solicitar Encerramento de Assinatura</h3>
                <span className="text-xs text-zinc-400 font-mono">{cancelModalSub.slug}.webbilly.com.br</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-rose-300 space-y-1">
              <p>
                <strong>Atenção:</strong> Esta solicitação será enviada imediatamente para o <strong>Admin Master</strong>.
              </p>
              <p className="text-[11px] text-zinc-400">
                O Admin realizará o cancelamento definitivo da cobrança no Asaas e a suspensão do domínio na Vercel.
              </p>
            </div>

            <form onSubmit={handleConfirmCancellation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Motivo do Cancelamento / Observações:
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Cliente fechou o restaurante, solicitou pausa temporária, insatisfação com custos, etc."
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {cancelErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                  {cancelErrorMsg}
                </div>
              )}

              {cancelSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 disabled:opacity-50 cursor-pointer"
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

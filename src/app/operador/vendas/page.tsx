'use client';

import React, { useState } from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Send,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function OperatorSalesPage() {
  const { data, loading, error, op, stats, loadData } = useOperator();

  // Estados de Solicitação de Repasse Financeiro
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const handleSolicitarRepasse = async () => {
    if (!confirm('Deseja enviar a solicitação formal de repasse Pix deste mês para o departamento financeiro?')) return;
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutSuccess(null);
    try {
      const res = await fetch('/api/operador/solicitar-repasse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setPayoutSuccess(json.message || 'Solicitação de repasse enviada com sucesso! O comprovante será enviado para seu e-mail corporativo.');
      await loadData();
    } catch (err: any) {
      setPayoutError(err.message || 'Falha ao solicitar repasse.');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando extrato de vendas e repasses...</span>
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

  const rules = data?.payoutRules;
  const now = new Date();
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentMonthRef = rules?.currentMonthRef || `${meses[now.getMonth()]} de ${now.getFullYear()}`;
  const corporateEmail = op?.email?.toLowerCase().endsWith('@webbilly.com.br')
    ? op.email.toLowerCase()
    : `${op?.name ? op.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') : 'operador'}@webbilly.com.br`;

  const activeSubsCount = stats?.activeSubscriptionsCount || (data?.subscriptions || []).filter((s: any) => s.status === 'active').length || 0;
  const monthsAccumulated = rules?.monthsAccumulated || 1;
  const hasRequestedThisMonth = rules?.hasRequestedThisMonth ?? (data?.payoutRequests || []).some((p: any) => {
    const d = new Date(p.requestedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const nextUnlockFormatted = rules?.nextUnlockFormatted || `01/${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}/${now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()}`;
  const nextUnlockFull = rules?.nextUnlockFull || `1º de ${meses[(now.getMonth() + 1) % 12]} de ${now.getMonth() + 1 > 11 ? now.getFullYear() + 1 : now.getFullYear()}`;

  const planPrice = 29.90;
  const commissionPerPlan = 10.00;
  const totalFaturado = activeSubsCount * planPrice * monthsAccumulated;
  const breakdown = rules?.breakdown;
  const saldoLiquidoRepasse = breakdown?.total ?? rules?.accumulatedRepasse ?? ((activeSubsCount * commissionPerPlan * monthsAccumulated) + (stats?.pendingCommissions || 0));

  const currentPayout = rules?.currentMonthPayout || (data?.payoutRequests || []).find((p: any) => {
    const d = new Date(p.requestedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const isPaid = currentPayout?.status === 'PAGO';

  return (
    <div className="space-y-6">
      {/* Card Principal de Repasse Mensal & Resumo Financeiro */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111927] to-[#0f141d] border border-emerald-500/30 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Repasse Mensal • R$ 10,00 por Plano Ativo
              </div>

              {monthsAccumulated > 1 && !hasRequestedThisMonth && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-bold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Saldo Acumulado de {monthsAccumulated} meses!</span>
                </div>
              )}

              {hasRequestedThisMonth && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Solicitação de {currentMonthRef} Realizada</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              Solicitação de Repasse Pix — <span className="capitalize text-emerald-400">{currentMonthRef}</span>
            </h3>

            {/* Grid de Resumo Calculado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Planos Ativos</span>
                <span className="text-lg font-black text-white font-mono">{activeSubsCount} clientes</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">R$ 29,90/mês cada</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Total Faturado {monthsAccumulated > 1 && !hasRequestedThisMonth ? `(${monthsAccumulated}m)` : ''}
                </span>
                <span className="text-lg font-black text-zinc-200 font-mono">
                  R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Mensalidades clientes</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Seu Repasse {monthsAccumulated > 1 && !hasRequestedThisMonth ? `(${monthsAccumulated} meses)` : ''}
                </span>
                <span className="text-lg font-black text-emerald-300 font-mono">
                  R$ {saldoLiquidoRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">Total acumulado a receber</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Chave Pix Destino</span>
                <span className="text-xs font-mono font-bold text-amber-300 truncate block select-all" title={op?.pixKey || 'Não cadastrada'}>
                  {op?.pixKey || 'Não cadastrada'}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Tipo: {op?.pixType?.toUpperCase() || 'CPF'}</span>
              </div>
            </div>

            {/* Composição Detalhada do Repasse */}
            {breakdown && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block">Assinaturas Recorrentes</span>
                  <span className="text-sm font-bold text-white font-mono">
                    R$ {(breakdown.recurring || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block">Vendas Diretas (30%)</span>
                  <span className="text-sm font-bold text-sky-400 font-mono">
                    R$ {(breakdown.direct || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block">Bônus Medalha (+20%)</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    R$ {(breakdown.medalBonus || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block">Billy Afiliados (5%)</span>
                  <span className="text-sm font-bold text-[#84cc16] font-mono">
                    R$ {(breakdown.affiliates || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-4 pt-1">
              <span>Comprovante enviado para: <strong className="text-sky-400 font-mono">{corporateEmail}</strong></span>
              <span>Chave Pix: <strong className="text-emerald-400 font-mono">{op?.pixKey || 'Não cadastrada'} ({op?.pixType?.toUpperCase() || 'CPF'})</strong></span>
            </div>
          </div>

          {/* Botão de Solicitação com Validação de Mês Civil */}
          <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={handleSolicitarRepasse}
              disabled={payoutLoading || saldoLiquidoRepasse <= 0 || hasRequestedThisMonth}
              className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition shadow-lg flex items-center justify-center gap-2 ${
                hasRequestedThisMonth
                  ? 'bg-zinc-800 text-zinc-400 border border-white/[0.08] cursor-not-allowed shadow-none'
                  : saldoLiquidoRepasse <= 0
                  ? 'bg-zinc-800/80 text-zinc-500 border border-white/[0.06] cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 cursor-pointer'
              }`}
            >
              {payoutLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando ao Financeiro...</span>
                </>
              ) : hasRequestedThisMonth ? (
                isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Repasse Pago Neste Mês</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Solicitação deste Mês Enviada</span>
                  </>
                )
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Solicitar Repasse de R$ {saldoLiquidoRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </>
              )}
            </button>

            {hasRequestedThisMonth ? (
              <div className="text-[11px] text-amber-300/90 font-medium bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl text-center lg:text-right max-w-xs">
                🔒 <strong>1 solicitação por mês civil.</strong> Sua próxima solicitação estará liberada a partir de <strong>{nextUnlockFull}</strong> ({nextUnlockFormatted}).
              </div>
            ) : saldoLiquidoRepasse <= 0 ? (
              <span className="text-[11px] text-zinc-500">
                Nenhum saldo pendente a repassar no momento.
              </span>
            ) : monthsAccumulated > 1 ? (
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Montante acumulado de {monthsAccumulated} meses liberado para resgate!
              </span>
            ) : (
              <span className="text-[11px] text-zinc-400">
                ✓ 1 solicitação permitida neste mês civil ({currentMonthRef}).
              </span>
            )}
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {payoutSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{payoutSuccess}</span>
          </div>
        )}
        {payoutError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{payoutError}</span>
          </div>
        )}
      </div>

      {/* Regulamento & Regras Oficiais */}
      <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Regulamento & Regras Oficiais de Repasse de Comissões</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>R$ 10,00 por Plano de R$ 29,90</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Para cada comércio que você colocar no ar pelo plano oficial de <strong>R$ 29,90/mês</strong>, você recebe <strong>R$ 10,00 todos os meses</strong> de comissão líquida recorrente enquanto o cliente estiver ativo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Apenas 1 Solicitação por Mês</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              O repasse pode ser solicitado <strong>apenas uma vez a cada mês civil</strong>. Uma vez enviada a solicitação, o próximo repasse só será liberado automaticamente após o <strong>1º dia do mês seguinte</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Saldo 100% Acumulativo</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Caso você não solicite o repasse em determinado mês, o seu saldo <strong>não expira</strong>. Ele continua acumulando mês a mês (R$ 10/plano) para você resgatar o valor total quando desejar.
            </p>
          </div>
        </div>
      </div>

      {/* Chave Pix Cadastrada */}
      <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Chave Pix Cadastrada para Recebimento
          </span>
          <div className="text-sm font-mono text-white mt-1">
            Tipo: <strong className="uppercase">{op?.pixType || 'CPF'}</strong> • Chave: <strong className="text-emerald-400">{op?.pixKey || 'Não cadastrada'}</strong>
          </div>
        </div>
        <div className="text-xs text-zinc-400">
          Pagamentos repassados via Pix diretamente na liquidação oficial.
        </div>
      </div>

      {/* Tabela de Vendas & Extrato Pix */}
      <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Data / ID Venda</th>
                <th className="py-3.5 px-4">Cliente / Estabelecimento</th>
                <th className="py-3.5 px-4">Nicho</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4">Sua Comissão</th>
                <th className="py-3.5 px-4 text-right">Status do Pix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {(data?.sales || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                    Você ainda não registrou vendas. Abra o app Billy Suite Desktop e gere suas primeiras propostas!
                  </td>
                </tr>
              ) : (
                (data?.sales || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition duration-150">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white">{s.id}</span>
                      <div className="text-[11px] text-zinc-500">
                        {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.clientName}</div>
                      {s.siteUrl && (
                        <a
                          href={s.siteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1"
                        >
                          Ver Site Entregue <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{s.niche || 'Geral'}</td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      R$ {s.saleValue?.toLocaleString('pt-BR')},00
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 font-mono text-sm">
                      R$ {s.commissionValue?.toLocaleString('pt-BR')},00
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.pixStatus === 'PAGO'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {s.pixStatus === 'PAGO' ? 'Comissão Paga via Pix' : 'Aguardando Pagamento Pix'}
                      </span>
                      {s.pixProof && (
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Compr: {s.pixProof}
                        </div>
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
  );
}

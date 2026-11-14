'use client';

import React, { useState } from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  Users,
  Sparkles,
  Lock,
  Copy,
  Check,
  Share2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OperatorAffiliatesPage() {
  const { data, loading, error, op, loadData } = useOperator();

  const [activatingAffiliate, setActivatingAffiliate] = useState(false);
  const [affiliateActivationSuccess, setAffiliateActivationSuccess] = useState<string | null>(null);
  const [affiliateActivationError, setAffiliateActivationError] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleActivateAffiliates = async () => {
    setActivatingAffiliate(true);
    setAffiliateActivationError(null);
    setAffiliateActivationSuccess(null);
    try {
      const res = await fetch('/api/operador/activate-affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao ativar programa de afiliados.');

      setAffiliateActivationSuccess('Programa Billy Afiliados ativado com sucesso! Seu link exclusivo já está disponível.');
      await loadData();
    } catch (err: any) {
      setAffiliateActivationError(err.message || 'Erro ao ativar programa.');
    } finally {
      setActivatingAffiliate(false);
    }
  };

  const handleCopyInviteLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 3000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando programa de afiliados...</span>
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

  const code = data?.affiliates?.code || `BILLY-${op?.id || 'OP'}`;
  const inviteUrl = data?.affiliates?.inviteUrl || `https://webbilly.com.br/?ref=${code}#trabalhe-aqui`;
  const shareText = encodeURIComponent(
    `Olá! Estou trabalhando como parceiro oficial na plataforma Webbilly e convido você para a equipe. Acesse pelo meu link oficial e faça sua inscrição para começar:\n\n${inviteUrl}`
  );
  const whatsappShareUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div className="space-y-6">
      {/* Header com Título e Conceito */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#a3e635] text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            Expansão de Rede • Billy Afiliados
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Programa Billy Afiliados
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ganhe <strong className="text-[#a3e635]">5% (R$ 24,50)</strong> sobre cada pacote de Domínio Próprio + Site Completo (R$ 490,00) vendido pelos seus indicados diretos.
          </p>
        </div>

        {data?.affiliates?.enabled && (
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-right">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Seu Código Ativo</div>
            <div className="text-base font-black text-[#a3e635] font-mono tracking-wider">
              {code}
            </div>
          </div>
        )}
      </div>

      {/* Mensagens de Feedback */}
      {affiliateActivationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{affiliateActivationSuccess}</span>
        </div>
      )}
      {affiliateActivationError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{affiliateActivationError}</span>
        </div>
      )}

      {/* CASO 1: BLOQUEADO (INICIANTE / NÃO ATINGIU BRONZE) */}
      {!data?.affiliates?.enabled && !data?.affiliates?.eligibility?.eligible && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f121a] border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Billy Afiliados Bloqueado • Requisito Mínimo: Nível Bronze
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Para garantir a excelência na formação de novos operadores, o programa de afiliação é liberado a partir do Nível Bronze (10 clientes ativos de R$ 29,90/mês e 1 venda de domínio no mês).
                </p>
              </div>
            </div>

            {/* Dual Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Meta 1: Assinantes Ativos */}
              {(() => {
                const cur = data?.affiliates?.eligibility?.activeRecurringCount || 0;
                const goal = 10;
                const pct = Math.min(100, Math.round((cur / goal) * 100));
                const remaining = Math.max(0, goal - cur);
                return (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">1. Clientes Recorrentes Ativos</span>
                      <span className="font-mono font-bold text-emerald-400">{cur}/{goal}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {remaining === 0 ? (
                        <span className="text-emerald-400 font-bold">✓ Meta concluída!</span>
                      ) : (
                        <span>Faltam <strong className="text-white">{remaining}</strong> clientes de R$ 29,90 para desbloquear.</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Meta 2: Vendas de Domínio no Mês */}
              {(() => {
                const cur = data?.affiliates?.eligibility?.monthlyDomainSalesCount || 0;
                const goal = 1;
                const pct = cur >= goal ? 100 : 0;
                return (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300">2. Vendas de Domínio no Mês</span>
                      <span className="font-mono font-bold text-amber-400">{cur}/{goal}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {cur >= goal ? (
                        <span className="text-emerald-400 font-bold">✓ Meta do mês concluída!</span>
                      ) : (
                        <span>Falta <strong className="text-white">1</strong> venda de Domínio Próprio (R$ 490) neste mês.</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Explicativo de Como Funciona */}
          <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
              <span>Como Funciona o Programa Billy Afiliados</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                <strong className="text-white block font-semibold">1. Convide Novos Operadores</strong>
                <p className="text-zinc-400 leading-relaxed">
                  Ao atingir o Nível Bronze, você recebe um link exclusivo. Candidatos que se cadastrarem por ele ficam vinculados a você perpetuamente.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                <strong className="text-[#a3e635] block font-semibold">2. Ganhe 5% em Cada Domínio</strong>
                <p className="text-zinc-400 leading-relaxed">
                  Cada venda de Site Completo + Domínio Próprio (R$ 490,00) confirmada por seus indicados gera <strong>R$ 24,50 líquidos</strong> direto para você.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                <strong className="text-amber-300 block font-semibold">3. Repasse Integrado no Pix</strong>
                <p className="text-zinc-400 leading-relaxed">
                  As comissões de afiliados entram automaticamente no seu saldo a resgatar e são pagas junto com o repasse mensal da plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASO 2: ELEGÍVEL (BRONZE+ MAS AINDA NÃO ATIVADO) */}
      {!data?.affiliates?.enabled && data?.affiliates?.eligibility?.eligible && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121c10] via-[#0f141d] to-[#121c10] border border-[#84cc16]/40 shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-[#84cc16]/20">
            🎉
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84cc16]/20 text-[#a3e635] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Nível Bronze Conquistado!
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Você está elegível para se tornar um Padrinho Billy Afiliados!
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-lg mx-auto">
              Parabéns pelo seu desempenho! Ative seu programa de afiliação agora para gerar seu link exclusivo e faturar <strong className="text-[#a3e635]">5% (R$ 24,50)</strong> em cada pacote de domínio vendido pela sua rede de operadores parceiros.
            </p>
          </div>

          <div className="pt-2">
            <ActionTooltip
              title="Ativar Billy Afiliados"
              description="Gera seu código exclusivo e desbloqueia o recebimento de 5% sobre vendas da sua rede."
              side="top"
            >
              <button
                onClick={handleActivateAffiliates}
                disabled={activatingAffiliate}
                className="py-3.5 px-8 rounded-2xl font-bold text-sm text-black bg-[#84cc16] hover:bg-[#a3e635] transition shadow-lg shadow-[#84cc16]/30 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
              >
                {activatingAffiliate ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Ativando Billy Afiliados...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Ativar Billy Afiliados Agora</span>
                  </>
                )}
              </button>
            </ActionTooltip>
          </div>
        </div>
      )}

      {/* CASO 3: ATIVO */}
      {data?.affiliates?.enabled && (
        <div className="space-y-6">
          {/* Box de Convite e Link Exclusivo */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c10] to-[#0f141d] border border-[#84cc16]/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#84cc16]/20 text-[#a3e635] text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Link Exclusivo de Indicação
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Convide operadores e lucre com as vendas da sua rede
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <ActionTooltip
                  title="Copiar Link de Convite"
                  description="Copia seu link oficial de afiliado para convidar novos operadores parceiros."
                  side="top"
                >
                  <button
                    onClick={() => handleCopyInviteLink(inviteUrl)}
                    className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-[#84cc16] hover:bg-[#a3e635] text-black transition flex items-center gap-1.5 shadow-md shadow-[#84cc16]/20 cursor-pointer"
                  >
                    {copiedInvite ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </ActionTooltip>

                <ActionTooltip
                  title="Compartilhar no WhatsApp"
                  description="Abre o WhatsApp com mensagem e link prontos para convidar novos membros para a equipe."
                  side="top"
                >
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </ActionTooltip>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between gap-3 text-xs font-mono text-zinc-300 overflow-x-auto">
              <span className="truncate">{inviteUrl}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0 font-sans">
                Código: <strong className="text-[#a3e635] font-mono">{code}</strong>
              </span>
            </div>
          </div>

          {/* 4 Cards de Métricas */}
          {(() => {
            const m = data?.affiliates?.metrics || {};
            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Total Indicados</span>
                  <div className="text-2xl font-black text-white font-mono">
                    {m.totalInvited || 0}
                  </div>
                  <span className="text-[11px] text-zinc-500 block">Cadastrados via link</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Vendendo no Mês</span>
                  <div className="text-2xl font-black text-sky-400 font-mono">
                    {m.activeSellingThisMonth || 0}
                  </div>
                  <span className="text-[11px] text-zinc-500 block">Com ao menos 1 venda</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Vendas Domínio (Mês)</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {m.monthlyDomainSalesFromNetwork || 0}
                  </div>
                  <span className="text-[11px] text-zinc-500 block">Pacotes de R$ 490 pela rede</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141c] border border-[#84cc16]/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#a3e635]">Ganhos de Afiliado</span>
                  <div className="text-2xl font-black text-[#a3e635] font-mono">
                    R$ {(m.totalAffiliateEarned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-zinc-500 block">5% em cada venda de domínio</span>
                </div>
              </div>
            );
          })()}

          {/* Gráfico de Evolução de 6 Meses */}
          <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#84cc16]" />
                  <span>Evolução da Rede Billy Afiliados (Últimos 6 Meses)</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Acompanhe o crescimento da sua rede de indicados e as comissões geradas mês a mês.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                  <span className="text-zinc-300">Comissões (R$)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-zinc-300">Vendas Domínio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-zinc-300">Novos Recrutas</span>
                </div>
              </div>
            </div>

            {/* Barras de Evolução */}
            {(() => {
              const chart = data?.affiliates?.evolutionChart || [];
              const maxCommission = Math.max(100, ...chart.map((c: any) => c.commissionAmount || 0));

              return (
                <div className="pt-4 grid grid-cols-6 gap-2 sm:gap-4 items-end min-h-[180px] border-b border-white/[0.06] pb-3">
                  {chart.map((item: any, idx: number) => {
                    const heightPct = Math.max(12, Math.round(((item.commissionAmount || 0) / maxCommission) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group relative">
                        {/* Tooltip Hover */}
                        <div className="absolute -top-20 z-20 hidden group-hover:flex flex-col items-center bg-[#0e121a] border border-[#84cc16]/40 p-2.5 rounded-xl shadow-xl text-[11px] text-white whitespace-nowrap pointer-events-none">
                          <span className="font-bold text-[#a3e635]">{item.monthLabel}</span>
                          <span className="text-zinc-300">Recrutas: <strong>{item.recruitsCount}</strong></span>
                          <span className="text-zinc-300">Vendas Domínio: <strong>{item.domainSales}</strong></span>
                          <span className="text-[#a3e635] font-mono font-bold">R$ {(item.commissionAmount || 0).toFixed(2)}</span>
                        </div>

                        {/* Barra Visual */}
                        <div className="w-full max-w-[48px] bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-1 border border-white/[0.04] group-hover:border-[#84cc16]/50 transition">
                          <div
                            className="w-full bg-gradient-to-t from-[#84cc16] to-[#a3e635] rounded-lg transition-all duration-500 shadow-md shadow-[#84cc16]/20"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>

                        {/* Label do Mês */}
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-zinc-400 block group-hover:text-white transition">
                            {item.monthLabel}
                          </span>
                          <span className="text-[9px] font-mono text-[#a3e635] font-bold block">
                            R${(item.commissionAmount || 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Tabela de Operadores Indicados Diretos */}
          <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#84cc16]" />
                  <span>Operadores Indicados Diretamente por Você</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Lista de colaboradores cadastrados com seu link de afiliação.
                </p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-white/[0.08]">
                {(data?.affiliates?.invitedOperators || []).length} membros na rede
              </span>
            </div>

            {(() => {
              const recruits = data?.affiliates?.invitedOperators || [];
              if (recruits.length === 0) {
                return (
                  <div className="p-8 rounded-xl bg-black/30 border border-white/[0.04] text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto text-sm">
                      👥
                    </div>
                    <p className="text-xs text-zinc-300 font-semibold">
                      Você ainda não possui operadores indicados.
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                      Compartilhe seu link exclusivo de parceiro nas redes sociais ou com contatos interessados em trabalhar com a Billy Suite.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-zinc-400 uppercase text-[10px]">
                        <th className="py-3 px-4 font-bold">Operador Convidado</th>
                        <th className="py-3 px-4 font-bold">Data Cadastro</th>
                        <th className="py-3 px-4 font-bold text-center">Status Licença</th>
                        <th className="py-3 px-4 font-bold text-center">Vendas Domínio (Mês)</th>
                        <th className="py-3 px-4 font-bold text-right">Comissões Geradas (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {recruits.map((r: any, idx: number) => {
                        const d = r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '-';
                        return (
                          <tr key={r.id || idx} className="hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{r.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">{r.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                              {d}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                                {r.status || 'Ativo'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                              {r.domainSalesThisMonth || 0}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#a3e635]">
                              R$ {(r.monthlyCommissionGenerated || 0).toFixed(2).replace('.', ',')}
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
    </div>
  );
}

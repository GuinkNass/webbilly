'use client';

import React from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import TrophyImage from '@/components/TrophyImage';
import GamerAvatar from '@/components/GamerAvatar';
import {
  Trophy,
  Medal,
  Award,
  Target,
  Flame,
  Sparkles
} from 'lucide-react';

export default function OperatorRankingPage() {
  const { data, rankingData, loading, error } = useOperator();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando ranking e medalhas...</span>
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

  const g = data?.gamification;
  const medal = g?.currentMedal || {
    name: 'Iniciante',
    icon: '🌱',
    level: 0,
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-zinc-400',
    badgeBorder: 'border-zinc-700',
    description: 'Construa sua carteira rumo ao Bronze'
  };
  const nextMedal = g?.nextMedal;
  const hasBonus = g?.hasMedalUpgradeBonus;
  const bonusAmount = g?.medalUpgradeBonusAmount || 0;

  const top1 = (rankingData?.leaderboard || []).find((r: any) => r.rank === 1);
  const top2 = (rankingData?.leaderboard || []).find((r: any) => r.rank === 2);
  const top3 = (rankingData?.leaderboard || []).find((r: any) => r.rank === 3);

  return (
    <div className="space-y-6">
      {/* 1. Header com Título e Data de Referência */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Gamificação & Reconhecimento Oficial
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ranking em Tempo Real & Medalhas
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ciclo Ativo: <strong className="text-white">{data?.payoutRules?.currentMonthRef || 'Novembro de 2026'}</strong> • Atualizado instantaneamente a cada novo cliente
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-right">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Sua Classificação</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              #{g?.rank || 1} <span className="text-xs text-zinc-500 font-normal">de {g?.totalOperators || 4}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner de Bônus de +20% se conquistado */}
      {hasBonus ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-amber-950/40 to-emerald-950/60 border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-amber-500/20">
                🎉
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  Bônus de Subida de Medalha Destravado!
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Parabéns! Você subiu de medalha e ganhou +20% DE BÔNUS!
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Você atingiu a <strong className="text-amber-300">{medal.name}</strong> e destravou um bônus de <strong className="text-emerald-400 font-mono">+R$ {bonusAmount.toFixed(2).replace('.', ',')}</strong> que já está incluído no seu repasse Pix mensal!
                </p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-amber-300">+20% Adicionado</div>
              <div className="text-lg font-black text-amber-400 font-mono">
                +R$ {bonusAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center gap-3 text-xs text-zinc-300">
          <Flame className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white">Regra do Bônus Financeiro de +20%:</strong> Suba de medalha neste mês (ex: Iniciante ➔ Bronze, Bronze ➔ Prata, etc.) e ganhe automaticamente um <span className="text-emerald-400 font-bold">bônus extra de +20%</span> sobre o total de todos os seus repasses e ganhos do mês!
          </div>
        </div>
      )}

      {/* Grid de 3 Cards: Medalha Atual / Score & Posição / Próxima Conquista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Medalha Atual / HUD de Patente */}
        <div className={`p-6 rounded-2xl border ${medal.badgeBorder} ${medal.badgeBg} flex flex-col justify-between relative overflow-hidden backdrop-blur-sm shadow-xl`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Sua Patente Oficial</span>
              <TrophyImage
                tier={medal.tier || medal.name}
                size="lg"
                showLockBadge={medal.level === 0}
              />
            </div>
            <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{medal.name}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${medal.badgeText} bg-black/40 border border-white/10`}>
                {medal.level === 0 ? 'Nível 0' : `Nível ${medal.level}`}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              {medal.level === 0 ? 'Em Construção de Carteira (Bloqueado — Rumo ao Bronze).' : medal.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Ganhos Base Mês:</span>
            <span className="font-mono font-bold text-emerald-400">
              R$ {(g?.monthlyBaseEarnings || 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Card 2: Pontuação Geral no Ranking */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Pontuação de Ranking</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {g?.rankingScore || 0} <span className="text-sm font-sans font-normal text-zinc-400">pts</span>
            </div>
            <div className="space-y-1.5 mt-3 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Assinantes Ativos (1 pt cada):</span>
                <strong className="text-white font-mono">{g?.activeRecurringCount || 0} pts</strong>
              </div>
              <div className="flex justify-between">
                <span>Domínios R$ 490 no mês (10 pts cada):</span>
                <strong className="text-amber-400 font-mono">{(g?.monthlyDomainSalesCount || 0) * 10} pts</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500">
            * Pontuação oficial calculada com base na carteira e fechamentos do mês.
          </div>
        </div>

        {/* Card 3: Metas para Próxima Medalha */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Próximo Nível</span>
              <Target className="w-5 h-5 text-emerald-400" />
            </div>

            {nextMedal ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <TrophyImage tier={nextMedal.tier || nextMedal.name} size="sm" />
                  <span className="text-sm font-bold text-white">Rumo à Medalha {nextMedal.name}</span>
                </div>

                {/* Barra 1: Assinantes Ativos */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Assinantes Ativos:</span>
                    <span className="font-mono text-white font-bold">
                      {g?.activeRecurringCount || 0} / {nextMedal.minRecurring}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${g?.recurringProgressPercent || 0}%` }}
                    />
                  </div>
                  {(g?.recurringNeededForNext ?? 0) > 0 && (
                    <div className="text-[10px] text-emerald-400 font-medium">
                      Faltam apenas {g?.recurringNeededForNext} assinante{g?.recurringNeededForNext > 1 ? 's' : ''} ativo{g?.recurringNeededForNext > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Barra 2: Domínios no Mês */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Domínios Próprios no Mês:</span>
                    <span className="font-mono text-white font-bold">
                      {g?.monthlyDomainSalesCount || 0} / {nextMedal.minMonthlyDomainSales}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${g?.domainProgressPercent || 0}%` }}
                    />
                  </div>
                  {(g?.domainNeededForNext ?? 0) > 0 && (
                    <div className="text-[10px] text-amber-400 font-medium">
                      Falta{g?.domainNeededForNext > 1 ? 'm' : ''} {g?.domainNeededForNext} venda{g?.domainNeededForNext > 1 ? 's' : ''} de Domínio Próprio
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="mb-2 flex justify-center">
                  <TrophyImage tier="Rubi" size="lg" />
                </div>
                <div className="text-sm font-bold text-rose-400">Nível Máximo Conquistado!</div>
                <p className="text-xs text-zinc-400 mt-1">Você é o topo da equipe com a Medalha de Rubi.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-zinc-500">
            * Exige atingir AMBAS as metas (assinantes e domínios)
          </div>
        </div>
      </div>

      {/* 3. Tabela Oficial de Regras das Medalhas */}
      <div className="bg-[#11141c] p-6 rounded-2xl border border-white/[0.06] space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Tabela Oficial de Metas & Medalhas Webbilly
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bronze */}
          <div className="p-4 rounded-xl bg-[#141824] border border-orange-600/30 hover:border-orange-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-2">
                <TrophyImage tier="Bronze" size="sm" />
                <span>Bronze (Nível 1)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-300 font-mono font-bold">
                Marco 1
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300 mt-3">
              <div>• <strong>10+</strong> Assinantes Ativos</div>
              <div>• <strong>1+</strong> Domínio no Mês</div>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Prata */}
          <div className="p-4 rounded-xl bg-[#141824] border border-slate-400/30 hover:border-slate-300/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <TrophyImage tier="Prata" size="sm" />
                <span>Prata (Nível 2)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 font-mono font-bold">
                Consistência
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300 mt-3">
              <div>• <strong>35+</strong> Assinantes Ativos</div>
              <div>• <strong>5+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Ouro */}
          <div className="p-4 rounded-xl bg-[#141824] border border-amber-500/30 hover:border-amber-400/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <TrophyImage tier="Ouro" size="sm" />
                <span>Ouro (Nível 3)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                Elite
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300 mt-3">
              <div>• <strong>50+</strong> Assinantes Ativos</div>
              <div>• <strong>15+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Rubi */}
          <div className="p-4 rounded-xl bg-[#141824] border border-rose-500/30 hover:border-rose-400/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-2">
                <TrophyImage tier="Rubi" size="sm" />
                <span>Rubi (Nível 4)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Máximo
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300 mt-3">
              <div>• <strong>100+</strong> Assinantes Ativos</div>
              <div>• <strong>25+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">+20% Bônus de Promoção</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Totens do Pódio dos Campeões (Top 3) */}
      {(top1 || top2 || top3) && (
        <div className="relative bg-black p-6 rounded-2xl border border-white/[0.08] space-y-6 overflow-hidden">
          {/* Vídeo de Fundo do Pódio dos Campeões (100% Nitidez e Cores Reais) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-0"
          >
            <source src="/videos/fundo-trofeus.mp4" type="video/mp4" />
          </video>
          {/* Vinheta preta sutil nas extremidades */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-0" />

          <div className="relative z-10 flex items-center justify-between drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  Pódio dos Campeões • Top 3 Webbilly
                </h3>
                <p className="text-xs text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  Reconhecimento máximo aos operadores com melhor pontuação oficial no mês ativo.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-amber-300 border border-amber-500/30 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              🏆 Elite Operacional
            </span>
          </div>

          {/* Pódio Visual: 2º Lugar (Esquerda), 1º Lugar (Centro Mais Alto), 3º Lugar (Direita) */}
          <div className="relative z-10 pt-8 pb-2 flex flex-col md:flex-row items-end justify-center gap-4 lg:gap-8 max-w-4xl mx-auto">
            {/* #2 Lugar - PRATA */}
            {top2 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <TrophyImage tier="Prata" size="lg" className="mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top2.avatar_svg}
                      config={top2.avatar_config}
                      seed={top2.displayName || top2.operatorId}
                      size={56}
                      className="ring-4 ring-slate-400/50 shadow-lg shadow-slate-400/20"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-400 text-black font-mono shadow-md">
                      #2
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{top2.displayName}</span>
                    {top2.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">Você</span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-300 mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top2.rankingScore} pts
                  </div>
                  <div className="text-[10px] text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top2.activeRecurringCount} clientes • {top2.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Prata */}
                <div className="w-full h-28 rounded-t-2xl bg-black/60 backdrop-blur-sm border-t-4 border-l border-r border-slate-400/60 p-3 flex flex-col items-center justify-center shadow-lg shadow-black/80">
                  <span className="text-2xl font-black text-slate-300 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">2º</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Prata</span>
                </div>
              </div>
            )}

            {/* #1 Lugar - OURO (DESTAQUE MÁXIMO) */}
            {top1 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <span className="text-xl animate-bounce mb-1">👑</span>
                  <TrophyImage tier="Ouro" size="xl" className="mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top1.avatar_svg}
                      config={top1.avatar_config}
                      seed={top1.displayName || top1.operatorId}
                      size={68}
                      className="ring-4 ring-amber-400 shadow-xl shadow-amber-400/30"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black font-mono shadow-md">
                      #1
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <div className="text-sm font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{top1.displayName}</span>
                    {top1.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">Você</span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-black text-amber-400 mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top1.rankingScore} pts
                  </div>
                  <div className="text-[10px] text-zinc-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top1.activeRecurringCount} clientes • {top1.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Ouro */}
                <div className="w-full h-36 rounded-t-2xl bg-black/60 backdrop-blur-sm border-t-4 border-l border-r border-amber-400 p-3 flex flex-col items-center justify-center shadow-2xl shadow-black/80">
                  <span className="text-3xl font-black text-amber-300 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">1º</span>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-1">Líder Ouro</span>
                </div>
              </div>
            )}

            {/* #3 Lugar - BRONZE */}
            {top3 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-3">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <TrophyImage tier="Bronze" size="lg" className="mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top3.avatar_svg}
                      config={top3.avatar_config}
                      seed={top3.displayName || top3.operatorId}
                      size={52}
                      className="ring-4 ring-orange-600/50 shadow-lg shadow-orange-600/20"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-600 text-white font-mono shadow-md">
                      #3
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{top3.displayName}</span>
                    {top3.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">Você</span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-orange-400 mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top3.rankingScore} pts
                  </div>
                  <div className="text-[10px] text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {top3.activeRecurringCount} clientes • {top3.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Bronze */}
                <div className="w-full h-24 rounded-t-2xl bg-black/60 backdrop-blur-sm border-t-4 border-l border-r border-orange-500/60 p-3 flex flex-col items-center justify-center shadow-lg shadow-black/80">
                  <span className="text-xl font-black text-orange-400 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">3º</span>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Bronze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Leaderboard Oficial em Tempo Real da Equipe */}
      <div className="bg-[#11141c] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Classificação Geral da Equipe (Ao Vivo)</h3>
              <p className="text-xs text-zinc-400">Nomes de colegas mascarados para conformidade e privacidade interna.</p>
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            {rankingData?.leaderboard?.length || 4} Operadores Ativos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0e1118] text-[10px] uppercase font-bold text-zinc-400 border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 text-center">Posição</th>
                <th className="py-3 px-4">Colaborador / Operador</th>
                <th className="py-3 px-4">Medalha</th>
                <th className="py-3 px-4 text-center">Assinantes Ativos</th>
                <th className="py-3 px-4 text-center">Domínios no Mês</th>
                <th className="py-3 px-4 text-right">Score Oficial</th>
                <th className="py-3 px-4 text-right">Status do Bônus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(rankingData?.leaderboard || []).map((row: any) => {
                const isMe = row.isCurrentUser;
                const isTop1 = row.rank === 1;
                const isTop2 = row.rank === 2;
                const isTop3 = row.rank === 3;

                return (
                  <tr
                    key={row.operatorId}
                    className={`transition ${
                      isMe
                        ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500 font-semibold'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full font-black text-xs font-mono ${
                        isTop1
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/20'
                          : isTop2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : isTop3
                          ? 'bg-orange-600/20 text-orange-400 border border-orange-600/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isTop1 ? <TrophyImage tier="Ouro" size="xs" /> : isTop2 ? <TrophyImage tier="Prata" size="xs" /> : isTop3 ? <TrophyImage tier="Bronze" size="xs" /> : null}
                        <span>#{row.rank}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <GamerAvatar
                          svg={row.avatar_svg}
                          config={row.avatar_config}
                          seed={row.displayName || row.operatorId}
                          size={28}
                          className="ring-1 ring-white/10"
                        />
                        <span className={`font-medium ${isMe ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                          {row.displayName}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                            Você
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold border ${row.medal?.badgeBg || 'bg-zinc-800'} ${row.medal?.badgeText || 'text-zinc-400'} ${row.medal?.badgeBorder || 'border-zinc-700'}`}>
                        <TrophyImage tier={row.medal?.tier || row.medal?.name} size="xs" />
                        <span>{row.medal?.name || 'Iniciante'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {row.activeRecurringCount} <span className="text-[10px] text-zinc-500 font-normal">clientes</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                      {row.monthlyDomainSalesCount} <span className="text-[10px] text-zinc-500 font-normal">vendas</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-white text-sm">
                      {row.rankingScore} <span className="text-[10px] text-zinc-500 font-normal">pts</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {row.hasMedalUpgradeBonus ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Sparkles className="w-2.5 h-2.5" />
                          +20% Bônus
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

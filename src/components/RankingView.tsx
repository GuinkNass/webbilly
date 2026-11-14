'use client';

import React, { useState, useEffect } from 'react';
import TrophyImage from '@/components/TrophyImage';
import GamerAvatar from '@/components/GamerAvatar';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  Trophy,
  Medal,
  Award,
  Target,
  Flame,
  Sparkles,
  RefreshCw,
  Crown,
  Users,
  TrendingUp,
  ShieldCheck,
  Mail,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export interface RankingViewProps {
  mode: 'operator' | 'admin';
}

export default function RankingView({ mode }: RankingViewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserProgress, setCurrentUserProgress] = useState<any>(null);
  const [rules, setRules] = useState<any>(null);

  const fetchRanking = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/operador/ranking', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar dados do ranking.');

      setLeaderboard(Array.isArray(json.leaderboard) ? json.leaderboard : []);
      setCurrentUserProgress(json.currentUserProgress || null);
      setRules(json.rules || null);
    } catch (err: any) {
      console.error('[RankingView] Erro ao carregar ranking:', err);
      setError(err.message || 'Falha na conexão com os dados do ranking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [mode]);

  const top1 = leaderboard.find((r) => r.rank === 1);
  const top2 = leaderboard.find((r) => r.rank === 2);
  const top3 = leaderboard.find((r) => r.rank === 3);

  const medal = currentUserProgress?.currentMedal || {
    name: 'Iniciante',
    level: 0,
    badgeBg: 'bg-zinc-800/80',
    badgeText: 'text-zinc-400',
    badgeBorder: 'border-zinc-700/80',
    description: 'Construa sua carteira rumo ao Bronze.'
  };

  const nextMedal = currentUserProgress?.nextMedal;
  const hasBonus = currentUserProgress?.hasMedalUpgradeBonus;
  const bonusAmount = currentUserProgress?.medalUpgradeBonusAmount || 0;

  // Estatísticas para visão Admin
  const totalSubscribers = leaderboard.reduce((acc, cur) => acc + (cur.activeRecurringCount || 0), 0);
  const totalDomainSales = leaderboard.reduce((acc, cur) => acc + (cur.monthlyDomainSalesCount || 0), 0);
  const totalBonusAwarded = leaderboard
    .filter((cur) => cur.hasMedalUpgradeBonus)
    .reduce((acc, cur) => acc + (cur.medalUpgradeBonusAmount || 0), 0);

  if (loading && !leaderboard.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3">
        <div className="w-12 h-12 border-4 border-[#45f882] border-t-transparent rounded-full animate-spin glow-neon-green" />
        <span className="text-zinc-300 text-xs font-mono uppercase tracking-widest font-barlow">
          Sincronizando Liga dos Campeões Webbilly...
        </span>
      </div>
    );
  }

  if (error && !leaderboard.length) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-rose-400 mb-2 font-barlow uppercase">Erro ao carregar ranking</h2>
        <p className="text-xs text-zinc-300 mb-4">{error}</p>
        <button
          onClick={() => fetchRanking(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 relative">
      {/* 1. HEADER CYBERPUNK MYKD ESPORTS */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] p-6 lg:p-8 shadow-2xl">
        {/* Background do template com vinheta suave */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{ backgroundImage: "url('/ranking-assets/tournament_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e13] via-[#0b0e13]/85 to-[#0b0e13]/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#45f882]/10 border border-[#45f882]/30 text-[#45f882] text-xs font-black tracking-wider uppercase font-barlow">
              <Sparkles className="w-3.5 h-3.5 text-[#45f882] animate-pulse" />
              <span>Temporada Oficial 2026 • Liga dos Campeões Webbilly</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-barlow flex items-center gap-3">
              <span>Ranking & Medalhas</span>
              {mode === 'admin' ? (
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VISÃO MASTER
                </span>
              ) : (
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40">
                  AO VIVO
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Reconhecimento oficial e gamificação da equipe com dados em tempo real. A cada nova assinatura e domínio registrado, sua posição e medalha sobem instantaneamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ActionTooltip title="Atualizar Ranking" description="Recarrega as pontuações, posições e medalhas da liga em tempo real." side="bottom">
              <button
                onClick={() => fetchRanking(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-bold transition disabled:opacity-50 shadow-md hover:border-[#45f882]/40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#45f882] ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            </ActionTooltip>

            {mode === 'operator' && (
              <div className="px-5 py-2.5 rounded-xl bg-black/60 border border-[#45f882]/30 text-right backdrop-blur-sm">
                <div className="text-[10px] uppercase font-bold text-zinc-400 font-barlow tracking-wider">Sua Posição</div>
                <div className="text-xl font-black text-[#45f882] font-mono leading-none mt-0.5">
                  #{currentUserProgress?.rank || (leaderboard.findIndex((r) => r.isCurrentUser) + 1 || 1)}{' '}
                  <span className="text-xs text-zinc-400 font-normal font-sans">de {leaderboard.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BANNER DE BÔNUS (+20%) / RESUMO ADMIN */}
      {mode === 'operator' ? (
        hasBonus ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d2218] via-[#1a2e1d] to-[#0d2218] border-2 border-[#45f882]/60 p-6 shadow-2xl glow-neon-green">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#45f882]/20 border border-[#45f882]/50 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-[#45f882]/20">
                  🎉
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#45f882]/20 text-[#45f882] font-black text-[10px] uppercase tracking-wider mb-1 font-barlow">
                    <Sparkles className="w-3 h-3" />
                    Bônus de Promoção Destravado!
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-white font-barlow uppercase tracking-tight">
                    Parabéns! Você subiu de medalha e garantiu +20% DE BÔNUS!
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                    Você atingiu a <strong className="text-amber-300 font-bold">{medal.name}</strong> neste ciclo! O bônus adicional de{' '}
                    <strong className="text-[#45f882] font-mono text-sm">+R$ {bonusAmount.toFixed(2).replace('.', ',')}</strong> foi automaticamente incorporado ao seu repasse Pix mensal.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 rounded-xl bg-black/60 border border-[#45f882]/50 text-center shrink-0 backdrop-blur-sm">
                <div className="text-[10px] uppercase font-bold text-[#45f882] font-barlow tracking-wider">+20% Bônus Pix</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  +R$ {bonusAmount.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0f141d] border border-white/10 flex items-center gap-3.5 text-xs text-zinc-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <strong className="text-white font-barlow uppercase tracking-wide">Regra do Bônus de +20%:</strong> Suba de medalha neste mês (ex: Iniciante ➔ Bronze, Bronze ➔ Prata, Prata ➔ Ouro, Ouro ➔ Rubi) e ganhe automaticamente um <span className="text-[#45f882] font-bold">bônus extra de +20%</span> sobre todos os seus repasses e ganhos do mês!
            </div>
          </div>
        )
      ) : (
        /* Resumo Gerencial do Admin */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f141d] border border-white/10">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-barlow uppercase tracking-wider mb-2">
              <span>Operadores Ativos</span>
              <Users className="w-4 h-4 text-[#45f882]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{leaderboard.length}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Participando da Liga dos Campeões</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f141d] border border-white/10">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-barlow uppercase tracking-wider mb-2">
              <span>Carteira da Equipe</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{totalSubscribers}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Assinantes ativos na base</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f141d] border border-white/10">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-barlow uppercase tracking-wider mb-2">
              <span>Domínios no Mês</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{totalDomainSales}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Vendas de domínio R$ 490</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f141d] border border-white/10">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-barlow uppercase tracking-wider mb-2">
              <span>Bônus Destravados</span>
              <Sparkles className="w-4 h-4 text-[#45f882]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              R$ {totalBonusAwarded.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[11px] text-[#45f882] mt-1 font-semibold">
              {leaderboard.filter((c) => c.hasMedalUpgradeBonus).length} operadores bonificados (+20%)
            </div>
          </div>
        </div>
      )}

      {/* 3. HUD DE PATENTE PESSOAL (APENAS MODO OPERADOR) */}
      {mode === 'operator' && currentUserProgress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Medalha Atual / HUD de Patente */}
          <div className={`p-6 rounded-2xl border ${medal.badgeBorder} ${medal.badgeBg} flex flex-col justify-between relative overflow-hidden backdrop-blur-sm shadow-xl`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-black tracking-wider text-zinc-300 font-barlow">
                  Sua Patente Oficial
                </span>
                <TrophyImage
                  tier={medal.tier || medal.name}
                  size="lg"
                  showLockBadge={medal.level === 0}
                />
              </div>
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-barlow uppercase">
                <span>{medal.name}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${medal.badgeText} bg-black/50 border border-white/10 font-mono`}>
                  {medal.level === 0 ? 'Nível 0' : `Nível ${medal.level}`}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {medal.level === 0 ? 'Em Construção de Carteira (Rumo ao Bronze).' : medal.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Ganhos Base Mês:</span>
              <span className="font-mono font-bold text-[#45f882] text-sm">
                R$ {(currentUserProgress?.monthlyBaseEarnings || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Card 2: Pontuação Geral no Ranking */}
          <div className="p-6 rounded-2xl bg-[#0f141d] border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black tracking-wider text-zinc-400 font-barlow">
                  Pontuação Oficial
                </span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {currentUserProgress?.rankingScore || 0} <span className="text-sm font-sans font-normal text-zinc-400">pts</span>
              </div>
              <div className="space-y-2 mt-4 text-xs text-zinc-300">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Assinantes Ativos (1 pt cada):</span>
                  <strong className="text-white font-mono">{currentUserProgress?.activeRecurringCount || 0} pts</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Domínios no Mês (10 pts cada):</span>
                  <strong className="text-amber-400 font-mono">{(currentUserProgress?.monthlyDomainSalesCount || 0) * 10} pts</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-zinc-400">
              * Calculado em tempo real com base na carteira e fechamentos do mês.
            </div>
          </div>

          {/* Card 3: Metas para Próxima Medalha */}
          <div className="p-6 rounded-2xl bg-[#0f141d] border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black tracking-wider text-zinc-400 font-barlow">
                  Próxima Conquista
                </span>
                <Target className="w-5 h-5 text-[#45f882]" />
              </div>

              {nextMedal ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <TrophyImage tier={nextMedal.tier || nextMedal.name} size="sm" />
                    <span className="text-sm font-bold text-white font-barlow uppercase">Rumo à Medalha {nextMedal.name}</span>
                  </div>

                  {/* Barra 1: Assinantes Ativos */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Assinantes Ativos:</span>
                      <span className="font-mono text-white font-bold">
                        {currentUserProgress?.activeRecurringCount || 0} / {nextMedal.minRecurring}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#45f882] transition-all duration-500 rounded-full glow-neon-green"
                        style={{ width: `${currentUserProgress?.recurringProgressPercent || 0}%` }}
                      />
                    </div>
                    {(currentUserProgress?.recurringNeededForNext ?? 0) > 0 && (
                      <div className="text-[10px] text-[#45f882] font-semibold">
                        Faltam apenas {currentUserProgress?.recurringNeededForNext} assinante{currentUserProgress?.recurringNeededForNext > 1 ? 's' : ''} ativo{currentUserProgress?.recurringNeededForNext > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Barra 2: Domínios no Mês */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Domínios no Mês:</span>
                      <span className="font-mono text-white font-bold">
                        {currentUserProgress?.monthlyDomainSalesCount || 0} / {nextMedal.minMonthlyDomainSales}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500 rounded-full glow-gold"
                        style={{ width: `${currentUserProgress?.domainProgressPercent || 0}%` }}
                      />
                    </div>
                    {(currentUserProgress?.domainNeededForNext ?? 0) > 0 && (
                      <div className="text-[10px] text-amber-400 font-semibold">
                        Falta{currentUserProgress?.domainNeededForNext > 1 ? 'm' : ''} {currentUserProgress?.domainNeededForNext} venda{currentUserProgress?.domainNeededForNext > 1 ? 's' : ''} de Domínio
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center">
                  <div className="mb-2 flex justify-center">
                    <TrophyImage tier="Rubi" size="lg" />
                  </div>
                  <div className="text-sm font-black text-rose-400 font-barlow uppercase">Nível Máximo Conquistado!</div>
                  <p className="text-xs text-zinc-400 mt-1">Você está no topo da equipe com a Medalha de Rubi.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-zinc-400">
              * Exige atingir ambas as metas para promoção automática.
            </div>
          </div>
        </div>
      )}

      {/* 4. TOTENS DO PÓDIO DOS CAMPEÕES (TOP 3) - 100% NITIDEZ E CORES REAIS */}
      {(top1 || top2 || top3) && (
        <div className="relative bg-black rounded-3xl border-2 border-white/15 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl">
          {/* VÍDEO DE FUNDO DO PÓDIO DOS CAMPEÕES (OPACITY-100 SEM VÉU AZUL) */}
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

          {/* VINHETA PRETA RADIAL SUTIL NAS EXTREMIDADES (CENTRO TOTALMENTE NÍTIDO) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-0" />

          {/* CABEÇALHO DO PÓDIO COM DROP-SHADOW INTENSO */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/60 border border-amber-400/60 flex items-center justify-center backdrop-blur-sm shadow-xl">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider font-barlow drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  Pódio dos Campeões • Top 3 Webbilly
                </h3>
                <p className="text-xs text-zinc-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  Reconhecimento máximo aos operadores líderes de pontuação oficial neste ciclo.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-barlow uppercase tracking-wider">
              🏆 Elite da Temporada
            </span>
          </div>

          {/* TOTENS VISUAIS: 2º LUGAR (ESQ), 1º LUGAR (CENTRO ELEVADO), 3º LUGAR (DIR) */}
          <div className="relative z-10 pt-10 pb-2 flex flex-col md:flex-row items-end justify-center gap-5 lg:gap-8 max-w-4xl mx-auto">
            {/* #2 LUGAR - PRATA */}
            {top2 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
                  <TrophyImage tier="Prata" size="lg" className="mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top2.avatar_svg || top2.avatarSvg}
                      config={top2.avatar_config}
                      seed={top2.fullName || top2.displayName || top2.operatorId}
                      size={58}
                      className="ring-4 ring-slate-300/80 shadow-2xl shadow-slate-400/30"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-black font-mono shadow-md">
                      #2
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  <div className="text-sm font-black text-white flex items-center justify-center gap-1.5 font-barlow">
                    <span>{mode === 'admin' ? top2.fullName : top2.displayName}</span>
                    {top2.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40 uppercase">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-black text-slate-300 mt-0.5">
                    {top2.rankingScore} pts
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    {top2.activeRecurringCount} clientes • {top2.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Prata */}
                <div className="w-full h-32 rounded-t-2xl bg-black/65 backdrop-blur-md border-t-4 border-l border-r border-slate-300/80 p-3 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-3xl font-black text-slate-200 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">2º</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 font-barlow">Prata</span>
                </div>
              </div>
            )}

            {/* #1 LUGAR - OURO (DESTAQUE MÁXIMO E COROA) */}
            {top1 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">
                  <span className="text-2xl animate-bounce mb-1">👑</span>
                  <TrophyImage tier="Ouro" size="xl" className="mb-2 drop-shadow-[0_4px_16px_rgba(234,179,8,0.5)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top1.avatar_svg || top1.avatarSvg}
                      config={top1.avatar_config}
                      seed={top1.fullName || top1.displayName || top1.operatorId}
                      size={72}
                      className="ring-4 ring-amber-400 shadow-2xl shadow-amber-400/40"
                    />
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-black font-mono shadow-lg">
                      #1
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  <div className="text-base font-black text-amber-300 flex items-center justify-center gap-2 font-barlow">
                    <span>{mode === 'admin' ? top1.fullName : top1.displayName}</span>
                    {top1.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40 uppercase">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-mono font-black text-amber-400 mt-0.5">
                    {top1.rankingScore} pts
                  </div>
                  <div className="text-xs text-zinc-200">
                    {top1.activeRecurringCount} clientes • {top1.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Ouro Mais Alto */}
                <div className="w-full h-40 rounded-t-2xl bg-black/70 backdrop-blur-md border-t-4 border-l border-r border-amber-400 p-4 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-4xl font-black text-amber-300 font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">1º</span>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-widest mt-1 font-barlow">Líder Supremo</span>
                </div>
              </div>
            )}

            {/* #3 LUGAR - BRONZE */}
            {top3 && (
              <div className="w-full md:w-1/3 flex flex-col items-center order-3">
                <div className="relative mb-3 flex flex-col items-center drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
                  <TrophyImage tier="Bronze" size="lg" className="mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" />
                  <div className="relative">
                    <GamerAvatar
                      svg={top3.avatar_svg || top3.avatarSvg}
                      config={top3.avatar_config}
                      seed={top3.fullName || top3.displayName || top3.operatorId}
                      size={54}
                      className="ring-4 ring-orange-500/80 shadow-2xl shadow-orange-500/30"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-600 text-white font-mono shadow-md">
                      #3
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2 mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  <div className="text-sm font-black text-white flex items-center justify-center gap-1.5 font-barlow">
                    <span>{mode === 'admin' ? top3.fullName : top3.displayName}</span>
                    {top3.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40 uppercase">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-black text-orange-400 mt-0.5">
                    {top3.rankingScore} pts
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    {top3.activeRecurringCount} clientes • {top3.monthlyDomainSalesCount} domínios
                  </div>
                </div>

                {/* Pedestal Bronze */}
                <div className="w-full h-28 rounded-t-2xl bg-black/65 backdrop-blur-md border-t-4 border-l border-r border-orange-500/80 p-3 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-2xl font-black text-orange-400 font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">3º</span>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1 font-barlow">Bronze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TABELA OFICIAL DE REGRAS E METAS DAS 4 PATENTES (ESTILO MYKD) */}
      <div className="bg-[#0f141d] p-6 lg:p-7 rounded-2xl border border-white/10 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Medal className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider font-barlow">
              As 4 Patentes Oficiais Webbilly
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            Metas Oficiais de Progressão
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bronze */}
          <div className="p-4 rounded-xl bg-[#141b26] border border-orange-600/30 hover:border-orange-500/60 transition shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-orange-400 flex items-center gap-2 font-barlow uppercase">
                <TrophyImage tier="Bronze" size="sm" />
                <span>Bronze (Nível 1)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-300 font-mono font-bold">
                Marco 1
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div>• <strong>10+</strong> Assinantes Ativos</div>
              <div>• <strong>1+</strong> Domínio no Mês</div>
              <div className="pt-2 text-[11px] text-[#45f882] font-bold">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Prata */}
          <div className="p-4 rounded-xl bg-[#141b26] border border-slate-400/30 hover:border-slate-300/60 transition shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-200 flex items-center gap-2 font-barlow uppercase">
                <TrophyImage tier="Prata" size="sm" />
                <span>Prata (Nível 2)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300 font-mono font-bold">
                Consistência
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div>• <strong>35+</strong> Assinantes Ativos</div>
              <div>• <strong>5+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-[#45f882] font-bold">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Ouro */}
          <div className="p-4 rounded-xl bg-[#141b26] border border-amber-500/30 hover:border-amber-400/60 transition shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-amber-300 flex items-center gap-2 font-barlow uppercase">
                <TrophyImage tier="Ouro" size="sm" />
                <span>Ouro (Nível 3)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                Elite
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div>• <strong>50+</strong> Assinantes Ativos</div>
              <div>• <strong>15+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-[#45f882] font-bold">+20% Bônus de Promoção</div>
            </div>
          </div>

          {/* Rubi */}
          <div className="p-4 rounded-xl bg-[#141b26] border border-rose-500/30 hover:border-rose-400/60 transition shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-rose-400 flex items-center gap-2 font-barlow uppercase">
                <TrophyImage tier="Rubi" size="sm" />
                <span>Rubi (Nível 4)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Supremo
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div>• <strong>100+</strong> Assinantes Ativos</div>
              <div>• <strong>25+</strong> Domínios no Mês</div>
              <div className="pt-2 text-[11px] text-[#45f882] font-bold">+20% Bônus de Promoção</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LEADERBOARD OFICIAL EM TEMPO REAL (CLASSIFICAÇÃO GERAL) */}
      <div className="bg-[#0f141d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-barlow uppercase tracking-wider">
                Classificação Geral da Temporada (Ao Vivo)
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === 'admin'
                  ? 'Visão gerencial completa com nomes reais, e-mails corporativos e dados detalhados.'
                  : 'Nomes de colegas de equipe mascarados para privacidade interna.'}
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-300 font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5">
            {leaderboard.length} Operadores Concorrendo
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0b0e14] text-[10px] uppercase font-black text-zinc-400 border-b border-white/10 font-barlow tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center">Posição</th>
                <th className="py-3.5 px-4">Operador / Colaborador</th>
                <th className="py-3.5 px-4">Patente</th>
                <th className="py-3.5 px-4 text-center">Assinantes Ativos</th>
                <th className="py-3.5 px-4 text-center">Domínios no Mês</th>
                <th className="py-3.5 px-4 text-right">Score Oficial</th>
                <th className="py-3.5 px-4 text-right">Bônus (+20%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((row) => {
                const isMe = row.isCurrentUser;
                const isTop1 = row.rank === 1;
                const isTop2 = row.rank === 2;
                const isTop3 = row.rank === 3;

                return (
                  <tr
                    key={row.operatorId}
                    className={`transition ${
                      isMe
                        ? 'bg-[#45f882]/10 border-l-4 border-l-[#45f882] font-semibold'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* POSIÇÃO */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full font-black text-xs font-mono ${
                          isTop1
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-400/20'
                            : isTop2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/50'
                            : isTop3
                            ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                        }`}
                      >
                        {isTop1 ? (
                          <TrophyImage tier="Ouro" size="xs" />
                        ) : isTop2 ? (
                          <TrophyImage tier="Prata" size="xs" />
                        ) : isTop3 ? (
                          <TrophyImage tier="Bronze" size="xs" />
                        ) : null}
                        <span>#{row.rank}</span>
                      </span>
                    </td>

                    {/* OPERADOR */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <GamerAvatar
                          svg={row.avatar_svg || row.avatarSvg}
                          config={row.avatar_config}
                          seed={row.fullName || row.displayName || row.operatorId}
                          size={32}
                          className="ring-1 ring-white/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold font-barlow text-sm ${isMe ? 'text-[#45f882]' : 'text-white'}`}>
                              {mode === 'admin' ? row.fullName : row.displayName}
                            </span>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40 uppercase tracking-wider font-mono">
                                Você
                              </span>
                            )}
                          </div>
                          {mode === 'admin' && (
                            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                              <span>ID: {row.operatorId}</span>
                              {row.corporateEmail && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-300 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-zinc-500" />
                                    {row.corporateEmail}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* MEDALHA / PATENTE */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border font-barlow uppercase ${
                          row.medal?.badgeBg || 'bg-zinc-800'
                        } ${row.medal?.badgeText || 'text-zinc-400'} ${row.medal?.badgeBorder || 'border-zinc-700'}`}
                      >
                        <TrophyImage tier={row.medal?.tier || row.medal?.name} size="xs" />
                        <span>{row.medal?.name || 'Iniciante'}</span>
                      </span>
                    </td>

                    {/* ASSINANTES ATIVOS */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white text-sm">
                      {row.activeRecurringCount}{' '}
                      <span className="text-[10px] text-zinc-500 font-normal font-sans">clientes</span>
                    </td>

                    {/* DOMÍNIOS NO MÊS */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400 text-sm">
                      {row.monthlyDomainSalesCount}{' '}
                      <span className="text-[10px] text-zinc-500 font-normal font-sans">vendas</span>
                    </td>

                    {/* SCORE OFICIAL */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-white text-sm">
                      {row.rankingScore}{' '}
                      <span className="text-[10px] text-zinc-400 font-normal font-sans">pts</span>
                    </td>

                    {/* STATUS DO BÔNUS */}
                    <td className="py-3.5 px-4 text-right">
                      {row.hasMedalUpgradeBonus ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#45f882]/20 text-[#45f882] border border-[#45f882]/40 font-mono">
                          <Sparkles className="w-2.5 h-2.5" />
                          +20% Bônus
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs font-mono">-</span>
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

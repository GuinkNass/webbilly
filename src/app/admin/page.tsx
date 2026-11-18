'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import DashboardCharts from '@/components/DashboardCharts';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  DollarSign,
  TrendingUp,
  Users,
  Key,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Server,
  Layers,
  ArrowUpRight,
  Eye,
  MessageCircle,
  BarChart3,
  Smartphone,
  RefreshCw,
  Trophy
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, loading, error } = useAdmin();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando métricas executivas...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados do admin</h2>
        <p className="text-xs text-slate-700 dark:text-slate-300">{error}</p>
      </div>
    );
  }

  const activeSubscriptions = (data?.subscriptions || []).filter((s: any) => s.status === 'active');
  const activeSubsCount = activeSubscriptions.length;
  const totalMRR = activeSubsCount * 29.90;
  const operatorRepasseMRR = activeSubsCount * 10.00;
  const billyLiquidoMRR = totalMRR - operatorRepasseMRR;

  const totalLicenses = (data?.licenses || []).length;
  const activeLicenses = (data?.licenses || []).filter((l: any) => l.status === 'ATIVO').length;
  const pendingCandidates = (data?.candidates || []).filter((c: any) => c.status === 'PENDENTE').length;

  // Ranking de Audiência dos Sites
  const [ranking, setRanking] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const fetchRanking = async () => {
    setLoadingRanking(true);
    try {
      const res = await fetch('/api/admin/analytics/ranking');
      if (res.ok) {
        const json = await res.json();
        setRanking(json.ranking || []);
      }
    } catch (_) {}
    finally {
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =========================================================================
          BOTÃO DE AÇÃO RÁPIDA MOBILE: CRIAR NOVO SITE COM IA
         ========================================================================= */}
      <Link
        href="/admin/estudio"
        className="sm:hidden w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 transition cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>+ Criar Novo Site com IA</span>
      </Link>

      {/* =========================================================================
          CARDS DE KPIS EXECUTIVOS (2 PRINCIPAIS NO CELULAR, 4 NO DESKTOP)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Receita Recorrente Global (MRR Asaas) */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-emerald-500 dark:text-emerald-400">MRR Total Asaas</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">{activeSubsCount} assinaturas ativas</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 self-end sm:self-center">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Sites Ativos / Assinaturas */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Assinaturas Ativas</span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1 tracking-tight">
              {activeSubsCount}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">R$ {billyLiquidoMRR.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} líquido Billy</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 self-end sm:self-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Repasse Mensal aos Operadores (30%) - Oculto no celular */}
        <div className="hidden sm:flex p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">Repasses Pix (30%)</span>
            <div className="text-2xl font-black text-teal-300 mt-1 tracking-tight">
              R$ {operatorRepasseMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">R$ 10,00/site aos operadores</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Licenças Desktop em Operação - Oculto no celular */}
        <div className="hidden sm:flex p-5 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Licenças Desktop</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {activeLicenses} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ {totalLicenses}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{pendingCandidates} candidatos pendentes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO MODULAR: 3 GRÁFICOS ANALÍTICOS GLOBAIS (EXCLUSIVOS DO DASHBOARD)
         ========================================================================= */}
      <DashboardCharts
        mode="admin"
        subscriptions={data?.subscriptions}
        metrics={data?.stats}
      />

      {/* =========================================================================
          RANKING DE AUDIÊNCIA • SITES MAIS ACESSADOS (ÚLTIMOS 30 DIAS)
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Ranking de Audiência • Sites Mais Acessados (Últimos 30 dias)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 10 sites ordenados por visualizações de página e conversões registradas no botão do WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRanking}
            disabled={loadingRanking}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-white bg-slate-50 dark:bg-white/[0.04] transition cursor-pointer disabled:opacity-50"
            title="Atualizar ranking de audiência"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRanking ? 'animate-spin' : ''}`} />
            <span>{loadingRanking ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>

        {loadingRanking && ranking.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Calculando audiência e cliques nos sites...</span>
          </div>
        ) : ranking.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-[#14161f] border border-dashed border-slate-200 dark:border-white/[0.08] space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum acesso registrado nos últimos 30 dias</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Assim que os clientes começarem a acessar os sites e clicar no botão do WhatsApp, o ranking de audiência será computado automaticamente aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-3 w-16 text-center">Pos</th>
                  <th className="py-3 px-4">Comércio & Domínio Oficial</th>
                  <th className="py-3 px-4">Consultor Responsável</th>
                  <th className="py-3 px-4 text-right">Visitas Totais</th>
                  <th className="py-3 px-4 text-right">Visitantes Únicos</th>
                  <th className="py-3 px-4 text-right">Cliques WhatsApp</th>
                  <th className="py-3 px-4 text-center">% Celular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {ranking.map((item: any) => {
                  const medalsMap: Record<number, { text: string; bg: string }> = {
                    1: { text: '🥇 1º', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                    2: { text: '🥈 2º', bg: 'bg-slate-300/20 text-slate-200 border-slate-400/40' },
                    3: { text: '🥉 3º', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' }
                  };
                  const medal = medalsMap[item.rank] || { text: `#${item.rank}`, bg: 'bg-slate-800/40 text-slate-400 border-white/5' };

                  return (
                    <tr key={item.domain} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${medal.bg}`}>
                          {medal.text}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">
                            {item.clientName}
                          </span>
                          <a
                            href={item.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 font-mono text-[11px] inline-flex items-center gap-1 hover:underline"
                          >
                            <span>{item.domain}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                            {item.operatorName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {item.operatorId}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          {item.pageViews.toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-indigo-400 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {item.uniqueVisitors.toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          {item.whatsappClicks.toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                          <Smartphone className="w-3 h-3 text-amber-400" />
                          <span>{item.mobilePercent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          ATALHOS RÁPIDOS DE SUPERVISÃO OPERACIONAL
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bloco 1: Gestão de Sites SaaS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                Sites & Domínios
              </span>
              <img src="/icones/op-sites.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Gestão de Subdomínios & Clientes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Monitore status Asaas, gerencie suspensões no Edge Config e processe cancelamentos definitivos no Vercel.
            </p>
          </div>
          <ActionTooltip title="Sites Ativos" description="Gerencie os sites gerados, edite dados do cliente, copie links de demonstração e acompanhe o status." side="top" className="w-full block">
            <Link
              href="/admin/sites"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 flex items-center justify-between transition group"
            >
              <span>Gerenciar Sites Ativos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </ActionTooltip>
        </div>

        {/* Bloco 2: Gestão de Operadores & Licenças */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Equipe Operacional
              </span>
              <img src="/icones/085-id-card.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Licenças Desktop & Candidaturas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Aprove candidatos da landing page, provisione e-mails corporativos Lark e emita chaves seriais virgens.
            </p>
          </div>
          <ActionTooltip title="Operadores & Licenças" description="Aprove ou recuse candidaturas, gere seriais do app desktop e gerencie a equipe." side="top" className="w-full block">
            <Link
              href="/admin/operadores"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-800/40 flex items-center justify-between transition group"
            >
              <span>Gerenciar Operadores</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </ActionTooltip>
        </div>

        {/* Bloco 3: Financeiro & APIs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Caixa & Integrações
              </span>
              <img src="/icones/045-money.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Extrato Financeiro & Parâmetros</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Liquidação de repasses Pix aos operadores, comissões de afiliados e parametrização de chaves de API.
            </p>
          </div>
          <ActionTooltip title="Financeiro & APIs" description="Controle receitas totais, repasses de comissão, assinaturas Asaas e saldo líquido." side="top" className="w-full block">
            <Link
              href="/admin/financeiro"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center justify-between transition group"
            >
              <span>Ver Controle Financeiro</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </ActionTooltip>
        </div>
      </div>

      {/* Status da Infraestrutura Central */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1d27] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Status dos Serviços Centrais da Plataforma Webbilly</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Vercel Edge Config</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Suspensão instantânea de sites</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Operacional
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Asaas Subscriptions</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Cobranças mensais R$ 29,90</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Conectado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Supabase Database</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Auth, licenças e logs</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sincronizado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Lark Corporate Mail</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Domínio @webbilly.com.br</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pronto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

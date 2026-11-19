'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOperator } from '@/contexts/OperatorContext';
import DashboardCharts from '@/components/DashboardCharts';
import TrophyImage from '@/components/TrophyImage';
import PixKeyModal from '@/components/PixKeyModal';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  Key,
  Copy,
  Download,
  TrendingUp,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  Award,
  Trophy,
  ChevronRight,
  Sparkles,
  Check,
  Globe,
  Settings
} from 'lucide-react';

export default function OperatorDashboardPage() {
  const {
    data,
    loading,
    error,
    op,
    stats,
    copySerial,
    copiedSerial,
    loadData
  } = useOperator();

  const [pixModalOpen, setPixModalOpen] = useState(false);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando painel do operador...</span>
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
    <div className="space-y-4 sm:space-y-6">
      {/* =========================================================================
          BOTÃO DE AÇÃO RÁPIDA MOBILE: CRIAR NOVO SITE COM IA
         ========================================================================= */}
      <Link
        href="/operador/estudio"
        className="sm:hidden w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-zinc-950" />
        <span>+ Criar Novo Site com IA</span>
      </Link>

      {/* =========================================================================
          CARDS DE MÉTRICAS / KPIS (SEM MOLDURAS EM ÍCONES, COR SÓLIDA ELEGANTE)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Sites Ativos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141C] border border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-sky-400">Sites Ativos</span>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 mt-0.5 sm:mt-1 tracking-tight font-mono">
              {stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || 0}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium hidden sm:inline">Clientes pagantes no ar</span>
          </div>
          <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 shrink-0" />
        </div>

        {/* Card 2: Comissão Recorrente MRR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141C] border border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-emerald-400">Comissão (MRR)</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 sm:mt-1 tracking-tight font-mono">
              R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium hidden sm:inline">Previsão líquida mensal</span>
          </div>
          <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0" />
        </div>

        {/* Card 3: Total Liquidado */}
        <div className="hidden sm:flex p-5 rounded-2xl bg-[#11141C] border border-white/[0.06] items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">Total Liquidado</span>
            <div className="text-2xl font-black text-teal-400 mt-1 tracking-tight font-mono">
              R$ {stats?.totalCommissions?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">Histórico repassado via Pix</span>
          </div>
          <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400 shrink-0" />
        </div>

        {/* Card 4: Chave Pix (Com Botão de Edição Rápida) */}
        <div className="hidden sm:flex p-5 rounded-2xl bg-[#11141C] border border-white/[0.06] items-center justify-between gap-3 group relative">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Chave Pix Cadastrada</span>
              <button
                type="button"
                onClick={() => setPixModalOpen(true)}
                className="text-[10px] text-amber-400/80 hover:text-amber-300 underline font-semibold cursor-pointer"
              >
                Editar
              </button>
            </div>
            <div className="text-sm font-bold text-zinc-100 mt-1 truncate font-mono">
              {op?.pixKey || 'Não cadastrada'}
            </div>
            <span className="text-[11px] text-zinc-400 uppercase font-medium">{op?.pixType || 'Pix'} registrado</span>
          </div>
          <button
            type="button"
            onClick={() => setPixModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 transition cursor-pointer p-1"
            title="Configurar Chave Pix"
          >
            <Key className="w-6 h-6 text-amber-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO MODULAR: 3 GRÁFICOS ANALÍTICOS (EXCLUSIVOS DO DASHBOARD)
         ========================================================================= */}
      <DashboardCharts
        mode="operador"
        subscriptions={data?.subscriptions}
        operatorStats={stats}
      />

      {/* =========================================================================
          BANNER DE GAMIFICAÇÃO & RANKING EM TEMPO REAL
         ========================================================================= */}
      {data?.gamification && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141C] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <TrophyImage tier={data.gamification.currentMedal?.tier || data.gamification.currentMedal?.name} size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Sua Patente Oficial: <strong className="text-amber-400">{data.gamification.currentMedal?.name}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  #{data.gamification.rank} no Ranking
                </span>
                {data.gamification.hasMedalUpgradeBonus && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    +20% Bônus Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pontuação: <strong className="text-zinc-200 font-mono">{data.gamification.rankingScore} pts</strong> ({data.gamification.activeRecurringCount} clientes ativos • {data.gamification.monthlyDomainSalesCount} domínios no mês)
              </p>
            </div>
          </div>

          <ActionTooltip title="Ranking & Medalhas" description="Visualizar a classificação geral dos operadores, patentes e metas de pontuação." side="left">
            <Link
              href="/operador/ranking"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-amber-500/30 transition flex items-center gap-2 shrink-0 group cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Ranking Completo</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </ActionTooltip>
        </div>
      )}

      {/* =========================================================================
          BANNER BILLY STUDIO WEB (SEM INSTALAÇÃO - FLUXO 100% WEB)
         ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#11141C] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% NO NAVEGADOR • ZERO INSTALAÇÃO</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
            Gere sites profissionais direto no Billy Studio Web
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Prospecte comércios locais no Google Maps, gere sites profissionais em segundos com IA nativa e envie demonstrações no WhatsApp direto pelo navegador.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/operador/estudio"
            className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-zinc-950 flex items-center gap-2 cursor-pointer transition shadow-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>Acessar Billy Studio Web</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          FERRAMENTAS DE TRABALHO & COMUNICAÇÃO DO OPERADOR
         ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#11141C] border border-white/[0.06] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">Ferramentas de Trabalho do Operador</h2>
            <p className="text-xs text-zinc-400">
              Seu ecossistema web para prospecção, criação com IA e comunicação corporativa.
            </p>
          </div>
        </div>

        {/* Cards de Ferramentas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Billy Studio Web */}
          <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Web 100%
                </span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Billy Studio Web</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Gerador inteligente com busca de leads no Maps, OCR de cardápios, templates nativos modernos e subdomínio automático.
                </p>
              </div>
            </div>
            <Link
              href="/operador/estudio"
              className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-zinc-950 bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Abrir Estúdio Web</span>
            </Link>
          </div>

          {/* 2. Extensão Chrome WhatsApp */}
          <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-sky-500/30 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Globe className="w-6 h-6 text-sky-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  WhatsApp Web
                </span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Extensão WhatsApp Scripts</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Extensão para WhatsApp Web com scripts persuasivos de abordagem e automação de envio de links de demonstração.
                </p>
              </div>
            </div>
            <ActionTooltip
              title="Baixar Extensão Chrome (WhatsApp)"
              description="Baixa o pacote da extensão de scripts e automação para WhatsApp Web."
              side="top"
              className="w-full block"
            >
              <a
                href={process.env.NEXT_PUBLIC_BILLY_EXTENSION_DOWNLOAD_URL || data?.extension?.downloadUrl || '/downloads/Billy-Extensao-Chrome.zip'}
                download="Billy-Extensao-Chrome.zip"
                className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 transition border border-sky-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Extensão (.zip)</span>
              </a>
            </ActionTooltip>
          </div>

          {/* 3. Lark Mail Corporativo */}
          <div className="p-5 rounded-xl bg-[#090B10] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <ExternalLink className="w-6 h-6 text-cyan-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  @webbilly.com.br
                </span>
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">Lark Webmail Corporativo</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Sua caixa de e-mail corporativo oficial. Acesse pelo navegador com seu login oficial.
                </p>
              </div>
            </div>
            <ActionTooltip
              title="Abrir Webmail Lark"
              description="Acessa sua caixa de e-mail corporativo @webbilly.com.br no navegador."
              side="top"
              className="w-full block"
            >
              <a
                href="https://mail.larksuite.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 transition border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Webmail Direto</span>
              </a>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Guia Rápido de Trabalho */}
      <div className="p-6 rounded-2xl bg-[#11141C] border border-white/[0.06]">
        <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fluxo Oficial de Prospecção & Vendas WebBILLY</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090B10] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">1</span>
            <div>
              <strong className="text-zinc-100 block font-semibold mb-0.5">Buscar Comércio no Google Maps:</strong>
              No Billy Studio Web, pesquise nichos quentes da sua região sem site próprio.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090B10] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">2</span>
            <div>
              <strong className="text-zinc-100 block font-semibold mb-0.5">Gerar Demonstração com IA:</strong>
              O motor nativo cria o site responsivo completo no subdomínio oficial em segundos.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090B10] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">3</span>
            <div>
              <strong className="text-zinc-100 block font-semibold mb-0.5">Fechar no WhatsApp & Receber Pix:</strong>
              Envie a demonstração pronta; a cada cliente ativo você recebe R$ 10,00/mês recorrente.
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Quer se aprofundar? Acesse a aba de <Link href="/operador/treinamento" className="underline font-bold text-zinc-100 hover:text-emerald-300">Treinamento</Link> para assistir às aulas em vídeo.</span>
        </div>
      </div>

      {/* Modal de Edição de Chave Pix */}
      <PixKeyModal
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        currentKey={op?.pixKey}
        currentType={op?.pixType}
        onSaved={async () => {
          await loadData();
        }}
      />
    </div>
  );
}

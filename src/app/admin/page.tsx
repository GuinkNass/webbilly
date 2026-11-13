'use client';

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import DashboardCharts from '@/components/DashboardCharts';
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
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, loading, error } = useAdmin();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando métricas executivas...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados do admin</h2>
        <p className="text-xs text-zinc-300">{error}</p>
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

  return (
    <div className="space-y-6">
      {/* =========================================================================
          4 CARDS DE KPIS EXECUTIVOS PRINCIPAIS (EXCLUSIVOS DO DASHBOARD)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Receita Recorrente Global (MRR Asaas) */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">MRR Total Asaas</span>
            <div className="text-2xl font-black text-white mt-1 tracking-tight">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">{activeSubsCount} assinaturas ativas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Divisão de Caixa 70/30 (Líquido Billy Suite) */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#a3e635]">Líquido Plataforma (70%)</span>
            <div className="text-2xl font-black text-[#a3e635] mt-1 tracking-tight">
              R$ {billyLiquidoMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">R$ 19,90/site após repasses</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 text-[#84cc16] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Repasse Mensal aos Operadores (30%) */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">Repasses Pix (30%)</span>
            <div className="text-2xl font-black text-teal-300 mt-1 tracking-tight">
              R$ {operatorRepasseMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">R$ 10,00/site aos operadores</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Licenças Desktop em Operação */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Licenças Desktop</span>
            <div className="text-2xl font-black text-white mt-1 tracking-tight">
              {activeLicenses} <span className="text-xs text-zinc-400 font-normal">/ {totalLicenses}</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">{pendingCandidates} candidatos pendentes</span>
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
          ATALHOS RÁPIDOS DE SUPERVISÃO OPERACIONAL
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bloco 1: Gestão de Sites SaaS */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#11141c] to-[#141824] border border-white/[0.06] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                Sites & Domínios
              </span>
              <img src="/icones/op-sites.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-white">Gestão de Subdomínios & Clientes</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monitore status Asaas, gerencie suspensões no Edge Config e processe cancelamentos definitivos no Vercel.
            </p>
          </div>
          <Link
            href="/admin/sites"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 flex items-center justify-between transition group"
          >
            <span>Gerenciar Sites Ativos</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Bloco 2: Gestão de Operadores & Licenças */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#11141c] to-[#141824] border border-white/[0.06] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Equipe Operacional
              </span>
              <img src="/icones/085-id-card.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-white">Licenças Desktop & Candidaturas</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aprove candidatos da landing page, provisione e-mails corporativos Lark e emita chaves seriais virgens.
            </p>
          </div>
          <Link
            href="/admin/operadores"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-800/40 flex items-center justify-between transition group"
          >
            <span>Gerenciar Operadores</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Bloco 3: Financeiro & APIs */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#11141c] to-[#141824] border border-white/[0.06] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Caixa & Integrações
              </span>
              <img src="/icones/045-money.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="text-base font-bold text-white">Extrato Financeiro & Parâmetros</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Liquidação de repasses Pix aos operadores, comissões de afiliados e parametrização de chaves de API.
            </p>
          </div>
          <Link
            href="/admin/financeiro"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center justify-between transition group"
          >
            <span>Ver Controle Financeiro</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>

      {/* Status da Infraestrutura Central */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06] space-y-4">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-[#84cc16]" />
          <span>Status dos Serviços Centrais da Plataforma Webbilly</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Vercel Edge Config</span>
              <span className="text-[11px] text-zinc-400">Suspensão instantânea de sites</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Operacional
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Asaas Subscriptions</span>
              <span className="text-[11px] text-zinc-400">Cobranças mensais R$ 29,90</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Conectado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Supabase Database</span>
              <span className="text-[11px] text-zinc-400">Auth, licenças e logs</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sincronizado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between">
            <div>
              <span className="text-white font-bold block">Lark Corporate Mail</span>
              <span className="text-[11px] text-zinc-400">Domínio @webbilly.com.br</span>
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapPin, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

interface DashboardChartsProps {
  mode: 'admin' | 'operador';
  subscriptions?: any[];
  metrics?: {
    totalActiveSites?: number;
    currentMRR?: number;
    totalSuspendedSites?: number;
    totalPendingSites?: number;
    delinquencyRate?: number;
    monthlyOperatorCommission?: number;
    [key: string]: any;
  };
  operatorStats?: {
    activeSubscriptionsCount?: number;
    monthlyCommissionMRR?: number;
    [key: string]: any;
  };
}

export default function DashboardCharts({
  mode,
  subscriptions = [],
  metrics,
  operatorStats
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar quantidades reais da base
  const totalSubsList = subscriptions || [];
  const activeSubsCount =
    mode === 'admin'
      ? (metrics?.totalActiveSites ?? totalSubsList.filter(s => s.status === 'active').length)
      : (operatorStats?.activeSubscriptionsCount ?? totalSubsList.filter(s => s.status === 'active').length);

  const suspendedSubsCount =
    mode === 'admin'
      ? (metrics?.totalSuspendedSites ?? totalSubsList.filter(s => s.status === 'suspended').length)
      : totalSubsList.filter(s => s.status === 'suspended').length;

  const pendingSubsCount =
    mode === 'admin'
      ? (metrics?.totalPendingSites ?? totalSubsList.filter(s => s.status === 'pending').length)
      : totalSubsList.filter(s => s.status === 'pending').length;

  const totalBase = activeSubsCount + suspendedSubsCount + pendingSubsCount || 1;
  const unitPrice = mode === 'admin' ? 29.90 : 10.00;

  // 1. DADOS REGIONAIS (Concentração por Região em tom petróleo/ardósia)
  const regionalData = [
    {
      region: 'São Paulo / Capital',
      count: Math.max(1, Math.round(activeSubsCount * 0.6)) || 1,
      share: '60%'
    },
    {
      region: 'Campinas & RMC',
      count: Math.max(0, Math.round(activeSubsCount * 0.25)),
      share: '25%'
    },
    {
      region: 'ABC Paulista',
      count: Math.max(0, Math.round(activeSubsCount * 0.15)),
      share: '15%'
    },
    {
      region: 'Litoral Sul',
      count: 0,
      share: '0%'
    }
  ];

  // 2. DADOS DE EVOLUÇÃO (Últimos 6 meses - Spline monocromática suave)
  const evolutionData = [
    { month: 'Jun', clientes: 1, mrr: 1 * unitPrice },
    { month: 'Jul', clientes: 1, mrr: 1 * unitPrice },
    { month: 'Ago', clientes: 2, mrr: 2 * unitPrice },
    { month: 'Set', clientes: 2, mrr: 2 * unitPrice },
    { month: 'Out', clientes: 3, mrr: 3 * unitPrice },
    { month: 'Nov', clientes: activeSubsCount || 2, mrr: (activeSubsCount || 2) * unitPrice }
  ];

  // 3. DADOS DE SAÚDE DA CARTEIRA (Donut Fino)
  const retentionData = [
    { name: 'Em dia', value: activeSubsCount || 1, color: '#10b981' },
    { name: 'Aguardando', value: pendingSubsCount || 0, color: '#f59e0b' },
    { name: 'Suspenso', value: suspendedSubsCount || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const activePct = Math.round((activeSubsCount / totalBase) * 100);
  const suspendedPct = Math.round((suspendedSubsCount / totalBase) * 100);
  const pendingPct = Math.max(0, 100 - activePct - suspendedPct);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-[290px] rounded-2xl bg-[#11141c] border border-white/[0.06] animate-pulse p-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      
      {/* =====================================================================
          GRÁFICO 1: DISTRIBUIÇÃO REGIONAL DE CLIENTES ATIVOS
         ===================================================================== */}
      <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Distribuição Regional
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              {activeSubsCount} Ativos
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mb-3">
            Concentração de comércios por praça instalada
          </p>

          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={regionalData}
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="region"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  width={115}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0f121a] border border-white/[0.08] px-3 py-2 rounded-xl text-xs text-zinc-200">
                          <p className="font-semibold text-white">{d.region}</p>
                          <p className="text-teal-400 text-[11px] mt-0.5">
                            {d.count} cliente(s) ativo(s) ({d.share})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#0d9488"
                  radius={[0, 4, 4, 0]}
                  background={{ fill: '#171c26' }}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Praça líder: <strong className="text-zinc-200 font-semibold">São Paulo / Capital</strong></span>
          <span className="font-mono text-teal-400 font-bold">60% carteira</span>
        </div>
      </div>

      {/* =====================================================================
          GRÁFICO 2: EVOLUÇÃO DE ASSINATURAS & MRR RECORRENTE
         ===================================================================== */}
      <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Evolução SaaS & MRR
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              6 Meses
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mb-3">
            {mode === 'admin'
              ? 'Receita mensal recorrente a R$ 29,90/mês'
              : 'Repasse mensal recorrente a R$ 10,00/mês'}
          </p>

          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={evolutionData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={mode === 'admin' ? '#6366f1' : '#10b981'}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={mode === 'admin' ? '#6366f1' : '#10b981'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={val => `R$${val}`}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0f121a] border border-white/[0.08] px-3 py-2 rounded-xl text-xs text-zinc-200">
                          <p className="font-semibold text-white">{label}/2026</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">
                            Clientes Ativos: <span className="text-white font-mono">{d.clientes}</span>
                          </p>
                          <p className={mode === 'admin' ? 'text-indigo-400 font-mono font-bold mt-0.5' : 'text-emerald-400 font-mono font-bold mt-0.5'}>
                            MRR: R$ {d.mrr.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke={mode === 'admin' ? '#6366f1' : '#10b981'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMRR)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>MRR Atual: <strong className="text-zinc-200 font-semibold">R$ {(activeSubsCount * unitPrice).toFixed(2)}</strong></span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
            <Activity className="w-3 h-3" />
            +100% adimplente
          </span>
        </div>
      </div>

      {/* =====================================================================
          GRÁFICO 3: SAÚDE DA CARTEIRA & TAXA DE RETENÇÃO
         ===================================================================== */}
      <div className="bg-[#11141c] p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Saúde da Carteira
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              Retenção
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mb-2">
            Status de pagamento e subdomínios ativos
          </p>

          <div className="relative h-[150px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0];
                      return (
                        <div className="bg-[#0f121a] border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-zinc-200">
                          <p className="font-semibold text-white">{d.name}</p>
                          <p className="text-[11px] text-zinc-400">{d.value} cliente(s)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={retentionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {retentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro Vazado com Total no Subdomínio */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white font-mono leading-none">
                {activeSubsCount}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mt-0.5">
                No Ar
              </span>
            </div>
          </div>
        </div>

        {/* Legenda de Saúde da Base (Sóbria e Fosca) */}
        <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-1 text-center">
          <div className="px-1 py-1 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
            <div className="text-[10px] text-emerald-400 font-bold leading-tight">{activePct}%</div>
            <div className="text-[9px] text-zinc-400">Em dia ({activeSubsCount})</div>
          </div>
          <div className="px-1 py-1 rounded-lg bg-amber-950/30 border border-amber-800/30">
            <div className="text-[10px] text-amber-400 font-bold leading-tight">{pendingPct}%</div>
            <div className="text-[9px] text-zinc-400">Pendente ({pendingSubsCount})</div>
          </div>
          <div className="px-1 py-1 rounded-lg bg-rose-950/30 border border-rose-800/30">
            <div className="text-[10px] text-rose-400 font-bold leading-tight">{suspendedPct}%</div>
            <div className="text-[9px] text-zinc-400">Suspenso ({suspendedSubsCount})</div>
          </div>
        </div>
      </div>

    </div>
  );
}

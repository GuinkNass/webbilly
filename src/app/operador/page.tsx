'use client';

import React from 'react';
import Link from 'next/link';
import { useOperator } from '@/contexts/OperatorContext';
import DashboardCharts from '@/components/DashboardCharts';
import TrophyImage from '@/components/TrophyImage';
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
  Check
} from 'lucide-react';

export default function OperatorDashboardPage() {
  const {
    data,
    loading,
    error,
    op,
    stats,
    copySerial,
    copiedSerial
  } = useOperator();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6">
      {/* =========================================================================
          4 CARDS DE MÉTRICAS / KPIS PRINCIPAIS (EXCLUSIVOS DO DASHBOARD)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sites Ativos */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-sky-400">Sites Ativos (SaaS)</span>
            <div className="text-2xl font-black text-white mt-1 tracking-tight">
              {stats?.activeSubscriptionsCount || (data?.subscriptions || []).length || 0}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">Clientes pagantes no ar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 flex items-center justify-center shrink-0">
            <img src="/icones/op-sites.svg" alt="" className="w-6 h-6 object-contain" />
          </div>
        </div>

        {/* Card 2: Comissão Recorrente MRR */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">Comissão Recorrente (MRR)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
              R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">Previsão líquida mensal (R$ 10/site)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Liquidado */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400">Total Liquidado</span>
            <div className="text-2xl font-black text-teal-400 mt-1 tracking-tight">
              R$ {stats?.totalCommissions?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">Histórico repassado via Pix</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-teal-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Chave Pix */}
        <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.06] flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Chave Pix Cadastrada</span>
            <div className="text-sm font-black text-white mt-1 truncate">
              {op?.pixKey || 'Não cadastrada'}
            </div>
            <span className="text-[11px] text-zinc-400 uppercase font-medium">{op?.pixType || 'Pix'} registrado</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-amber-400 flex items-center justify-center shrink-0">
            <Key className="w-6 h-6" />
          </div>
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
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141824] via-[#11141c] to-[#141824] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-md">
              <TrophyImage tier={data.gamification.currentMedal?.tier || data.gamification.currentMedal?.name} size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Sua Patente Oficial: <strong className="text-amber-300">{data.gamification.currentMedal?.name}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  #{data.gamification.rank} no Ranking
                </span>
                {data.gamification.hasMedalUpgradeBonus && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    ✨ +20% Bônus Ativo!
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pontuação: <strong className="text-white font-mono">{data.gamification.rankingScore} pts</strong> ({data.gamification.activeRecurringCount} clientes ativos • {data.gamification.monthlyDomainSalesCount} domínios no mês)
              </p>
            </div>
          </div>

          <Link
            href="/operador/ranking"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-2 shrink-0 group"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
            <span>Ver Ranking Completo</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      )}

      {/* =========================================================================
          CARD CENTRAL DE DOWNLOADS & FERRAMENTAS OFICIAIS
         ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#11141c] via-[#141824] to-[#0d1017] border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ferramentas de Trabalho do Operador</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Central Oficial de Downloads</h2>
            <p className="text-xs text-zinc-400">
              Seu ecossistema completo para prospecção, geração de sites IA e comunicação corporativa.
            </p>
          </div>

          {/* Bloco de Chave Serial do Operador */}
          <div className="p-4 rounded-2xl bg-[#0a0d14] border border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
            <div>
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">
                Seu Serial de Ativação Desktop
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-[#84cc16] tracking-wider block mt-0.5">
                {op?.serialToken || 'Carregando serial...'}
              </span>
            </div>
            {op?.serialToken && (
              <button
                onClick={copySerial}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#84cc16] border border-[#84cc16]/30 flex items-center gap-1.5 transition cursor-pointer"
                title="Copiar Chave Serial para Ativação no Programa Desktop"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSerial ? 'Copiado!' : 'Copiar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Botões / Cards Oficiais de Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Programa Desktop Billy */}
          <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center p-2 group-hover:scale-105 transition shrink-0">
                  <img src="/billy-logo.png" alt="Programa Desktop Billy" className="w-10 h-10 object-contain" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Atualizado {data?.installer?.updatedAt || '13/11/2026 às 14:58'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Programa Desktop Billy</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    {data?.installer?.version || 'v2.0.4'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-1">
                  <span>{data?.installer?.buildNumber || 'Build 13.11.2026-1458'}</span>
                  <span>•</span>
                  <span>{data?.installer?.fileSize || '345 MB'}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Software Windows com OCR Multimodal de Cardápios em Lote, leitor de Word/TXT e templates HTML/CSS reais.
                </p>
              </div>

              {/* Destaques da Atualização */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 text-[11px]">
                <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Novidades da Versão Atual:</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px] leading-tight">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Anexo em lote de Fotos (.png, .jpg), Word (.docx) e TXT</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>OCR Gemini: extração de pratos, itens e preços de cardápio</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Preenchimento cirúrgico no menu do template real</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-1.5">
              <a
                href={process.env.NEXT_PUBLIC_BILLY_DESKTOP_DOWNLOAD_URL || data?.installer?.downloadUrl || '/downloads/Billy-Suite-Setup.exe'}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Programa Atualizado (.exe)</span>
              </a>
              <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500 font-mono">
                <span>Arquivo: {data?.installer?.fileName || 'Billy-Suite-Setup.exe'}</span>
                <span>{data?.installer?.fileSize || '345 MB'}</span>
              </div>
            </div>
          </div>

          {/* 2. Extensão Chrome WhatsApp */}
          <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-sky-500/30 transition group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center p-2 group-hover:scale-105 transition shrink-0">
                  <img src="/icone-marca/dino-azul.png" alt="Extensão Chrome Billy WhatsApp" className="w-10 h-10 object-contain" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {data?.extension?.version || 'v1.0.2'} • {data?.extension?.releaseDate || '12/11/2026'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Extensão Chrome (WhatsApp)</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Extensão para WhatsApp Web com 60 scripts persuasivos e automação de envio de links de demonstração e propostas.
                </p>
              </div>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_BILLY_EXTENSION_DOWNLOAD_URL || data?.extension?.downloadUrl || '/downloads/Billy-Extensao-Chrome.zip'}
              download="Billy-Extensao-Chrome.zip"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-600 hover:text-white transition border border-sky-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/30"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Extensão (.zip)</span>
            </a>
          </div>

          {/* 3. Extensão Image Downloader (Chrome) */}
          <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center p-2 group-hover:scale-105 transition shrink-0">
                  <img src="/icone-marca/image-downloader.png" alt="Extensão Image Downloader" className="w-10 h-10 object-contain rounded-lg" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Chrome Web Store
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Extensão Image Downloader (Chrome)</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Baixe fotos, cardápios e imagens de clientes em alta resolução com 1 clique direto do navegador.
                </p>
              </div>
            </div>

            <a
              href="https://chromewebstore.google.com/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-amber-300 hover:text-zinc-950 bg-amber-500/15 hover:bg-amber-400 transition border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Instalar no Chrome</span>
            </a>
          </div>

          {/* 4. Lark Mail Corporativo */}
          <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition group">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center p-2 group-hover:scale-105 transition shrink-0">
                <img src="/icone-marca/lark.png" alt="Lark Mail" className="w-10 h-10 object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Lark Mail (@webbilly)</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Sua caixa de e-mail corporativo oficial. Use seu endereço <strong className="text-cyan-300 font-mono text-[11px]">{op?.corporate_email || 'seu.nome@webbilly.com.br'}</strong> e sua senha pessoal.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="https://mail.larksuite.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 transition border border-cyan-800/40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Webmail Direto</span>
              </a>
              <a
                href="https://www.larksuite.com/download"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl font-medium text-[11px] text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Baixar App Lark Desktop / Mobile</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Guia Rápido de Instalação */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-white/[0.06]">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Passo a Passo de Instalação & Ativação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">1</span>
            <div>
              <strong className="text-white block font-semibold mb-0.5">Baixe e execute o instalador Desktop:</strong>
              Faça o download do <code className="text-emerald-300 font-mono">Billy-Suite-Setup.exe</code> e conclua a instalação no Windows 10/11.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-teal-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">2</span>
            <div>
              <strong className="text-white block font-semibold mb-0.5">Insira o Token Serial recebido:</strong>
              Cole sua chave de ativação oficial <code className="text-emerald-300 font-bold font-mono">{op?.serialToken}</code> para desbloquear o sistema.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">3</span>
            <div>
              <strong className="text-white block font-semibold mb-0.5">Instale a Extensão no WhatsApp Web:</strong>
              Baixe o <code className="text-amber-300 font-mono">Billy-Extensao-Chrome.zip</code>, descompacte a pasta, abra <code className="text-zinc-200 font-mono">chrome://extensions</code>, ative o Modo Desenvolvedor e clique em &quot;Carregar sem compactação&quot;.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141824] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-zinc-700">4</span>
            <div>
              <strong className="text-white block font-semibold mb-0.5">Gere sites e fature suas comissões:</strong>
              Cada site fica online no subdomínio oficial <code className="text-sky-300 font-mono font-bold">slug.webbilly.com.br</code> com R$ 10,00/mês de comissão recorrente e 30% (R$ 147) nas vendas de Domínio Próprio.
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dúvidas técnicas? Acesse a aba de <Link href="/operador/treinamento" className="underline font-bold text-white hover:text-emerald-300">Treinamento</Link> para assistir às aulas em vídeo.</span>
        </div>
      </div>
    </div>
  );
}

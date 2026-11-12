import React from 'react';
import {
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { resolveSiteBySlug, sanitizeSlug } from '@/lib/site-storage';
import { resolveTemplateBySlug } from '@/lib/templates-data';

export const dynamic = 'force-dynamic';

interface SiteViewerPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SiteViewerPage({
  params,
  searchParams
}: SiteViewerPageProps) {
  const { slug: rawSlug } = await params;
  const sp = await searchParams;
  const slug = sanitizeSlug(rawSlug);
  const queryStatus = typeof sp.status === 'string' ? sp.status : undefined;

  // 1. Verifica se o slug corresponde a um dos 6 Templates Oficiais de Demonstração
  const demoTemplate = resolveTemplateBySlug(slug);
  if (demoTemplate) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black flex flex-col select-none">
        {/* Barra superior discreta oficial de modo demonstração */}
        <header className="bg-[#0e121a] border-b border-white/[0.08] px-4 py-2.5 text-xs flex items-center justify-between shrink-0 shadow-lg z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex items-center gap-1.5 shrink-0 hover:opacity-90 transition">
              <span className="font-extrabold text-sm tracking-tight text-white font-heading">
                Web<span className="text-[#7abf18]">billy</span>
              </span>
            </Link>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="px-2 py-0.5 rounded-full bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] font-bold text-[10px] uppercase tracking-wider shrink-0">
              Modo Demonstração
            </span>
            <span className="text-zinc-300 text-xs hidden md:inline truncate">
              Modelo: <strong className="text-white">{demoTemplate.name}</strong> ({demoTemplate.title})
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-zinc-400 text-xs hidden sm:inline">
              Por apenas <strong className="text-[#7abf18] font-mono">R$ 29,90/mês</strong>
            </span>
            <a
              href={`https://webbilly.com.br/#demonstracao?modelo=${encodeURIComponent(demoTemplate.name)}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#7abf18] hover:bg-[#68a414] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#7abf18]/25"
            >
              <span>Quero Este Modelo Para Mim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Template completo em tela cheia */}
        <iframe
          src={demoTemplate.demoPath}
          className="w-full flex-1 border-0 bg-black"
          title={demoTemplate.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  const site = await resolveSiteBySlug(slug);

  if (!site) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Subdomínio Não Encontrado</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          O subdomínio <code className="text-emerald-400 font-mono">{slug}.webbilly.com.br</code> ainda não possui um site publicado na plataforma.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  // Permite teste forçado via query param ?status=suspended ou ?status=active
  const status = (queryStatus === 'suspended' || queryStatus === 'active')
    ? queryStatus
    : site.status;

  const { clientName, deployedUrl, checkoutUrl, monthlyPrice } = site;

  // =========================================================================
  // CASO 1: SITE SUSPENSO OU CANCELADO (INADIMPLENTE OU CANCELADO)
  // =========================================================================
  if (status === 'suspended' || status === 'cancelled') {
    return (
      <div className="min-h-screen bg-[#090b10] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
        <div className="max-w-lg w-full bg-[#11141c] border border-zinc-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
          {/* Luz de fundo sutil */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Badge de status */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Site Temporariamente Indisponível</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {clientName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              O acesso a esta página está temporariamente suspenso para manutenção e renovação do plano.
            </p>
          </div>

          {/* Card com detalhes da assinatura */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-left space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Subdomínio Oficial:</span>
              <span className="font-mono text-zinc-200 font-bold">{slug}.webbilly.com.br</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Assinatura Mensal:</span>
              <span className="font-mono text-emerald-400 font-extrabold text-sm">
                R$ {monthlyPrice ? monthlyPrice.toFixed(2).replace('.', ',') : '29,90'}/mês
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reativação automática imediata após confirmação via Pix ou Cartão.</span>
            </div>
          </div>

          {/* Botão de Regularização via Asaas */}
          <div className="space-y-3 pt-2">
            <a
              href={checkoutUrl}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm sm:text-base transform hover:-translate-y-0.5"
            >
              <CreditCard className="w-5 h-5" />
              <span>Regularizar Assinatura (R$ 29,90)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20minha%20assinatura%20do%20site"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Falar com o Suporte Billy Suite</span>
            </a>
          </div>

          <p className="text-[10px] text-zinc-600">
            Billy Suite Cloud • Tecnologia de Hospedagem Segura & Subdomínios Gerenciados
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASO 2: SITE ATIVO (RENDERIZAÇÃO NORMAL 100% LIMPA)
  // =========================================================================
  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex flex-col">
      {/* Se estiver com status pending, exibe uma barra discreta no topo */}
      {status === 'pending' && (
        <div className="bg-amber-600 text-black px-4 py-1.5 text-xs font-bold flex items-center justify-between shrink-0">
          <span>⚠️ Demonstração de site aguardando ativação da assinatura mensal de R$ 29,90.</span>
          <a
            href={checkoutUrl}
            className="px-3 py-0.5 rounded bg-black text-white hover:bg-zinc-800 transition text-[11px]"
          >
            Ativar Assinatura
          </a>
        </div>
      )}

      {/* Renderiza o site do cliente em tela cheia */}
      <iframe
        src={deployedUrl || `https://${slug}.vercel.app`}
        className="w-full h-full border-0 bg-white"
        title={`Site Oficial - ${clientName}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

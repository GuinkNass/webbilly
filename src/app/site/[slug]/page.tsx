import React from 'react';
import {
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageCircle,
  Mail,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { resolveSiteBySlug, sanitizeSlug, fetchCloudSuspendedSlugs, formatSlugToTitle } from '@/lib/site-storage';
import { resolveTemplateBySlug } from '@/lib/templates-data';
import { fetchSiteFromSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

  // 1. Consulta suspensão global em tempo real na nuvem
  const cloudSuspended = await fetchCloudSuspendedSlugs();
  const isDirectlySuspended = cloudSuspended.has(slug);

  // 2. Consulta o registro no Supabase (Fonte Única de Verdade) ou no Banco Principal
  const supabaseSite = await fetchSiteFromSupabase(slug);
  const site = supabaseSite || (await resolveSiteBySlug(slug));

  // 3. Se for um dos 6 Templates Oficiais de Demonstração (e não for um cliente cadastrado ou suspenso)
  if (!site && !isDirectlySuspended) {
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
  }

  if (!site && !isDirectlySuspended) {
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

  // 4. Regra de Renderização Única e Direta:
  // Edge Config (isDirectlySuspended) é a autoridade máxima em tempo real instantânea (< 50ms)
  const isSuspended = isDirectlySuspended || (site?.status === 'cancelled');

  const status = (queryStatus === 'suspended' || queryStatus === 'active')
    ? queryStatus
    : (isSuspended ? 'suspended' : (site?.status || 'active').toLowerCase());

  const clientName = site?.clientName || formatSlugToTitle(slug);
  const deployedUrl = site?.deployedUrl || `https://${slug}.vercel.app`;
  const checkoutUrl = site?.checkoutUrl || `/api/subscription/create-checkout?slug=${slug}`;

  // =========================================================================
  // CASO 1: SITE SUSPENSO OU CANCELADO (INADIMPLENTE OU CANCELADO)
  // =========================================================================
  if (status === 'suspended' || status === 'inactive' || status === 'paused' || status === 'cancelled') {
    const contactEmail = 'contato@webbilly.com.br';
    const emailSubject = encodeURIComponent(`Reativação de Site - ${clientName} (${slug}.webbilly.com.br)`);
    const emailBody = encodeURIComponent(
      `Olá equipe Webbilly,\n\nSou o proprietário do estabelecimento "${clientName}" (subdomínio: ${slug}.webbilly.com.br).\n\nIdentifiquei que meu site está fora do ar e gostaria de solicitar informações para regularização e reativação imediata da publicação.\n\nAguardo retorno!`
    );
    const mailtoUrl = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
    const whatsappUrl = `https://wa.me/5511943168939?text=${encodeURIComponent(
      `Olá! Sou o responsável pelo comércio "${clientName}" (${slug}.webbilly.com.br). Meu site consta como fora do ar e gostaria de regularizar a assinatura para reativação imediata.`
    )}`;

    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
        {/* Efeitos de luz no fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#7abf18]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-lg w-full bg-[#0e121a]/95 border border-zinc-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-md">
          {/* Logo discreta no topo */}
          <div className="flex items-center justify-center gap-1.5 pb-2">
            <span className="font-extrabold text-base tracking-tight text-white font-heading">
              Web<span className="text-[#7abf18]">billy</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-xs font-mono">Hospedagem & Presença Digital</span>
          </div>

          {/* Badge de status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Publicação Pausada</span>
          </div>

          {/* Título de impacto e identificação */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Este site está fora do ar.
            </h1>
            <p className="text-sm sm:text-base font-semibold text-zinc-300">
              {clientName}
            </p>
            <p className="text-xs text-zinc-400 font-mono bg-zinc-900/80 py-1 px-3 rounded-lg inline-block border border-zinc-800">
              {slug}.webbilly.com.br
            </p>
          </div>

          {/* Box de instrução ao dono do comércio */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-[#7abf18] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">Atenção ao Proprietário:</span>
                Caso você seja o dono deste comércio, entre em contato imediatamente com nossa administração para reativação do seu site através do e-mail:
                <a
                  href={mailtoUrl}
                  className="block mt-1.5 font-mono font-bold text-[#7abf18] hover:underline text-sm break-all"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3 pt-2">
            <a
              href={mailtoUrl}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-[#7abf18] hover:bg-[#68a414] transition shadow-lg shadow-[#7abf18]/25 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar E-mail para contato@webbilly.com.br</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Falar no WhatsApp Oficial (+55 11 94316-8939)</span>
            </a>

            {checkoutUrl && (
              <a
                href={checkoutUrl}
                className="w-full py-2.5 px-4 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1.5 hover:underline"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Regularizar Assinatura Online via Pix/Cartão</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
            Webbilly Plataforma de Presença Digital • Suporte Central 24h
          </div>
        </div>

        {/* Polling em tempo real ultra-reativo: ao reativar no painel admin, volta ao ar imediatamente */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function pollStatus() {
                  fetch('/api/public/site-status?slug=${encodeURIComponent(slug)}&t=' + Date.now(), { cache: 'no-store' })
                    .then(function(r) { return r.json(); })
                    .then(function(d) {
                      if (d && d.status === 'active') {
                        window.location.replace(window.location.pathname + '?status=active&_t=' + Date.now());
                      }
                    })
                    .catch(function() {});
                }
                var timer = setInterval(pollStatus, 1500);
                document.addEventListener('visibilitychange', function() {
                  if (document.visibilityState === 'visible') pollStatus();
                });
              })();
            `
          }}
        />
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

      {/* Polling em tempo real ultra-reativo: ao suspender no painel admin, o site sai do ar imediatamente */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function pollStatus() {
                fetch('/api/public/site-status?slug=${encodeURIComponent(slug)}&t=' + Date.now(), { cache: 'no-store' })
                  .then(function(r) { return r.json(); })
                  .then(function(d) {
                    if (d && d.status === 'suspended') {
                      var frame = document.querySelector('iframe');
                      if (frame) frame.style.display = 'none';
                      window.location.replace(window.location.pathname + '?status=suspended&_t=' + Date.now());
                    }
                  })
                  .catch(function() {});
              }
              var timer = setInterval(pollStatus, 1500);
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') pollStatus();
              });
            })();
          `
        }}
      />
    </div>
  );
}

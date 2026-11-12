'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Globe,
  Monitor,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { resolveTemplateBySlug } from '@/lib/templates-data';

export default function DemoPage() {
  const params = useParams();
  const leadToken = (params?.leadToken as string) || '';
  const demoTemplate = resolveTemplateBySlug(leadToken);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(Date.now());

  useEffect(() => {
    if (!leadToken) return;
    if (demoTemplate) {
      setData({
        title: demoTemplate.name,
        category: demoTemplate.categoryLabel,
        deployedUrl: demoTemplate.demoPath,
      });
      setLoading(false);
      return;
    }
    fetch(`/api/public/demo/${leadToken}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leadToken]);

  const clientName = data?.title || 'Estabelecimento Parceiro';
  const category = data?.category || 'Negócio Local';
  const deployedUrl = data?.deployedUrl || null;
  const proposalUrl = `/proposta/${leadToken}`;
  const briefingUrl = `/briefing/${leadToken}`;

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar Branded Billy Suite */}
      <header className="h-16 bg-[#0c1017]/95 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              B
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden md:inline">
              Web<span className="text-blue-500">Billy</span>
            </span>
          </Link>

          <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {clientName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 hidden sm:inline-block">
                {category}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
              Demonstração Oficial no domínio <strong className="text-zinc-300">webbilly.com.br</strong>
            </p>
          </div>
        </div>

        {/* Viewport Toggles & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Seletor Desktop / Mobile */}
          <div className="hidden md:flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                viewportMode === 'desktop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                viewportMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular</span>
            </button>
          </div>

          {/* Botão de Atualizar Preview */}
          {deployedUrl && (
            <button
              onClick={() => setIframeKey(Date.now())}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Recarregar demonstração"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Link para Briefing / Ajustar Fotos */}
          <Link
            href={briefingUrl}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition border border-zinc-700/50"
          >
            <span>Personalizar Fotos</span>
          </Link>

          {/* Botão de Ação Principal: Aprovar e Ativar Proposta */}
          <Link
            href={proposalUrl}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
          >
            <span>Aprovar & Ativar Site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 relative bg-[#05070a] flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-zinc-400 font-mono text-sm">
            <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Carregando demonstração interativa...</span>
          </div>
        ) : deployedUrl ? (
          viewportMode === 'desktop' ? (
            <iframe
              key={iframeKey}
              src={deployedUrl}
              className="w-full h-full border-0 bg-white"
              title={`Demonstração - ${clientName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="h-full py-4 flex items-center justify-center">
              {/* Moldura de Smartphone Ultra Realista */}
              <div className="w-[380px] h-[740px] max-h-[92vh] bg-zinc-900 border-4 border-zinc-700 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
                {/* Notch */}
                <div className="h-5 bg-zinc-950 flex items-center justify-center shrink-0">
                  <div className="w-20 h-3.5 bg-zinc-900 rounded-b-xl border-b border-x border-zinc-800"></div>
                </div>
                {/* Tela do Celular */}
                <iframe
                  key={iframeKey}
                  src={deployedUrl}
                  className="w-full flex-1 border-0 bg-white"
                  title={`Demonstração Mobile - ${clientName}`}
                />
                {/* Home Indicator */}
                <div className="h-4 bg-zinc-950 flex items-center justify-center shrink-0">
                  <div className="w-24 h-1 bg-zinc-600 rounded-full"></div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Estado onde o site ainda está sendo processado */
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-[#0c1017] border border-zinc-800 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{clientName}</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Demonstração reservada na plataforma WebBilly.
              </p>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O site demonstrativo deste estabelecimento está pronto para ser ativado. Você pode preencher o formulário com dados adicionais ou acessar a proposta oficial para liberar o domínio próprio.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href={briefingUrl}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              >
                Enviar Fotos e Dados
              </Link>
              <Link
                href={proposalUrl}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition"
              >
                Ver Proposta Oficial
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

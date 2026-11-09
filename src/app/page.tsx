'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Globe,
  Smartphone,
  MapPin,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  ExternalLink,
  Store,
  Scissors,
  UtensilsCrossed,
  Wrench,
  Briefcase,
  Layers,
  Clock,
  HeartHandshake,
  CheckCheck,
  ChevronRight,
  Lock,
  Star
} from 'lucide-react';

export default function B2BLandingPage() {
  const [formData, setFormData] = useState({
    responsibleName: '',
    businessName: '',
    whatsapp: '',
    cityState: '',
    niche: 'Geral'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewSlug, setPreviewSlug] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.whatsapp) {
      alert('Por favor, informe ao menos o nome do seu negócio e o WhatsApp.');
      return;
    }

    setLoading(true);

    const slug = formData.businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 32) || 'empresa';

    setPreviewSlug(slug);

    try {
      // Registra a solicitação de demonstração no backend
      await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `lead_web_${Date.now()}`,
          siteSlug: slug,
          clientName: formData.businessName,
          clientPhone: formData.whatsapp,
          operatorToken: 'ORGANIC_LANDING'
        })
      }).catch(() => {});

      // Dispara confetes comemorativos
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);

      // Prepara mensagem para redirecionamento imediato no WhatsApp
      const cleanPhone = formData.whatsapp.replace(/\D/g, '');
      const whatsMessage = encodeURIComponent(
        `Olá, equipe Webbilly! Gostaria de receber a demonstração do site profissional da minha empresa.\n\n` +
        `🏢 Negócio: ${formData.businessName}\n` +
        `👤 Responsável: ${formData.responsibleName || 'Não informado'}\n` +
        `📍 Cidade/UF: ${formData.cityState || 'Não informado'}\n` +
        `💼 Ramo: ${formData.niche}\n` +
        `👉 Subdomínio desejado: ${slug}.webbilly.com.br\n\n` +
        `Quero ver a demonstração funcionando no meu celular!`
      );

      // Redireciona para o WhatsApp de atendimento (número oficial Webbilly ou telefone fornecido)
      setTimeout(() => {
        const supportPhone = '5511999999999';
        window.open(`https://wa.me/${supportPhone}?text=${whatsMessage}`, '_blank');
      }, 1200);

    } catch (err) {
      console.error('Erro ao processar solicitação:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 selection:bg-violet-600 selection:text-white flex flex-col font-sans">
      
      {/* =========================================================================
          1. HEADER MINIMALISTA
         ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0c10]/80 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Identificador B2B */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30 border border-violet-400/30 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block">
                Webbilly
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider block -mt-0.5">
                Sites Profissionais para Negócios Locais
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#como-funciona" className="hover:text-white transition">
              Como Funciona
            </a>
            <a href="#nichos" className="hover:text-white transition">
              Nichos Atendidos
            </a>
            <a href="#preco" className="hover:text-white transition">
              Preço & Benefícios
            </a>
            <a href="#demonstracao" className="hover:text-white transition">
              Solicitar Demonstração
            </a>
          </nav>

          {/* CTA de Contato Direto */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20a%20cria%C3%A7%C3%A3o%20de%20site%20para%20o%20meu%20neg%C3%B3cio."
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Falar no WhatsApp</span>
            </a>

            <a
              href="#demonstracao"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <span>Ver Minha Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (CLAREZA BRUTAL DA OFERTA)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/[0.08]">
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Badge Técnico */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Tecnologia para Comércio Local • Sem Taxa de Adesão</span>
          </div>

          {/* Título Principal de Impacto */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            Seu comércio com{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              site profissional no ar
            </span>{' '}
            por apenas R$ 29,90 por mês.
          </h1>

          {/* Subtítulo Sóbrio e Focado na Dor */}
          <p className="text-sm sm:text-lg text-zinc-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            Chega de perder clientes no Google e no Instagram porque seu negócio não tem uma página na web. Criamos sua landing page completa, adaptada para celular e hospedada com segurança no nosso subdomínio oficial.
          </p>

          {/* CTAs de Ação Imediata */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demonstracao"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 transition shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2"
            >
              <span>Solicitar Demonstração do Meu Negócio</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://webbilly.com.br/site/caoqripetshop"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-zinc-300 hover:text-white bg-[#131720] hover:bg-zinc-800 border border-white/[0.08] transition flex items-center justify-center gap-2"
            >
              <span>Ver Exemplo Real ao Vivo</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* Dock de Garantias (4 Pilares) */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            
            <div className="p-4 rounded-2xl bg-[#131720]/80 border border-white/[0.08] backdrop-blur-md">
              <span className="text-emerald-400 text-lg sm:text-xl font-black font-mono block">
                R$ 29,90/mês
              </span>
              <span className="text-xs text-white font-semibold mt-0.5 block">
                Preço Único & Fixo
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Sem custos extras, surpresas ou taxas de implantação.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#131720]/80 border border-white/[0.08] backdrop-blur-md">
              <span className="text-sky-400 text-lg sm:text-xl font-black block">
                Hospedagem Inclusa
              </span>
              <span className="text-xs text-white font-semibold mt-0.5 block">
                Subdomínio Oficial
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                <code className="text-sky-300">seu-nome.webbilly.com.br</code> com SSL seguro ativado.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#131720]/80 border border-white/[0.08] backdrop-blur-md">
              <span className="text-indigo-400 text-lg sm:text-xl font-black block">
                100% Celular
              </span>
              <span className="text-xs text-white font-semibold mt-0.5 block">
                Mobile-First
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Botão direto de WhatsApp e rota GPS para seu endereço.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#131720]/80 border border-white/[0.08] backdrop-blur-md">
              <span className="text-violet-400 text-lg sm:text-xl font-black block">
                Sem Fidelidade
              </span>
              <span className="text-xs text-white font-semibold mt-0.5 block">
                Cancele Quando Quiser
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Liberdade total sem contratos burocráticos ou multas.
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. COMO FUNCIONA (3 ETAPAS TRANSPARENTES)
         ========================================================================= */}
      <section id="como-funciona" className="py-16 sm:py-24 border-b border-white/[0.08] bg-[#0c0e14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-bold block mb-2">
              Processo Simples & Sem Fricção
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Como funciona para ter seu site no ar
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Você não precisa entender de código, servidores ou contratação de domínios. Nossa equipe cuida de toda a parte técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Passo 1 */}
            <div className="p-6 rounded-2xl bg-[#131720] border border-white/[0.08] relative group hover:border-violet-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 font-black flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Montagem Rápida
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nós estruturamos a página com as fotos, endereço, cardápio ou lista de serviços e o botão direto para o WhatsApp do seu comércio.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="p-6 rounded-2xl bg-[#131720] border border-white/[0.08] relative group hover:border-indigo-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-black flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Demonstração Sem Compromisso
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Você recebe o link no seu celular (<code className="text-indigo-300">seunegocio.webbilly.com.br</code>) e visualiza o resultado funcionando antes de assinar.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="p-6 rounded-2xl bg-[#131720] border border-white/[0.08] relative group hover:border-emerald-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Ativação Mensal
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Se gostar, ativa a assinatura por apenas R$ 29,90/mês via Pix ou Cartão e mantém sua presença online ativa 24 horas por dia.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. NICHOS ATENDIDOS (GRID VISUAL LIMPO)
         ========================================================================= */}
      <section id="nichos" className="py-16 sm:py-24 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-2">
              Especialistas em Negócios Locais
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Projetado para quem vende no bairro e na cidade
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Modelos otimizados para alta conversão e contato instantâneo pelo WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Nicho 1: Pet Shops */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-emerald-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">🐾</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Pet Shops & Clínicas Veterinárias
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Apresente serviços de banho e tosa, agendamento de consultas veterinárias, pacotes de estética animal e localização no mapa.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">caoqri.webbilly.com.br</span>
              </div>
            </div>

            {/* Nicho 2: Barbearias & Salões */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-violet-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">✂️</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Barbearias & Salões de Beleza
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Portfólio visual com fotos de cortes, procedimentos estéticos, horários de atendimento e botão de marcação de hora.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-violet-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">barbeariavintage.webbilly.com.br</span>
              </div>
            </div>

            {/* Nicho 3: Bares & Restaurantes */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-amber-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">🍔</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Bares, Restaurantes & Pizzarias
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cardápio digital limpo e visual para celular, botão de pedidos direct e mapa com rota GPS para clientes chegarem à sua mesa.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-amber-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">hamburgueria.webbilly.com.br</span>
              </div>
            </div>

            {/* Nicho 4: Oficinas & Autoescolas */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-sky-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">🚗</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Oficinas Mecânicas & Autoescolas
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Serviços de revisão mecânica, funilaria, pneus, ou matrículas de CNH A/B com formulário rápido de orçamento.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-sky-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">autoescola.webbilly.com.br</span>
              </div>
            </div>

            {/* Nicho 5: Consultórios & Escritórios */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-indigo-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Consultórios & Prestadores Locais
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dentistas, psicólogos, contadores e advogados. Transmita autoridade, credenciais profissionais e facilidade de contato.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-indigo-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">consultoria.webbilly.com.br</span>
              </div>
            </div>

            {/* Nicho 6: Lojas & Comércio em Geral */}
            <div className="p-5 rounded-2xl bg-[#131720] border border-white/[0.08] hover:border-teal-500/30 transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">🛍️</div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Comércio & Prestadores em Geral
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Se você atende clientes na sua cidade, precisa de uma presença profissional no ar para ser encontrado no Google.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-teal-400 flex items-center gap-1 font-semibold">
                <span>Exemplo:</span>
                <span className="text-zinc-300">seunegocio.webbilly.com.br</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. BLOCO DE PREÇO ÚNICO E TRANSPARENTE
         ========================================================================= */}
      <section id="preco" className="py-16 sm:py-24 border-b border-white/[0.08] bg-[#0c0e14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-bold block mb-2">
              Sem Pegadinhas • Sem Taxa de Adesão
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Um plano único. Tudo incluso.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Chega de pagar milhares de reais para agências. Tenha seu site oficial funcionando por menos de R$ 1,00 por dia.
            </p>
          </div>

          {/* Card Principal de Preço */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#151923] to-[#10131a] border-2 border-violet-500/40 shadow-2xl shadow-violet-600/10 relative overflow-hidden">
            
            {/* Tag no Topo */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Plano Presença Digital Completa</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Presença Oficial na Web
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Landing page moderna, responsiva e pronta para vender.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-base text-zinc-400 font-semibold">R$</span>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                    29,90
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">/ mês</span>
                </div>
                <span className="text-[11px] text-zinc-400 block font-mono">
                  sem taxa de adesão • cancele quando quiser
                </span>
              </div>
            </div>

            {/* Checklist de Itens Inclusos */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
              
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Subdomínio Oficial Exclusivo:</strong>
                  <span><code className="text-sky-300 font-mono">seunegocio.webbilly.com.br</code> pronto para divulgar.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Botão de WhatsApp Integrado:</strong>
                  <span>O cliente clica e já cai conversando diretamente com você.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Google Maps & Rota GPS:</strong>
                  <span>Localização exata com botão para abrir rota no Waze e Google Maps.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Galeria de Fotos & Cardápio/Serviços:</strong>
                  <span>Exposição profissional dos seus produtos e preços.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Hospedagem & Certificado SSL:</strong>
                  <span>Site 100% seguro (HTTPS) com velocidade ultra rápida.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Suporte para Alterações:</strong>
                  <span>Atualize seus horários, telefone ou fotos sempre que precisar.</span>
                </div>
              </div>

            </div>

            {/* Botão de Chamada para Ação */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-400">
                Gere uma demonstração sem pagar nada antes de aprovar.
              </span>
              <a
                href="#demonstracao"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
              >
                <span>Solicitar Demonstração</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. FORMULÁRIO SIMPLIFICADO DE CONTATO / SOLICITAÇÃO
         ========================================================================= */}
      <section id="demonstracao" className="py-16 sm:py-24 border-b border-white/[0.08] relative">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-2">
              Inicie Sem Compromisso
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Solicite a demonstração do seu site
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Preencha os dados básicos do seu negócio. Nossa equipe monta a versão inicial e envia o link no seu celular.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#131720] border border-white/[0.08] shadow-2xl relative">
            
            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Solicitação Recebida com Sucesso!
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                  Preparamos sua demonstração no subdomínio:
                  <code className="block font-mono text-emerald-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 my-2 text-xs font-bold">
                    https://{previewSlug}.webbilly.com.br
                  </code>
                  Estamos redirecionando para o WhatsApp oficial de atendimento para você conferir a página imediatamente.
                </p>

                <a
                  href={`https://wa.me/5511999999999?text=Ol%C3%A1!%20Enviei%20a%20solicita%C3%A7%C3%A3o%20do%20site%20${formData.businessName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 mt-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir Conversa no WhatsApp</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome da Empresa / Negócio *
                  </label>
                  <input
                    type="text"
                    required
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Ex: Pet Shop Cão Q-Ri, Barbearia Estilo..."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nome do Responsável
                    </label>
                    <input
                      type="text"
                      name="responsibleName"
                      value={formData.responsibleName}
                      onChange={handleInputChange}
                      placeholder="Ex: Carlos Silva"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="text"
                      required
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Cidade / Estado
                    </label>
                    <input
                      type="text"
                      name="cityState"
                      value={formData.cityState}
                      onChange={handleInputChange}
                      placeholder="Ex: Campinas / SP"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Ramo de Atuação
                    </label>
                    <select
                      name="niche"
                      value={formData.niche}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500"
                    >
                      <option value="Pet Shop & Veterinária">🐾 Pet Shop & Veterinária</option>
                      <option value="Barbearia & Salão">✂️ Barbearia & Salão</option>
                      <option value="Restaurante & Gastronomia">🍔 Restaurante & Gastronomia</option>
                      <option value="Oficina & Automotivo">🚗 Oficina & Automotivo</option>
                      <option value="Saúde & Consultório">⚖️ Saúde & Consultório</option>
                      <option value="Comércio Local Geral">🛍️ Comércio Local Geral</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-violet-600 hover:bg-violet-500 transition shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Gerando Demonstração...</span>
                      </>
                    ) : (
                      <>
                        <span>Solicitar Demonstração Gratuita</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Sem cartão de crédito no cadastro • Visualize antes de assinar
                  </span>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FOOTER CORPORATIVO SÓBRIO
         ========================================================================= */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#07090d] py-10 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">Webbilly</span>
                <span className="text-[11px] text-zinc-400">Presença digital sob medida para comércios locais</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium">
              <a href="#como-funciona" className="hover:text-white transition">
                Como Funciona
              </a>
              <a href="#nichos" className="hover:text-white transition">
                Nichos
              </a>
              <a href="#preco" className="hover:text-white transition">
                Preço
              </a>
              <a href="#demonstracao" className="hover:text-white transition">
                Demonstração
              </a>
            </div>

            {/* Links Discretos de Acesso do Sistema */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
              <Link href="/operador" className="hover:text-violet-400 transition flex items-center gap-1">
                <span>Área do Operador</span>
              </Link>
              <span>•</span>
              <Link href="/admin" className="hover:text-emerald-400 transition flex items-center gap-1">
                <span>Admin Master</span>
              </Link>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-zinc-400">
            <div>
              © 2026 Webbilly. Todos os direitos reservados.
            </div>
            <div>
              Tecnologia de publicação instantânea para o comércio brasileiro.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

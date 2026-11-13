'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
// TrabalheAquiForm migrado para /trabalheconosco/candidatura
import ContatoForm from '@/components/ContatoForm';
import { OFFICIAL_TEMPLATES } from '@/lib/templates-data';
import {
  Globe,
  Smartphone,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Store,
  Scissors,
  UtensilsCrossed,
  Wrench,
  Clock,
  ChevronRight,
  Lock,
  Star,
  Users,
  Award,
  Layers,
  HelpCircle,
  CheckCheck
} from 'lucide-react';

export default function WebbillyHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    responsibleName: '',
    businessName: '',
    whatsapp: '',
    cityState: '',
    niche: 'Geral',
    instagramOuMaps: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewSlug, setPreviewSlug] = useState('');
  const [activeNicheTab, setActiveNicheTab] = useState('todos');

  // Estados para Formulário de Candidatura de Operador (Lark SMTP)
  const [operatorFormData, setOperatorFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    cityState: '',
    instagram: '',
    experience: '',
    pixType: 'cpf',
    pixKey: ''
  });
  const [operatorLoading, setOperatorLoading] = useState(false);
  const [operatorSubmitted, setOperatorSubmitted] = useState(false);
  const [operatorError, setOperatorError] = useState<string | null>(null);

  const handleOperatorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOperatorFormData({ ...operatorFormData, [e.target.name]: e.target.value });
  };

  const handleOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorFormData.name || !operatorFormData.whatsapp || !operatorFormData.email) {
      alert('Por favor, informe ao menos Nome, WhatsApp e E-mail.');
      return;
    }
    setOperatorLoading(true);
    setOperatorError(null);
    try {
      const res = await fetch('/api/operators/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operatorFormData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao submeter candidatura.');
      }
      setOperatorSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setOperatorError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setOperatorLoading(false);
    }
  };

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
      // 1. Disparo de e-mail via Lark Suite SMTP para demo@webbilly.com.br
      await fetch('/api/demonstracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          whatsapp: formData.whatsapp,
          responsibleName: formData.responsibleName,
          cityState: formData.cityState,
          niche: formData.niche,
          instagramOuMaps: formData.instagramOuMaps,
        })
      }).catch((e) => console.warn('Aviso no envio de demo:', e));

      // 2. Registro de lead/assinatura orgânica
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

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);

      const whatsMessage = encodeURIComponent(
        `Olá, equipe Webbilly! Tudo bem?\n\n` +
        `Gostaria de receber a demonstração do site oficial da minha empresa:\n\n` +
        `Empresa: ${formData.businessName}\n` +
        `Responsável: ${formData.responsibleName || 'Não informado'}\n` +
        `Cidade/UF: ${formData.cityState || 'Não informado'}\n` +
        `Segmento: ${formData.niche}\n` +
        `Subdomínio pretendido: ${slug}.webbilly.com.br\n\n` +
        `Aguardo o contato com a prévia no meu WhatsApp!`
      );

      setTimeout(() => {
        window.open(`https://wa.me/5511943168939?text=${whatsMessage}`, '_blank');
      }, 1200);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = activeNicheTab === 'todos' 
    ? OFFICIAL_TEMPLATES 
    : OFFICIAL_TEMPLATES.filter(t => t.niche === activeNicheTab);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#7abf18] selection:text-white">
      
      {/* =====================================================================
          1. TOP INFO BAR (Inspirada em eco_top_info_wrapper)
         ===================================================================== */}
      <div className="bg-[#0e121a] border-b border-white/[0.06] text-xs text-zinc-400 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#7abf18] animate-pulse inline-block" />
              <strong className="text-white">Webbilly:</strong> Sites Profissionais para Negócios Locais
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-[#7abf18]" />
              Pronto no ar em minutos
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://wa.me/5511943168939"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#7abf18] transition flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-[#7abf18]" />
              Atendimento WhatsApp
            </a>
            <span className="text-zinc-700">|</span>
            <Link
              href="/operador"
              className="text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-[#7abf18]" />
              Área do Operador
            </Link>
            <span className="text-zinc-700">|</span>
            <Link
              href="/admin"
              className="text-zinc-500 hover:text-zinc-300 transition"
            >
              Admin Master
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. NAVBAR PRINCIPAL (Inspirada em eco_banner_box & navbar)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0f141d]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo da Marca */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <img
              src="/billy-logo.png"
              alt="Webbilly"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <div>
              <span className="text-2xl sm:text-[26px] font-black tracking-tight text-white font-heading block leading-none">
                Web<span className="text-[#7abf18]">billy</span>
              </span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest block font-sans mt-1">
                Presença Web Recorrente
              </span>
            </div>
          </Link>

          {/* Links de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <a href="#inicio" className="hover:text-[#7abf18] transition text-[#7abf18]">Início</a>
            <a href="#sobre" className="hover:text-[#7abf18] transition">Sobre</a>
            <a href="#servicos" className="hover:text-[#7abf18] transition">Serviços</a>
            <a href="#vantagens" className="hover:text-[#7abf18] transition">Vantagens</a>
            <a href="#modelos" className="hover:text-[#7abf18] transition">Modelos</a>
            <a href="#trabalhe-aqui" className="hover:text-[#7abf18] transition font-bold text-emerald-400">Trabalhe Aqui</a>
            <a href="#faq" className="hover:text-[#7abf18] transition">Dúvidas</a>
            <a href="#contato" className="hover:text-[#7abf18] transition text-zinc-300">SAC / Contato</a>
          </nav>

          {/* CTA Header */}
          <div className="flex items-center gap-3">
            <a
              href="#demonstracao"
              className="eco-btn-primary text-xs py-2.5 px-5 hidden sm:inline-flex"
            >
              <span>Solicitar Demonstração</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Botão Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-current rounded" />
                <span className="w-full h-0.5 bg-current rounded" />
                <span className="w-full h-0.5 bg-current rounded" />
              </div>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-zinc-800 mt-3 space-y-2 text-sm font-semibold uppercase">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-[#7abf18]">Início</a>
            <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-zinc-300">Sobre</a>
            <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-zinc-300">Serviços</a>
            <a href="#vantagens" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-zinc-300">Vantagens</a>
            <a href="#modelos" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-zinc-300">Modelos</a>
            <a href="#trabalhe-aqui" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-emerald-400 font-bold">Trabalhe Aqui</a>
            <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-zinc-300">SAC & Atendimento</a>
            <a href="#demonstracao" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#7abf18] font-bold">Solicitar Demonstração →</a>
          </div>
        )}
      </header>

      {/* =====================================================================
          3. HERO SECTION (Banner com estilo eco_banner_wrapper & slider)
         ===================================================================== */}
      <section id="inicio" className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-8 overflow-hidden bg-[#0b0e14]">
        
        {/* VÍDEO CINEMATOGRÁFICO DE FUNDO (444.mp4 - "Create a Website") */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/video-poster.jpg"
            className="w-full h-full object-cover opacity-35 md:opacity-40 scale-105 filter brightness-90 contrast-110"
          >
            <source src="/videos/bg-hero.mp4" type="video/mp4" />
            <source src="/videos/444.mp4" type="video/mp4" />
          </video>
          {/* Gradients de mesclagem para contraste premium e legibilidade impecável */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/90 via-[#0b0e14]/65 to-[#0b0e14]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0b0e14]/50 to-[#0b0e14]" />
        </div>

        {/* Glows decorativos de fundo */}
        <div className="absolute w-[500px] h-[500px] bg-[#7abf18]/10 rounded-full blur-[140px] pointer-events-none -top-20 left-1/2 -translate-x-1/2 z-[1]" />
        <div className="absolute w-80 h-80 bg-[#20ce6d]/10 rounded-full blur-[100px] pointer-events-none bottom-0 right-10 z-[1]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Badge Técnico */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tecnologia para Comércio Local • Sem Taxa de Adesão</span>
          </div>

          {/* Título Principal em Roboto Slab */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-heading leading-tight md:leading-[1.15]">
            Seu comércio com site profissional no ar por apenas{' '}
            <span className="text-[#7abf18]">R$ 29,90 por mês</span>.
          </h1>

          {/* Divisor Ornamental Oficial do Template (border.png) */}
          <div className="my-4 flex justify-center">
            <img
              src="/images/border.png"
              alt="Webbilly Separator"
              className="eco-border-divider"
            />
          </div>

          {/* Subtítulo em Open Sans */}
          <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Chega de perder clientes no Google e no Instagram porque seu negócio não tem uma página na web. Criamos sua landing page completa, adaptada para celular e hospedada com segurança no nosso subdomínio oficial.
          </p>

          {/* Botões de Ação */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demonstracao"
              className="eco-btn-primary text-sm py-4 px-8 w-full sm:w-auto shadow-xl"
            >
              <span>Solicitar Demonstração do Meu Negócio</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#modelos"
              className="eco-btn-outline text-sm py-3.5 px-7 w-full sm:w-auto"
            >
              <span>Ver Modelos Prontos</span>
            </a>
          </div>

          {/* Dock de Garantias do SaaS */}
          <div className="mt-12 pt-8 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7abf18]/15 text-[#7abf18] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 font-bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">R$ 29,90 / mês</span>
                <span className="text-[11px] text-zinc-400">Preço fixo e transparente</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7abf18]/15 text-[#7abf18] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Subdomínio Oficial</span>
                <span className="text-[11px] text-zinc-400">slug.webbilly.com.br</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7abf18]/15 text-[#7abf18] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Pronto em Minutos</span>
                <span className="text-[11px] text-zinc-400">Sem burocracias de DNS</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7abf18]/15 text-[#7abf18] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Sem Fidelidade</span>
                <span className="text-[11px] text-zinc-400">Cancele quando quiser</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. FORMULÁRIO DE DEMONSTRAÇÃO INTERATIVO (Gere seu site na hora)
         ===================================================================== */}
      <section id="demonstracao" className="py-16 px-4 sm:px-8 bg-[#0e131d] border-y border-white/[0.06] relative">
        <div className="max-w-3xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-2xl sm:text-3xl font-bold text-white eco-heading-title">
              Peça Uma Demonstração Gratuita Para a Sua Empresa
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Informe os dados básicos do seu negócio e veja como seu site ficará na internet.
            </p>
          </div>

          <div className="bg-[#141b27] border border-white/[0.09] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#7abf18]/20 text-[#7abf18] flex items-center justify-center mx-auto border border-[#7abf18]/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Demonstração Solicitada com Sucesso!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Seu subdomínio reservado:{' '}
                  <strong className="text-[#7abf18] font-mono">{previewSlug}.webbilly.com.br</strong>
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/5511943168939?text=${encodeURIComponent('Olá! Acabei de pedir a demonstração do meu negócio: ' + formData.businessName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eco-btn-primary text-sm py-3 px-6"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir Atendimento no WhatsApp Agora
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nome do Negócio / Empresa *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="Ex: Barbearia Silva, Hamburgueria Gourmet"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#7abf18]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      WhatsApp com DDD (Para Envio da Amostra) *
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#7abf18]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Seu Nome (Responsável)
                    </label>
                    <input
                      type="text"
                      name="responsibleName"
                      placeholder="Ex: Carlos Oliveira"
                      value={formData.responsibleName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#7abf18]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Cidade e Estado (UF)
                    </label>
                    <input
                      type="text"
                      name="cityState"
                      placeholder="Ex: Campinas - SP"
                      value={formData.cityState}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#7abf18]"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#7abf18]"
                    >
                      <option value="Geral">Comércio em Geral</option>
                      <option value="Barbearia">Barbearia / Salão</option>
                      <option value="Gastronomia">Hamburgueria / Restaurante</option>
                      <option value="Saude">Clínica / Dentista / Saúde</option>
                      <option value="Pet">Pet Shop / Veterinária</option>
                      <option value="Oficina">Oficina / Autoescola</option>
                      <option value="Outros">Prestador de Serviços</option>
                    </select>
                  </div>
                </div>

                {/* Prévia do subdomínio em tempo real */}
                {formData.businessName && (
                  <div className="p-3 rounded-xl bg-[#7abf18]/10 border border-[#7abf18]/20 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Seu endereço na web será:</span>
                    <span className="font-mono font-bold text-[#7abf18]">
                      {formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'suaempresa'}.webbilly.com.br
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full eco-btn-primary py-3.5 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Gerando Demonstração...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Gerar Demonstração Gratuita do Meu Site</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SEÇÃO SOBRE (Inspirada em eco_about_wrapper)
         ===================================================================== */}
      <section id="sobre" className="py-20 px-4 sm:px-8 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7abf18]/15 border border-[#7abf18]/25 text-[#7abf18] text-xs font-bold uppercase tracking-wider">
                <span>Presença Digital Simplificada</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight">
                Seu negócio merece mais do que apenas uma bio no Instagram.
              </h2>
              <img src="/images/border.png" alt="Border" className="h-4 opacity-90" />

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Grande parte dos seus clientes busca pelo seu serviço no Google antes de entrar em contato. Quando você não possui uma página oficial, você passa menos credibilidade e perde vendas para os concorrentes da sua rua ou bairro.
              </p>

              <p className="text-zinc-400 text-sm leading-relaxed">
                A <strong>Webbilly</strong> nasceu para resolver isso sem que você precise desembolsar milhares de reais em agências caras ou perder semanas configurando servidores e códigos difíceis. Nós cuidamos de todo o processo técnico.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#7abf18]/20 text-[#7abf18] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-xs text-zinc-300">Carregamento instantâneo em qualquer 3G/4G/5G</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#7abf18]/20 text-[#7abf18] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-xs text-zinc-300">Botão flutuante de WhatsApp configurado</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#7abf18]/20 text-[#7abf18] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-xs text-zinc-300">Cardápio, catálogo ou tabela de serviços</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#7abf18]/20 text-[#7abf18] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-xs text-zinc-300">Endereço no Google Maps integrado</span>
                </div>
              </div>

              <div className="pt-2">
                <a href="#demonstracao" className="eco-btn-primary text-xs py-3 px-6">
                  Começar Agora por R$ 29,90/mês
                </a>
              </div>
            </div>

            {/* GIF Presença Digital Simplificada com fundo transparente */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none flex justify-center items-center">
              <img
                src="/images/presenca-digital-simplificada.gif"
                alt="Presença Digital Simplificada - Demonstração no Celular"
                className="w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(122,191,24,0.22)] select-none pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          6. SEÇÃO SERVIÇOS (Inspirada em eco_service_wrapper & eco_service_box)
         ===================================================================== */}
      <section id="servicos" className="py-20 px-4 sm:px-8 bg-[#0e131d] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-3xl sm:text-4xl font-bold text-white eco-heading-title">
              O Que Está Incluso na Sua Assinatura
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Tudo o que seu negócio precisa para transmitir confiança aos clientes da sua cidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            
            {/* Serviço 1 */}
            <div className="eco-service-box">
              <div className="eco-service-icon">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2">
                Landing Page Ultra Rápida
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Carregamento leve adaptado para smartphones. Seus clientes encontram serviços, preços e contatos sem lentidão.
              </p>
            </div>

            {/* Serviço 2 */}
            <div className="eco-service-box">
              <div className="eco-service-icon">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2">
                Botão Direto de WhatsApp
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                O cliente clica e já cai diretamente na conversa com você no WhatsApp com mensagem personalizada pré-definida.
              </p>
            </div>

            {/* Serviço 3 */}
            <div className="eco-service-box">
              <div className="eco-service-icon">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2">
                Subdomínio Oficial Seguro
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seu endereço oficial <code className="text-[#7abf18]">seunome.webbilly.com.br</code> com certificado SSL grátis e hospedagem na nuvem.
              </p>
            </div>

            {/* Serviço 4 */}
            <div className="eco-service-box">
              <div className="eco-service-icon">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2">
                Manutenção & Atualizações
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Precisou trocar fotos, preços ou horários? Nossa equipe e IA cuidam das modificações sem custos extras.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          7. BANNER CTA DE ALTA CONVERSÃO (Inspirado em eco_start_wrapper)
         ===================================================================== */}
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-r from-[#141b27] via-[#1a2536] to-[#141b27] border-y border-[#7abf18]/30 relative overflow-hidden text-center">
        {/* Vídeo de Fundo da Seção CTA */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        >
          <source src="/videos/fundo001.mp4" type="video/mp4" />
        </video>
        {/* Máscara/Overlay escuro com vinheta superior e inferior para suavizar bordas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D16] via-[#090D16]/65 to-[#090D16] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7abf18] block">
            Comece Hoje Mesmo Sem Riscos
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-heading leading-tight">
            Pronto Para Colocar Seu Comércio no Mapa Digital?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
            Por apenas R$ 29,90 por mês você garante presença profissional e não perde mais nenhuma venda pelo WhatsApp.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demonstracao" className="eco-btn-primary text-sm py-3.5 px-8 shadow-xl">
              Quero Minha Página Profissional Agora
            </a>
            <a
              href="https://wa.me/5511943168939"
              target="_blank"
              rel="noopener noreferrer"
              className="eco-btn-outline text-sm py-3 px-6"
            >
              <Phone className="w-4 h-4 text-[#7abf18]" />
              Falar com Atendente
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. SEÇÃO PILARES (Inspirada em eco_mission_wrapper)
         ===================================================================== */}
      <section id="vantagens" className="py-20 px-4 sm:px-8 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-3xl sm:text-4xl font-bold text-white eco-heading-title">
              Nossos Pilares & Vantagens
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Por que pequenos negócios escolhem a Webbilly ao invés de contratar agências caras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            
            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-heading">Foco Total no Usuário Mobile</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mais de 85% do tráfego local acontece no smartphone. Todas as páginas são projetadas primeiro para telas de celular com botões grandes e legíveis.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-heading">Zero Burocracia Técnica</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Você não precisa registrar CPF em cartórios digitais, nem mexer com servidores, DNS ou hospedagens lentas. Seu site já sobe ativo no subdomínio.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-heading">Identidade Visual do Seu Negócio</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Personalizamos cores, logo, fotos reais dos seus produtos ou do seu estabelecimento para transmitir profissionalismo de verdade.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-[#7abf18]/15 border border-[#7abf18]/30 text-[#7abf18] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-heading">Segurança e Hospedagem Inclusas</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Certificado SSL de segurança, proteção contra invasões e 99.8% de uptime garantido na nuvem de ponta da plataforma.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          9. CONTADORES DE IMPACTO (Inspirados em eco_counter_wrapper)
         ===================================================================== */}
      <section className="py-16 px-4 sm:px-8 bg-[#0e131d] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.06]">
              <span className="text-3xl sm:text-4xl font-black text-[#7abf18] font-heading block">
                +500
              </span>
              <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider mt-2 block">
                Sites Entregues
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Empresas e comércios atendidos</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.06]">
              <span className="text-3xl sm:text-4xl font-black text-[#7abf18] font-heading block">
                R$ 29,90
              </span>
              <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider mt-2 block">
                Mensalidade Fixa
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Sem pegadinhas ou cobranças extras</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.06]">
              <span className="text-3xl sm:text-4xl font-black text-[#7abf18] font-heading block">
                99.8%
              </span>
              <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider mt-2 block">
                Disponibilidade
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Seu site sempre online no ar</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.06]">
              <span className="text-3xl sm:text-4xl font-black text-[#7abf18] font-heading block">
                3 Minutos
              </span>
              <span className="text-xs text-zinc-300 font-semibold uppercase tracking-wider mt-2 block">
                Para Solicitar
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Rápido, fácil e sem contratos longos</span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          10. MODELOS DISPONÍVEIS POR NICHO (Inspirado em eco_gallery_wrapper)
         ===================================================================== */}
      <section id="modelos" className="py-20 px-4 sm:px-8 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-3xl sm:text-4xl font-bold text-white eco-heading-title">
              Modelos de Sites para o Seu Segmento
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Estruturas prontas pensadas especificamente para o comportamento do consumidor local.
            </p>
          </div>

          {/* Filtros de Nicho */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveNicheTab('todos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'todos'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Todos os Modelos
            </button>
            <button
              onClick={() => setActiveNicheTab('barbearia')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'barbearia'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Barbearias
            </button>
            <button
              onClick={() => setActiveNicheTab('gastronomia')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'gastronomia'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Hamburguerias & Pubs
            </button>
            <button
              onClick={() => setActiveNicheTab('estetica')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'estetica'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Clínicas & Estética
            </button>
            <button
              onClick={() => setActiveNicheTab('pet')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'pet'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Pet Shop & Vet
            </button>
            <button
              onClick={() => setActiveNicheTab('consultoria')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'consultoria'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Consultorias & B2B
            </button>
            <button
              onClick={() => setActiveNicheTab('automotivo')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase ${
                activeNicheTab === 'automotivo'
                  ? 'bg-[#7abf18] text-white shadow-md shadow-[#7abf18]/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              Autoescolas & Oficinas
            </button>
          </div>

          {/* Grid de Modelos com Preview Real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredTemplates.map((t) => (
              <div
                key={t.slug}
                className="rounded-2xl bg-[#121722] border border-white/[0.08] overflow-hidden hover:border-[#7abf18] transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  {/* Preview Visual ao Vivo em Iframe Escalado */}
                  <div className="h-48 bg-[#080a0f] relative overflow-hidden border-b border-white/[0.08]">
                    <iframe
                      src={t.demoPath}
                      title={`Preview ${t.name}`}
                      className="w-[1200px] h-[800px] border-0 scale-[0.25] sm:scale-[0.27] origin-top-left pointer-events-none select-none bg-white opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121722] via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#7abf18] text-white shadow-md">
                        {t.tag}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-zinc-300 backdrop-blur-sm border border-white/10">
                        R$ 29,90/mês
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pb-0">
                    <span className="text-xs text-[#7abf18] font-bold block">{t.name}</span>
                    <h3 className="text-base font-bold text-white font-heading mt-0.5">{t.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2 min-h-[36px]">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-4 space-y-2">
                  <a
                    href={`https://${t.slug}.webbilly.com.br`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg bg-[#7abf18] hover:bg-[#6ca815] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-[#7abf18]/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visualizar Site Demo</span>
                  </a>

                  <a
                    href="#demonstracao"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, niche: t.title }));
                    }}
                    className="w-full py-2.5 rounded-lg border border-zinc-700 hover:border-[#7abf18] text-xs font-bold text-zinc-300 hover:text-white hover:bg-[#7abf18]/10 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Quero Este Modelo Para Mim</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7abf18]" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================================
          11. DEPOIMENTOS (Inspirado em eco_feedback_wrapper)
         ===================================================================== */}
      <section className="py-20 px-4 sm:px-8 bg-[#0e131d] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-3xl sm:text-4xl font-bold text-white eco-heading-title">
              O Que Dizem Nossos Clientes
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Comércios reais que transformaram sua presença na internet por apenas R$ 29,90/mês.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            
            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-[#7abf18]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                &ldquo;Antes da Webbilly eu não tinha site e meus clientes ficavam pedindo fotos e tabela no direct. Agora eles acessam o link direto na bio do Instagram e já mandam o pedido no WhatsApp. Vale cada centavo dos 29 reais.&rdquo;
              </p>
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold text-white block">Rodrigo Santos</span>
                <span className="text-[11px] text-zinc-400">Proprietário • Barber Shop Vintage</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-[#7abf18]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                &ldquo;Muito rápido e prático. Em menos de 2 horas minha clínica já estava com a página no ar com todos os tratamentos explicados e endereço no mapa. Não precisei quebrar a cabeça com nada.&rdquo;
              </p>
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold text-white block">Dra. Camila Alencar</span>
                <span className="text-[11px] text-zinc-400">Odontologia & Harmonização Facial</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121722] border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-[#7abf18]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                &ldquo;Já tinha orçado sites em agências que cobraram R$ 1.500,00 mais mensalidade cara. O modelo de R$ 29,90 da Webbilly resolveu 100% da minha necessidade de forma impecável.&rdquo;
              </p>
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold text-white block">Marcos Vinicius</span>
                <span className="text-[11px] text-zinc-400">Diretor • Petly Veterinária</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          11.5. TRABALHE AQUI (CHAMADA COMERCIAL OBJETIVA & LINK CANDIDATURA)
         ===================================================================== */}
      <section id="trabalhe-aqui" className="py-20 px-4 sm:px-8 bg-[#0a0d14] border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#84cc16]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oportunidade Comercial • Seja um Operador Parceiro</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Construa sua Renda Recorrente com a Webbilly
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Leve presença digital de alta conversão para estabelecimentos da sua cidade. Você prospecta, nosso robô IA gera o site em 45 segundos e você fatura comissões recorrentes todo mês.
            </p>
          </div>

          {/* Grid de Ganhos Objetivos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.08] space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Recorrência Mensal</div>
              <div className="text-2xl sm:text-3xl font-black text-[#84cc16] font-mono">R$ 10,00<span className="text-xs font-sans text-zinc-400">/mês</span></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Por cada assinatura ativa de R$ 29,90/mês mantida pelos clientes da sua carteira.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.08] space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Domínio Próprio</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">30% <span className="text-sm text-emerald-400">(R$ 147)</span></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Comissão direta em cada pacote de Domínio Próprio (.com.br) de R$ 490,00 vendido.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/[0.08] space-y-2">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gamificação & Afiliados</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">+20% <span className="text-sm text-zinc-400">& 5%</span></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bônus de +20% por promoção de medalhas (Bronze, Prata, Ouro, Rubi) e 5% sobre seus indicados.
              </p>
            </div>
          </div>

          {/* CTA Principal para a Página Dedicada */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/trabalheconosco/candidatura"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#84cc16] hover:bg-[#65a30d] transition flex items-center justify-center gap-2.5 shadow-xl shadow-[#84cc16]/25 cursor-pointer"
            >
              <span>Preencher Ficha de Candidatura</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contrato-operador"
              target="_blank"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-xs text-zinc-400 hover:text-white bg-[#11141c] hover:bg-white/[0.05] border border-white/[0.08] transition flex items-center justify-center gap-1.5"
            >
              <span>Consultar Termos do Contrato</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          12. PERGUNTAS FREQUENTES (FAQ)
         ===================================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-8 bg-[#0b0e14]">
        <div className="max-w-4xl mx-auto">
          
          <div className="eco-heading-wrapper">
            <h2 className="text-3xl sm:text-4xl font-bold text-white eco-heading-title">
              Perguntas Frequentes
            </h2>
            <img src="/images/border.png" alt="Border" className="eco-border-divider" />
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Tire todas as suas dúvidas sobre a assinatura e funcionamento do site.
            </p>
          </div>

          <div className="space-y-4 mt-10 text-left">
            <div className="p-5 rounded-xl bg-[#121722] border border-white/[0.08]">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7abf18]" />
                Preciso pagar para registrar um domínio .com.br?
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Você pode escolher entre duas opções simples: na <strong>Opção 1 (R$ 29,90/mês)</strong>, seu site funciona no subdomínio oficial (ex: <code className="text-[#7abf18]">seunegocio.webbilly.com.br</code>) com zero taxa de criação e até 2 alterações simples por mês inclusas. Na <strong>Opção 2 (R$ 490,00 pagamento único)</strong>, você tem o site completo no seu domínio próprio exclusivo por 1 ano inteiro, com renovação anual de apenas R$ 70,00/ano e atualizações avulsas sob demanda por R$ 29,90 (sem mensalidade obrigatória).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#121722] border border-white/[0.08]">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7abf18]" />
                Como funciona a cobrança dos R$ 29,90/mês?
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                A cobrança é realizada através de assinatura mensal no Mercado Pago (via Cartão de Crédito ou Pix Recorrente). Você só paga a primeira mensalidade quando seu site estiver pronto para ir ao ar.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#121722] border border-white/[0.08]">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7abf18]" />
                Existe contrato de fidelidade ou taxa de cancelamento?
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Nenhuma fidelidade. Você pode cancelar sua assinatura mensal a qualquer momento sem nenhuma multa ou complicação.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#121722] border border-white/[0.08]">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#7abf18]" />
                Como faço para atualizar preços, fotos ou telefone no futuro?
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                No plano mensal de R$ 29,90/mês você tem direito a até 2 alterações simples por mês já inclusas. No plano de domínio próprio (Opção 2 de R$ 490,00), as atualizações são avulsas sob demanda por R$ 29,90 por atualização, sem nenhuma mensalidade obrigatória. Basta enviar as alterações pelo nosso WhatsApp de atendimento.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          12.5. SAC & ATENDIMENTO COMERCIAL CENTRALIZADO (LARK SMTP)
         ===================================================================== */}
      <section id="contato" className="py-20 px-4 sm:px-8 bg-[#090b10] border-t border-white/[0.06] relative">
        <ContatoForm />
      </section>

      {/* =====================================================================
          13. FOOTER (Inspirado em eco_footer_wrapper & eco_bottom_footer)
         ===================================================================== */}
      <footer className="bg-[#090c12] border-t border-white/[0.08] text-zinc-400 pt-16 pb-12 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/billy-logo.png"
                alt="Webbilly"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl sm:text-2xl font-black text-white font-heading">
                Web<span className="text-[#7abf18]">billy</span>
              </span>
            </Link>
            <p className="text-zinc-500 leading-relaxed text-xs">
              A plataforma definitiva para colocar comércios e prestadores de serviços locais no ar com profissionalismo, rapidez e valor justo.
            </p>
            <div className="pt-2 text-[11px] text-zinc-400">
              <span className="text-[#7abf18] font-bold">● Status dos Servidores:</span> 100% Operacional
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#inicio" className="hover:text-[#7abf18] transition">Início</a></li>
              <li><a href="#sobre" className="hover:text-[#7abf18] transition">Como Funciona</a></li>
              <li><a href="#servicos" className="hover:text-[#7abf18] transition">O que Está Incluso</a></li>
              <li><a href="#modelos" className="hover:text-[#7abf18] transition">Modelos de Sites</a></li>
              <li><a href="#demonstracao" className="hover:text-[#7abf18] transition">Pedir Demonstração</a></li>
              <li><a href="#trabalhe-aqui" className="hover:text-[#7abf18] transition text-emerald-400 font-semibold">Trabalhe Aqui (Seja Operador)</a></li>
              <li><a href="#contato" className="hover:text-[#7abf18] transition text-zinc-300">SAC & Atendimento Direto</a></li>
            </ul>
          </div>

          {/* Coluna 3: Acesso Restrito & Suporte */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
              Acessos Oficiais
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/operador" className="hover:text-[#7abf18] transition flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#7abf18]" />
                  Painel do Operador Comercial
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#7abf18] transition flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#7abf18]" />
                  Acesso Administrativo Master
                </Link>
              </li>
              <li>
                <a
                  href="/downloads/Billy-Suite-Setup.exe"
                  className="hover:text-[#7abf18] transition flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3 text-[#7abf18]" />
                  Download Billy Suite Desktop
                </a>
              </li>
              <li className="pt-2 border-t border-white/[0.06]">
                <Link href="/termos" className="hover:text-white transition flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  Termos de Uso do Cliente
                </Link>
              </li>
              <li>
                <Link href="/contrato-operador" className="hover:text-white transition flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  Contrato de Parceria & NDA
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato & Canais Oficiais */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
              Canais de Atendimento
            </h4>
            <p className="text-zinc-500 text-xs">
              Fale diretamente com o setor responsável:
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              <a
                href="https://wa.me/5511943168939"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7abf18] transition flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#7abf18]" />
                WhatsApp: (11) 94316-8939
              </a>
              <a
                href="mailto:comercial@webbilly.com.br"
                className="hover:text-[#7abf18] transition flex items-center gap-2 text-zinc-400"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Comercial: <span className="text-zinc-300">comercial@webbilly.com.br</span></span>
              </a>
              <a
                href="mailto:operadores@webbilly.com.br"
                className="hover:text-[#7abf18] transition flex items-center gap-2 text-zinc-400"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operadores: <span className="text-zinc-300">operadores@webbilly.com.br</span></span>
              </a>
              <a
                href="mailto:demo@webbilly.com.br"
                className="hover:text-[#7abf18] transition flex items-center gap-2 text-zinc-400"
              >
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Demonstrações: <span className="text-zinc-300">demo@webbilly.com.br</span></span>
              </a>
              <a
                href="mailto:sac@webbilly.com.br"
                className="hover:text-[#7abf18] transition flex items-center gap-2 text-zinc-400"
              >
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>SAC & Suporte: <span className="text-zinc-300">sac@webbilly.com.br</span></span>
              </a>
              <a
                href="mailto:financeiro@webbilly.com.br"
                className="hover:text-[#7abf18] transition flex items-center gap-2 text-zinc-400"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Financeiro: <span className="text-zinc-300">financeiro@webbilly.com.br</span></span>
              </a>
            </div>
          </div>

        </div>

        {/* Rodapé inferior / Direitos */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Webbilly • Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-zinc-300 transition underline underline-offset-2">
              Termos de Uso
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/contrato-operador" className="hover:text-zinc-300 transition underline underline-offset-2">
              Contrato do Operador & NDA
            </Link>
          </div>
          <p className="flex items-center gap-1">
            Plataforma B2B para Negócios Locais • Hospedagem e Subdomínio Inclusos
          </p>
        </div>
      </footer>

    </div>
  );
}

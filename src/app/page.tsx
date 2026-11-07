'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Cpu,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Send,
  Building,
  UserCheck,
  FileText,
  Lock,
  Download,
  Flame,
  Award,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  X,
  Terminal,
  Activity,
  Check,
  Smartphone,
  Layers,
  ArrowUpRight,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Target,
  BarChart3,
  ShieldAlert,
  Globe,
  Sliders,
  CheckCheck
} from 'lucide-react';

export default function LandingPage() {
  // Calculadora interativa (Lógica e cálculos matemáticos 100% preservados)
  const [salesPerDay, setSalesPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const commissionPerSale = 200;
  const weeklySales = salesPerDay * daysPerWeek;
  const monthlySales = weeklySales * 4;
  const weeklyIncome = weeklySales * commissionPerSale;
  const monthlyIncome = monthlySales * commissionPerSale;
  const annualIncome = monthlyIncome * 12;

  // Formulário de candidatura (Lógica e campos 100% preservados)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    city: '',
    state: 'SP',
    pixType: 'cpf',
    pixKey: '',
    resumeUrl: '',
    experience: '',
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const formatWhatsApp = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, whatsapp: formatWhatsApp(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.termsAccepted) {
      setErrorMessage('Você deve aceitar os termos do Contrato de Parceria Autônoma para continuar.');
      return;
    }

    if (!formData.name || !formData.email || !formData.whatsapp || !formData.city || !formData.pixKey) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios marcados com asterisco (*).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao submeter inscrição.');
      }

      setSuccessMessage('Candidatura homologada com sucesso! O cadastro está com status PENDENTE de ativação. Nossa mesa de suporte enviará o retorno diretamente no seu WhatsApp.');
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Limpa formulário
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        city: '',
        state: 'SP',
        pixType: 'cpf',
        pixKey: '',
        resumeUrl: '',
        experience: '',
        termsAccepted: false
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* ========================================================= */}
      {/* 1. TOP-BAR EXECUTIVA (ESTILO CONSULTORIA FINANCEIRA F&O)  */}
      {/* ========================================================= */}
      <div className="bg-[#0b0f19] border-b border-white/[0.07] py-2 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Informações Institucionais F&O */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Rede Oficial de Operadores Comerciais • Ecossistema Billy Suite</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>contato@webbilly.com.br</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Repasse Fixo: R$ 200 líquidos / fechamento via Pix</span>
            </div>
          </div>

          {/* Atalhos Rápidos Corporativos */}
          <div className="flex items-center gap-4 text-[11px]">
            <Link
              href="/operador/login"
              className="text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <span>Portal do Operador</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/admin/login"
              className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
            >
              <span>Acesso Master</span>
              <Lock className="w-2.5 h-2.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HEADER PREMIUM COM LOGO OFICIAL BILLY                  */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07090e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Oficial Billy */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center p-1 rounded-xl bg-gradient-to-tr from-blue-600/30 via-slate-800 to-slate-900 border border-blue-500/30 shadow-md shadow-blue-500/10 group-hover:border-blue-400/50 transition">
              <img
                src="/billy-logo.png"
                alt="Logo Oficial Billy"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition">
                  Billy Suite
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Soluções Corporativas em Prospecção B2B
              </p>
            </div>
          </Link>

          {/* Menu Institucional de Navegação */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#solucoes" className="hover:text-blue-400 transition py-1">
              Soluções B2B
            </a>
            <a href="#metricas" className="hover:text-blue-400 transition py-1">
              Performance & Métricas
            </a>
            <a href="#metodologia" className="hover:text-blue-400 transition py-1">
              Metodologia F&O
            </a>
            <a href="#calculadora" className="hover:text-blue-400 transition py-1">
              Cockpit de Ganhos
            </a>
            <a href="#candidatura" className="hover:text-blue-400 transition py-1">
              Processo de Homologação
            </a>
          </nav>

          {/* Ações de Conversão */}
          <div className="flex items-center gap-3">
            <Link
              href="/operador/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#0e1424] hover:bg-[#141d33] border border-blue-500/25 rounded-xl transition shadow-sm"
            >
              Área do Operador
            </Link>
            <a
              href="#candidatura"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-lg shadow-blue-600/25 transition transform active:scale-95"
            >
              <span>Candidatar-se</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. HERO EXECUTIVO DE ALTA AUTORIDADE (ESTILO F&O CONSULTING) */}
      {/* ========================================================= */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#07090e] via-[#090e1a] to-[#07090e]">
        {/* Glow atmosférico e grid técnico */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e2b45_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Badge Corporativo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1629] border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold mb-8 shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>SISTEMA INTEGRADO DE PROSPECÇÃO B2B & GERAÇÃO DE RECEITA DIRETA</span>
          </div>

          {/* Headline Monumental */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.18] max-w-5xl mx-auto">
            Infraestrutura de Elite para Prospecção e Venda Automatizada de Sites para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              Negócios Locais
            </span>.
          </h1>

          {/* Subheadline Executiva */}
          <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            O <strong>Billy Suite</strong> varre o Google Maps, identifica empresas de alto faturamento sem site próprio e gera uma demonstração institucional de altíssimo padrão em <strong>45 segundos</strong> por Inteligência Artificial. Você prospecta com a página já no ar e fatura comissões líquidas imediatas via Pix.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#candidatura"
              className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <span>Submeter Candidatura de Operador</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#calculadora"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 hover:text-white bg-[#0e1424] hover:bg-[#141d33] border border-white/10 hover:border-white/20 transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Simular Faturamento Mensal</span>
            </a>
          </div>

          {/* DOCK CORPORATIVO DE INDICADORES CHAVE (F&O KEY METRICS) */}
          <div className="mt-16 max-w-5xl mx-auto bg-[#0b101d] border border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] text-left">
            <div className="pt-2 lg:pt-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Repasse Líquido
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                R$ 200,00
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Por cada site ativado, pago via Pix direto na sua conta.
              </p>
            </div>

            <div className="pt-3 lg:pt-0 lg:pl-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Geração por IA
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                45 Segundos
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Layout completo, fotos e textos montados sem programar nada.
              </p>
            </div>

            <div className="pt-3 lg:pt-0 lg:pl-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Registro Automático
              </span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                Domínio .com.br
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Integração nativa com ResellerClub e Vercel DNS.
              </p>
            </div>

            <div className="pt-3 lg:pt-0 lg:pl-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Independência Total
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                100% Autônomo
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sem chefe, sem reunião inútil e sem metas burocráticas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SOLUÇÕES CORPORATIVAS & PILARES DE INFRAESTRUTURA F&O  */}
      {/* ========================================================= */}
      <section id="solucoes" className="py-24 bg-[#090d16] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold block mb-2">
              SOLUÇÕES TECNOLÓGICAS DE ALTA PERFORMANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              A Engenharia por trás do Fechamento de Vendas em Escala
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Eliminamos todo o processo manual de desenvolvimento e prospecção corporativa. Uma esteira proprietária construída para entregar valor tangível antes mesmo do primeiro contato comercial.
            </p>
          </div>

          {/* Cards Estilo "Our Practice Areas" F&O */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Geoprocessamento Google Maps */}
            <div className="bg-[#0b101c] border border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-blue-500/10 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-105 transition">
                  <Target className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Pilar 01
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-blue-400 transition">
                  Garimpo Georreferenciado no Google Maps
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O robô escaneia municípios inteiros por nicho de atuação (clínicas, escritórios, gastronomia, estética) filtrando estabelecimentos consolidados que ainda não possuem site oficial.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Extração de dados:</span>
                <span className="text-emerald-400 font-bold">100% Automática</span>
              </div>
            </div>

            {/* Card 2: Engenharia Cognitiva Gemini */}
            <div className="bg-[#0b101c] border border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-blue-500/10 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Pilar 02
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-indigo-400 transition">
                  Engenharia Cognitiva & Geração por IA
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Utilizamos modelos Gemini para redigir a copy persuasiva corporativa, selecionar o acervo de fotos reais do local e estruturar uma página responsiva de alto padrão em 45 segundos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Tempo de build:</span>
                <span className="text-blue-400 font-bold">~45 segundos</span>
              </div>
            </div>

            {/* Card 3: Proposta Oficial & Split Pix */}
            <div className="bg-[#0b101c] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Pilar 03
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-emerald-400 transition">
                  Proposta Interativa com Checkout Pix
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O cliente recebe um link exclusivo onde visualiza a demonstração pronta, escolhe seu domínio .com.br e faz o pagamento via QR Code Pix no valor de R$ 500 com divisão automática.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Sua comissão:</span>
                <span className="text-emerald-400 font-bold">R$ 200,00 Pix</span>
              </div>
            </div>

            {/* Card 4: Provisionamento DNS e Domínio */}
            <div className="bg-[#0b101c] border border-white/[0.08] hover:border-sky-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-sky-500/10 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-600/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 transition">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Pilar 04
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-sky-400 transition">
                  Registro Automatizado & Vercel DNS
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Assim que o Pix é compensado, nosso webhook aciona a API da ResellerClub, cadastra o titular com documento brasileiro e aponta os DNS na Vercel com SSL ativado sem intervenção humana.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Certificado SSL:</span>
                <span className="text-sky-400 font-bold">Ativação Imediata</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. QUADRO COMPARATIVO ESTRATÉGICO (AGÊNCIA VS BILLY SUITE) */}
      {/* ========================================================= */}
      <section className="py-20 border-b border-white/[0.08] bg-[#07090e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold block mb-1">
              ANÁLISE COMPARATIVA DE EFICIÊNCIA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Por que o Billy Suite Fecha 10x Mais que uma Agência Tradicional
            </h2>
          </div>

          <div className="bg-[#0b101c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              {/* Modelo Arcaico */}
              <div className="p-6 sm:p-8 space-y-4 bg-rose-950/[0.08]">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <X className="w-4 h-4" /> Modelo Tradicional (Agências & Freelancers)
                </div>
                <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Cobram de R$ 2.500 a R$ 5.000, afastando 90% dos pequenos comércios.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Exigem 3 reuniões de briefing com o dono para começar o projeto.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Demoram de 15 a 30 dias úteis para entregar a primeira versão.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Você passa o dia preenchendo planilhas de CRM e batendo ponto.</span>
                  </li>
                </ul>
              </div>

              {/* Modelo Billy Suite */}
              <div className="p-6 sm:p-8 space-y-4 bg-emerald-950/[0.1]">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCheck className="w-4 h-4" /> Ecossistema Billy Suite
                </div>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Preço irrecusável:</strong> Apenas R$ 500,00 pagamento único no Pix sem mensalidade.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Zero reuniões:</strong> Você já aborda o cliente com o site dele totalmente pronto no ar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Entrega instantânea:</strong> 45 segundos para compilar a página e domínio em minutos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Repasse na hora:</strong> R$ 200 líquidos direto na sua chave Pix no ato da confirmação.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. COCKPIT FINANCEIRO DE PROJEÇÕES (CALCULADORA EXECUTIVA) */}
      {/* ========================================================= */}
      <section id="calculadora" className="py-24 border-b border-white/[0.08] bg-[#090d16] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">
              PROJEÇÃO DE RESULTADOS FINANCEIROS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Simulador Executivo de Comissionamento
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Ajuste as métricas de volume operacional e verifique o rendimento matemático estimado para sua atuação:
            </p>
          </div>

          <div className="bg-[#0b101c] border border-blue-500/20 rounded-2xl p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Sliders Interativos */}
              <div className="space-y-7">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Contratos fechados por dia
                    </label>
                    <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-0.5 rounded-lg">
                      {salesPerDay} {salesPerDay === 1 ? 'venda/dia' : 'vendas/dia'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={salesPerDay}
                    onChange={(e) => setSalesPerDay(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>1 fechamento</span>
                    <span>4 fechamentos</span>
                    <span>8 fechamentos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Dias trabalhados por semana
                    </label>
                    <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-0.5 rounded-lg">
                      {daysPerWeek} dias/semana
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    step="1"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>3 dias</span>
                    <span>5 dias (comercial)</span>
                    <span>6 dias</span>
                  </div>
                </div>

                {/* Nota Técnica de Conversão */}
                <div className="p-4 rounded-xl bg-[#070a11] border border-white/[0.08] text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <div className="text-white font-bold font-mono text-[11px] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    MÉTRICA REAL DE CONVERSÃO B2B
                  </div>
                  <p>
                    Com o aplicativo desktop, disparar 15 a 20 demonstrações com link ativo por dia no WhatsApp leva menos de 2 horas. Com uma taxa de conversão modesta de 10%, atingir 2 vendas diárias é a média padrão da nossa rede.
                  </p>
                </div>
              </div>

              {/* Console de Rendimento F&O */}
              <div className="bg-[#070a11] p-6 sm:p-7 rounded-xl border border-blue-500/30 space-y-5">
                <div className="border-b border-white/[0.08] pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Rendimento Semanal Projetado
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    R$ {weeklyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{weeklySales} fechamentos na semana</span>
                </div>

                <div className="border-b border-white/[0.08] pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Faturamento Mensal Estimado
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-1 tracking-tight">
                    R$ {monthlyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-xs text-slate-300 font-mono mt-1 block">
                    {monthlySales} contratos / mês • Sem descontos, direto na sua chave Pix
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Projeção de Faturamento Anual
                  </span>
                  <div className="text-xl font-bold font-mono text-blue-300 mt-1">
                    R$ {annualIncome.toLocaleString('pt-BR')},00 / ano
                  </div>
                </div>

                <a
                  href="#candidatura"
                  className="w-full mt-3 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-xs uppercase tracking-wider font-mono transition shadow-lg shadow-blue-600/30 block cursor-pointer"
                >
                  Solicitar Licença de Operador Homologado
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. ROADMAP METODOLÓGICO EM 4 FASES (F&O EXECUTION FLOW)   */}
      {/* ========================================================= */}
      <section id="metodologia" className="py-24 bg-[#07090e] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold block mb-2">
              FRAMEWORK OPERACIONAL EM 4 PASSOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Como Funciona a Rotina de Trabalho do Operador
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Fluxo direto ao ponto, planejado para maximizar a conversão e o tempo produtivo:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#0b101c] p-6 rounded-2xl border border-white/[0.08] relative">
              <span className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
                01
              </span>
              <h3 className="text-base font-bold text-white mb-2">Filtro de Oportunidades</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você define a cidade e o nicho no app desktop. O robô faz a varredura e lista comércios com alta nota de avaliação e sem site ativo.
              </p>
            </div>

            <div className="bg-[#0b101c] p-6 rounded-2xl border border-white/[0.08] relative">
              <span className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
                02
              </span>
              <h3 className="text-base font-bold text-white mb-2">Geração do Site em 45s</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Com 1 clique, o motor de Inteligência Artificial processa o acervo de fotos, redige o conteúdo profissional e publica o site demonstrativo na Vercel.
              </p>
            </div>

            <div className="bg-[#0b101c] p-6 rounded-2xl border border-white/[0.08] relative">
              <span className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
                03
              </span>
              <h3 className="text-base font-bold text-white mb-2">Abordagem de Impacto</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você dispara o link personalizado no WhatsApp com espaçamento duplo para abrir o card de prévia. O empresário vê a loja dele profissionalizada no celular.
              </p>
            </div>

            <div className="bg-[#0b101c] p-6 rounded-2xl border border-white/[0.08] relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
                04
              </span>
              <h3 className="text-base font-bold text-white mb-2">Fechamento & Pix Imediato</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O cliente escaneia o QR Code de R$ 500, o domínio .com.br dele é registrado automaticamente e R$ 200 líquidos caem direto na sua chave Pix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. PROCESSO SELETIVO & FORMULÁRIO DE CANDIDATURA (SPLIT)   */}
      {/* ========================================================= */}
      <section id="candidatura" className="py-24 bg-[#090d16] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* COLUNA ESQUERDA: CRITÉRIOS DE HOMOLOGAÇÃO F&O */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold block mb-1">
                  HOMOLOGAÇÃO DE OPERADORES
                </span>
                <h2 className="text-3xl font-extrabold text-white">
                  Critérios de Seleção para Novos Parceiros
                </h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  Buscamos profissionais comerciais comprometidos com prospecção diária, foco em fechamento e autonomia operacional. Não exigimos formação em TI ou conhecimento de programação.
                </p>
              </div>

              {/* Status de Vagas Ativas */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Vagas abertas para operadores comerciais em todo o Brasil</span>
              </div>

              {/* Critérios Objetivos */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-[#0b101c] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-bold">Perfil autônomo e determinação comercial:</strong>
                    <span className="text-xs text-slate-300">Capacidade de manter ritmo de contato com estabelecimentos comerciais locais sem necessitar de supervisão constante.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#0b101c] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-bold">Computador com sistema Windows:</strong>
                    <span className="text-xs text-slate-300">O Billy Suite é um aplicativo desktop nativo robusto projetado para ambiente Windows (Windows 10 ou 11).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#0b101c] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-bold">Conta bancária com Chave Pix ativa:</strong>
                    <span className="text-xs text-slate-300">Para recebimento instantâneo das comissões de R$ 200,00 por contrato finalizado.</span>
                  </div>
                </div>
              </div>

              {/* Card de Compromisso Institucional */}
              <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  GARANTIA DE INFRAESTRUTURA CENTRAL
                </div>
                <p className="text-slate-300 leading-relaxed">
                  O ecossistema Billy Suite absorve todos os custos de hospedagem, conexão com APIs de IA, registro de domínios e suporte de servidores. Sua única atribuição é conduzir a apresentação e fechar com o comerciante.
                </p>
              </div>
            </div>

            {/* COLUNA DIREITA: FORMULÁRIO DE INSCRIÇÃO */}
            <div className="lg:col-span-7">
              <div className="bg-[#0b101c] border border-blue-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="mb-6 pb-4 border-b border-white/[0.08]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    Formulário de Inscrição & Homologação
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Preencha com seus dados corretos para emissão do Token Serial exclusivo do aplicativo desktop.
                  </p>
                </div>

                {successMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm mb-0.5">Inscrição Enviada com Sucesso!</strong>
                      {successMessage}
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                    <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm mb-0.5">Atenção ao preenchimento:</strong>
                      {errorMessage}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                        E-mail Corporativo / Principal *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="carlos.comercial@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(11) 98765-4321"
                        value={formData.whatsapp}
                        onChange={handleWhatsAppChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                        Cidade de Atuação *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Campinas"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                        UF *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      >
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dados da Chave Pix */}
                  <div className="p-4 rounded-xl bg-[#070a11] border border-emerald-500/25 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      <DollarSign className="w-4 h-4" />
                      Chave Pix para Repasse das Comissões
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Tipo *</label>
                        <select
                          value={formData.pixType}
                          onChange={(e) => setFormData({ ...formData, pixType: e.target.value as any })}
                          className="w-full px-2.5 py-2 rounded-lg bg-[#0b101c] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="phone">Telefone</option>
                          <option value="email">E-mail</option>
                          <option value="random">Chave Aleatória</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Chave Pix *</label>
                        <input
                          type="text"
                          required
                          placeholder="Informe a chave Pix de recebimento"
                          value={formData.pixKey}
                          onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0b101c] border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      LinkedIn ou Portfólio (Opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/seu-perfil"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Experiência Comercial / Resumo Profissional
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Conte brevemente sobre suas experiências com atendimento ou vendas comerciais..."
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                    ></textarea>
                  </div>

                  {/* Termos de Parceria */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-[#070a11] border-white/20 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-300 leading-relaxed">
                        Declaro que li e aceito integralmente o{' '}
                        <button
                          type="button"
                          onClick={() => setShowContractModal(true)}
                          className="text-blue-400 hover:text-blue-300 underline font-semibold inline"
                        >
                          Contrato de Parceria Autônoma e Termo de Confidencialidade Billy Suite
                        </button>
                        , ciente de que a atuação é 100% autônoma e comissionada por resultado.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider cursor-pointer transform active:scale-95"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Processando Candidatura...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submeter Candidatura e Solicitar Licença</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. MODAL DO CONTRATO DE PARCERIA & CONFIDENCIALIDADE       */}
      {/* ========================================================= */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b101c] border border-blue-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Contrato de Parceria Autônoma & Confidencialidade Billy Suite
                </h3>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed">
              <p className="font-bold text-white text-sm">
                INSTRUMENTO PARTICULAR DE PARCERIA COMERCIAL AUTÔNOMA E TERMO DE CONFIDENCIALIDADE
              </p>
              <p>
                <strong>1. DO OBJETO:</strong> O presente instrumento estabelece as diretrizes de atuação do OPERADOR como parceiro comercial independente na divulgação, apresentação e fechamento de licenciamentos de websites empresariais desenvolvidos pela tecnologia Billy Suite.
              </p>
              <p>
                <strong>2. DA INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO:</strong> As partes declaram e reconhecem formalmente que a presente relação possui natureza estritamente cível e autônoma, sem qualquer subordinação jurídica, controle de ponto, exclusividade ou relação empregatícia regida pela CLT.
              </p>
              <p>
                <strong>3. DO COMISSIONAMENTO E REPASSE PIX:</strong> O Operador receberá a quantia fixa e líquida de <strong>R$ 200,00 (duzentos reais)</strong> por cada site cuja ativação for integralmente quitada pelo cliente final no valor de R$ 500,00 via Pix. Os repasses são liberados para a chave Pix indicada no cadastro.
              </p>
              <p>
                <strong>4. DO TOKEN SERIAL & PROPRIEDADE INTELECTUAL:</strong> O Operador receberá um Token Serial de uso pessoal e intransferível para ativar o software desktop Billy Suite. Fica expressamente vedada a sublocação, engenharia reversa ou compartilhamento de chave sob pena de revogação irrevogável da licença.
              </p>
              <p>
                <strong>5. DA CONFIDENCIALIDADE DE DADOS:</strong> O Operador compromete-se a resguardar sigilo absoluto sobre estratégias comerciais, algoritmos de automação e dados cadastrais obtidos, nos termos da Lei Geral de Proteção de Dados (LGPD) e Lei nº 9.609/98.
              </p>
            </div>

            <div className="p-4 border-t border-white/[0.08] bg-[#070a11] flex justify-end gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, termsAccepted: true });
                  setShowContractModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
              >
                Li e Aceito os Termos do Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. FOOTER CORPORATIVO F&O COM LOGO OFICIAL BILLY         */}
      {/* ========================================================= */}
      <footer className="border-t border-white/[0.08] bg-[#05070b] py-14 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo e Missão Institucional */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/billy-logo.png"
                  alt="Billy Suite Oficial"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <span className="font-extrabold text-base text-white tracking-tight">
                    Billy Suite
                  </span>
                  <span className="ml-2 font-mono text-[9px] uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                    Enterprise
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono">webbilly.com.br</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Plataforma líder em prospecção georreferenciada e automação de sites para negócios locais. Potencializando operadores comerciais com tecnologia de Inteligência Artificial e fechamentos em escala nacional.
              </p>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ambiente Seguro com Criptografia SSL e DNS de Alta Disponibilidade</span>
              </div>
            </div>

            {/* Links Rápidos */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold">Navegação</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#solucoes" className="hover:text-blue-400 transition">Soluções B2B</a></li>
                <li><a href="#metricas" className="hover:text-blue-400 transition">Performance Comercial</a></li>
                <li><a href="#calculadora" className="hover:text-blue-400 transition">Simulador de Ganhos</a></li>
                <li><a href="#candidatura" className="hover:text-blue-400 transition">Inscrição de Operador</a></li>
              </ul>
            </div>

            {/* Acesso Restrito & Jurídico */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold">Acesso ao Sistema</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/operador/login" className="hover:text-white transition flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Área do Operador</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white transition flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Painel Master Admin</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="hover:text-white transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contrato de Parceria & Termos</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Billy Suite. Todos os direitos reservados. Operação comercial homologada.</p>
            <p className="font-mono text-slate-500">Versão v2.0 Enterprise • Host Vercel Edge Global</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
  X
} from 'lucide-react';

export default function LandingPage() {
  // Calculadora interativa
  const [salesPerDay, setSalesPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const commissionPerSale = 200;
  const weeklySales = salesPerDay * daysPerWeek;
  const monthlySales = weeklySales * 4;
  const weeklyIncome = weeklySales * commissionPerSale;
  const monthlyIncome = monthlySales * commissionPerSale;
  const annualIncome = monthlyIncome * 12;

  // Formulário de candidatura
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
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
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

      setSuccessMessage('Inscrição enviada com sucesso! Seu cadastro está com status PENDENTE de aprovação. Nossa equipe enviará o retorno para seu WhatsApp e E-mail.');
      confetti({
        particleCount: 120,
        spread: 70,
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Banner de Recrutamento */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-indigo-900/60 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs sm:text-sm text-indigo-200 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white">Vagas Abertas para Operadores Comerciais 2026:</span>
        <span>Atue 100% Home Office comissionado a R$ 200 por venda via Pix.</span>
      </div>

      {/* Header / Navegação */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center font-black text-xl text-white">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Billy Suite</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold">
                  WebBilly Oficial
                </span>
              </div>
              <p className="text-xs text-zinc-400">Rede Nacional de Operadores Comerciais</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <a href="#calculadora" className="hover:text-white transition">Calculadora de Ganhos</a>
            <a href="#tecnologia" className="hover:text-white transition">Como Funciona</a>
            <a href="#diferenciais" className="hover:text-white transition">Vantagens</a>
            <a href="#candidatura" className="hover:text-white transition">Inscrição</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/operador/login"
              className="px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl transition"
            >
              Área do Operador
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
            >
              Admin Master
            </Link>
            <a
              href="#candidatura"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              Quero ser Operador
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Recrutamento Ativo de SDRs & Closers Remotos
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Ganhe <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">R$ 200 por venda</span> prospectando e fechando sites com IA.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed">
              O ecossistema <strong>Billy Suite Desktop</strong> encontra comércios locais sem site no Google Maps e cria landing pages prontas em segundos. Sua missão é apenas enviar a demonstração no WhatsApp e receber a comissão no Pix.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#candidatura"
                className="px-7 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Candidatar-se à Vaga
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#calculadora"
                className="px-6 py-3.5 rounded-xl font-semibold text-base text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 transition flex items-center gap-2"
              >
                Simular Meus Ganhos
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </a>
            </div>

            {/* Badges de destaque */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="glass-card p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  R$ 200 Líquidos
                </div>
                <p className="text-xs text-zinc-400 mt-1">Comissão direta por cada site ativado</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Laptop className="w-4 h-4" />
                  100% Home Office
                </div>
                <p className="text-xs text-zinc-400 mt-1">Trabalhe de qualquer lugar do Brasil</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  App Licenciado
                </div>
                <p className="text-xs text-zinc-400 mt-1">Token Serial oficial do Billy Suite</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  IA Faz o Trabalho
                </div>
                <p className="text-xs text-zinc-400 mt-1">Zero conhecimento de código exigido</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE COMISSÕES INTERATIVA */}
      <section id="calculadora" className="py-20 border-t border-zinc-800/80 bg-zinc-950/40 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Potencial de Ganhos Imediatos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Calculadora de Comissões do Operador
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2">
              Você recebe <strong>R$ 200,00</strong> a cada cliente que aceita o site gerado pela inteligência artificial. Ajuste os controles e veja a projeção do seu faturamento:
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controles */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Sites fechados por dia:
                    </label>
                    <span className="text-lg font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-0.5 rounded-lg">
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
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>1 venda</span>
                    <span>4 vendas</span>
                    <span>8 vendas</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Dias trabalhados por semana:
                    </label>
                    <span className="text-lg font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 rounded-lg">
                      {daysPerWeek} dias/sem
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    step="1"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>3 dias</span>
                    <span>5 dias (comum)</span>
                    <span>6 dias</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Como fechar 2 vendas por dia?
                  </div>
                  <p>
                    Com o robô Billy Maps Scraper você prospecta 30 empresas em 15 minutos e envia a demonstração pronta no WhatsApp. Nossa taxa média de fechamento é de <strong>6% a 10%</strong>.
                  </p>
                </div>
              </div>

              {/* Cards de Resultados */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
                <div className="border-b border-zinc-800 pb-4">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Sua Renda Semanal</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    R$ {weeklyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{weeklySales} vendas na semana</span>
                </div>

                <div className="border-b border-zinc-800 pb-4">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Sua Renda Mensal Estimada
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mt-1">
                    R$ {monthlyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-xs text-zinc-400">Total de {monthlySales} vendas no mês via Pix</span>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Projeção Anual</span>
                  <div className="text-2xl font-bold text-indigo-300 mt-1">
                    R$ {annualIncome.toLocaleString('pt-BR')},00 / ano
                  </div>
                </div>

                <a
                  href="#candidatura"
                  className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center text-sm transition shadow-lg shadow-emerald-600/20 block"
                >
                  Quero Garantir Minha Vaga
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO COMO FUNCIONA A TECNOLOGIA BILLY SUITE */}
      <section id="tecnologia" className="py-20 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Tecnologia Proprietária
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Como o Billy Suite Multiplica Suas Vendas
            </h2>
            <p className="text-zinc-400 text-base mt-2">
              Você não precisa saber programação nem design. O app desktop faz toda a engenharia pesada para você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Passo 1 */}
            <div className="glass-card p-6 rounded-2xl glass-card-hover transition relative group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xl mb-4 group-hover:scale-110 transition">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Garimpo Automático no Maps</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Digite uma cidade e nicho (ex: 'Dentistas em Campinas'). O Billy Suite encontra dezenas de estabelecimentos sem site oficial e extrai WhatsApp e telefone.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="glass-card p-6 rounded-2xl glass-card-hover transition relative group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xl mb-4 group-hover:scale-110 transition">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Geração com IA Gemini</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Nossa IA analisa o negócio, seleciona imagens de alta resolução do portfólio, escreve o copywriting persuasivo e constrói o site em menos de 1 minuto.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="glass-card p-6 rounded-2xl glass-card-hover transition relative group">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-black text-xl mb-4 group-hover:scale-110 transition">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Abordagem de Alto Impacto</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Você envia o link da demonstração já pronta para o WhatsApp do proprietário. Ele vê o próprio site funcionando com seu logotipo e fotos, gerando desejo imediato.
              </p>
            </div>

            {/* Passo 4 */}
            <div className="glass-card p-6 rounded-2xl glass-card-hover transition relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl mb-4 group-hover:scale-110 transition">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pix Direto na Conta</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Ao fechar, o cliente paga R$ 600 pela ativação e domínio. R$ 200 de comissão líquida são creditados para você via Pix, com controle em tempo real no seu painel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE INSCRIÇÃO DE OPERADOR */}
      <section id="candidatura" className="py-20 border-t border-zinc-800/80 bg-zinc-950/60 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Inscrição Oficial
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Formulário de Candidatura do Operador
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              Preencha os dados abaixo. Após a análise do perfil, você receberá seu <strong>Token Serial Único de Ativação</strong> e acesso ao painel do operador.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-zinc-800 shadow-2xl">
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Parabéns!</strong>
                  {successMessage}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
                <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Atenção:</strong>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    E-mail Principal *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos.comercial@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    UF *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dados do Pix para Pagamento de Comissões */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  Chave Pix para Recebimento de Comissões
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tipo de Chave *</label>
                    <select
                      value={formData.pixType}
                      onChange={(e) => setFormData({ ...formData, pixType: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="phone">Telefone</option>
                      <option value="email">E-mail</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-zinc-400 mb-1">Chave Pix *</label>
                    <input
                      type="text"
                      required
                      placeholder="Informe sua chave Pix"
                      value={formData.pixKey}
                      onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Link do LinkedIn ou Currículo Online (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/seu-perfil"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Experiência Comercial / Vendas (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte brevemente se já atuou com vendas, SDR, telemarketing ou abordagem via WhatsApp..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Checkbox Termos de Adesão */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    Declaro que li e aceito integralmente o{' '}
                    <button
                      type="button"
                      onClick={() => setShowContractModal(true)}
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold inline"
                    >
                      Contrato de Parceria Autônoma e Termo de Confidencialidade Billy Suite
                    </button>
                    , ciente de que a atividade é independente comissionada.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enviando Inscrição...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Candidatura de Operador
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* MODAL DO CONTRATO DE PARCERIA E CONFIDENCIALIDADE */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Contrato de Parceria Autônoma e Confidencialidade</h3>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-zinc-300 space-y-4 leading-relaxed font-sans">
              <p className="font-semibold text-white">
                INSTRUMENTO PARTICULAR DE PARCERIA COMERCIAL AUTÔNOMA E TERMO DE CONFIDENCIALIDADE (BILLY SUITE)
              </p>
              <p>
                <strong>1. DO OBJETO:</strong> O presente contrato tem por objeto a atuação do OPERADOR como parceiro autônomo e independente na divulgação, prospecção e fechamento de licenciamento de websites e soluções de presença digital desenvolvidos pelo ecossistema Billy Suite.
              </p>
              <p>
                <strong>2. DA INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO:</strong> As partes reconhecem expressamente que a relação ora pactuada possui natureza estritamente comercial e civil autônoma, sem qualquer subordinação jurídica, cumprimento de horário fixo ou exclusividade. O Operador atua por conta própria, gerindo sua própria rotina.
              </p>
              <p>
                <strong>3. DA REMUNERAÇÃO E COMISSIONAMENTO:</strong> O Operador fará jus à comissão fixa de <strong>R$ 200,00 (duzentos reais)</strong> por cada ativação de website e plano contratado que tiver o pagamento confirmado pelo cliente final via Pix ou meio eletrônico credenciado. O repasse será realizado via Pix na chave indicada pelo Operador.
              </p>
              <p>
                <strong>4. DO TOKEN SERIAL E SEGURANÇA:</strong> O Operador receberá um Token Serial único intransferível para ativação do software Billy Suite Desktop. É estritamente proibido o compartilhamento, sublocação ou engenharia reversa do software. O uso indevido ensejará bloqueio imediato da licença.
              </p>
              <p>
                <strong>5. DA CONFIDENCIALIDADE:</strong> O Operador obriga-se a manter absoluto sigilo sobre métodos internos, algoritmos de inteligência artificial, dados de clientes e tecnologias da Billy Suite, sob as penalidades da Lei nº 9.609/98 e legislação correlata.
              </p>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, termsAccepted: true });
                  setShowContractModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              B
            </div>
            <div>
              <p className="font-bold text-white">WebBilly • www.webbilly.com.br</p>
              <p className="text-[11px] text-zinc-500">Ecossistema Billy Suite v2.0 AI • 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/operador/login" className="hover:text-white transition">Painel do Operador</Link>
            <Link href="/admin/login" className="hover:text-white transition">Painel Administrativo</Link>
            <button onClick={() => setShowContractModal(true)} className="hover:text-white transition">Termos & Contrato</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

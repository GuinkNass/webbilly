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
  ArrowUpRight
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
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-violet-600 selection:text-white font-sans antialiased">
      {/* Top Banner Sóbrio de Status */}
      <div className="bg-[#0e1217] border-b border-white/[0.06] py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-mono uppercase tracking-wider text-[11px] text-slate-300 font-semibold">
          Operação Comercial 2026:
        </span>
        <span className="text-slate-400">
          Vagas abertas para operadores autônomos. Repasse fixo de <strong className="text-emerald-400 font-semibold">R$ 200 líquidos</strong> por cliente ativado via Pix.
        </span>
      </div>

      {/* Header / Navegação Executiva */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0c10]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-400/30 flex items-center justify-center font-mono font-bold text-base text-white shadow-sm">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Billy Suite</span>
                <span className="font-mono text-[10px] uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium">
                  WebBilly
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#como-funciona" className="hover:text-white transition">Como Funciona</a>
            <a href="#calculadora" className="hover:text-white transition">Calculadora de Ganhos</a>
            <a href="#candidatura" className="hover:text-white transition">Critérios & Inscrição</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/operador/login"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition"
            >
              Área do Operador
            </Link>
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition"
            >
              Admin
            </Link>
            <a
              href="#candidatura"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm transition"
            >
              Ser Operador
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-white/[0.06]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e2433_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            AUTOMAÇÃO COMERCIAL B2B
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Venda sites para quem realmente precisa.{' '}
            <span className="text-slate-400 block font-normal text-3xl sm:text-4xl lg:text-5xl mt-2">
              Sem reunião inútil de alinhamento.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Enquanto o seu concorrente demora duas semanas para orçar um site em WordPress, o Billy Suite encontra comércios locais sem página no Google Maps e gera uma demonstração pronta em segundos.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#candidatura"
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              Submeter Candidatura
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#calculadora"
              className="px-5 py-3 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-[#131720] hover:bg-[#1a202c] border border-white/[0.08] transition flex items-center gap-2"
            >
              Simular Ganhos Reais
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </a>
          </div>

          {/* DOCK HORIZONTAL DE MÉTRICAS SÓLIDAS */}
          <div className="mt-14 max-w-4xl mx-auto bg-[#131720] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] text-left">
            <div className="pt-2 md:pt-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">Comissão Direta</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">R$ 200 líquidos</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Por cada fecho ativo</p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">Autonomia Real</span>
              <div className="text-lg font-bold text-white mt-0.5">Zero burocracia</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sem chefe a pedir relatórios</p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">Software Nativo</span>
              <div className="text-lg font-bold text-white mt-0.5">App Windows</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Com Scraper e IA integrados</p>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">Liquidação</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">Instantânea</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Via Pix direto na sua chave</p>
            </div>
          </div>
        </div>
      </section>

      {/* "COMO FUNCIONA" — BENTO GRID TÉCNICO */}
      <section id="como-funciona" className="py-20 bg-[#0e1217] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="font-mono text-xs uppercase tracking-wider text-violet-400 font-semibold block">
              MÉTODO BILLY SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Como o robô faz o trabalho pesado enquanto você fica com o lucro.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Chega de ligar a frio para levar corte de recepcionista. O processo é cirúrgico: identificamos quem tem dinheiro, montamos a página antes de falar com ele e entregamos valor de choque.
            </p>
          </div>

          {/* Grid Assimétrico Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1 - Scraper Maps (Col span 2) */}
            <div className="md:col-span-2 bg-[#131720] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.14] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] text-violet-400 uppercase tracking-wider font-semibold">
                    01 / GARIMPO NO GOOGLE MAPS
                  </span>
                  <span className="text-[10px] font-mono bg-white/[0.04] text-slate-400 border border-white/[0.08] px-2 py-0.5 rounded">
                    Scraper Nativo
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Garimpo impiedoso: encontramos estabelecimentos que faturam alto mas ainda vivem na era analógica.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  O Billy varre o Google Maps cidade por cidade. Em minutos, lista clínicas, barbearias, mecânicas e restaurantes sem site oficial. Sem planilha manual, sem perder tempo no Instagram.
                </p>
              </div>

              {/* Terminal Mockup */}
              <div className="bg-[#0a0c10] border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/[0.06] text-slate-500 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 text-slate-400">billy-engine/scanner.exe --query="odontologia campinas"</span>
                </div>
                <div className="text-slate-400">&gt; Conectando à API de geolocalização...</div>
                <div className="text-slate-400">&gt; 52 estabelecimentos locais analisados</div>
                <div className="text-emerald-400 font-semibold">&gt; 34 sem site oficial verificado (65% de taxa de oportunidade)</div>
                <div className="text-violet-400">&gt; Dados de contato e WhatsApp salvos no banco local.</div>
              </div>
            </div>

            {/* Bento Card 2 - IA Gemini (Col span 1) */}
            <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/[0.14] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] text-violet-400 uppercase tracking-wider font-semibold">
                    02 / GERAÇÃO AUTOMÁTICA
                  </span>
                  <Cpu className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Design pronto antes do dono da empresa terminar o café.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  A IA analisa o nicho, seleciona imagens de alta resolução, redige a copy persuasiva e gera uma landing page moderna em menos de 1 minuto. Zero código exigido.
                </p>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-[#0a0c10] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Tempo médio de build:</span>
                <span className="text-emerald-400 font-bold">42 segundos</span>
              </div>
            </div>

            {/* Bento Card 3 - Abordagem de Choque (Col span 1) */}
            <div className="bg-[#131720] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/[0.14] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] text-violet-400 uppercase tracking-wider font-semibold">
                    03 / CONTATO DE IMPACTO
                  </span>
                  <Smartphone className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Abordagem certeira: você não envia um PDF chato. Você envia o site já no ar.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  O cliente abre o link no celular e vê o próprio negócio profissionalizado com fotos reais e botão para o WhatsApp dele. A resposta é imediata porque você já entregou o valor antes de cobrar.
                </p>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                💡 <em>"O Billy faz o trabalho sujo de montar; a sua única função é enviar o link e não estragar tudo no WhatsApp."</em>
              </div>
            </div>

            {/* Bento Card 4 - Pix na Carteira (Col span 2) */}
            <div className="md:col-span-2 bg-[#131720] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/[0.14] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
                    04 / LIQUIDAÇÃO DIRETA
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Sem esperar 30 dias para receber salário. Cliente pagou a ativação, a sua metade cai direto.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Sem metas inatingíveis de RH nem burocracia corporativa. Fechou a ativação de R$ 600, o cliente passa a régua e R$ 200 líquidos vão direto para a sua chave Pix cadastrada.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#0a0c10] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase block">Valor Venda</span>
                  <span className="text-white font-bold text-sm">R$ 600</span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 uppercase block">Sua Comissão</span>
                  <span className="text-emerald-400 font-bold text-sm">R$ 200 Pix</span>
                </div>
                <div className="bg-[#0a0c10] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase block">Infra Central</span>
                  <span className="text-slate-400 font-bold text-sm">R$ 400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE COMISSÕES (CONSOLE EXECUTIVO / COCKPIT) */}
      <section id="calculadora" className="py-20 border-b border-white/[0.06] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
              CONSOLE DE SIMULAÇÃO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Calculadora de Faturamento do Operador
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Ajuste as métricas de esforço diário e veja a projeção matemática de comissões líquidas:
            </p>
          </div>

          <div className="bg-[#12161f] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Controles do Cockpit */}
              <div className="space-y-7">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                      Sites fechados por dia
                    </label>
                    <span className="font-mono text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded">
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
                    className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>1 fecho</span>
                    <span>4 fechos</span>
                    <span>8 fechos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                      Dias trabalhados por semana
                    </label>
                    <span className="font-mono text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded">
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
                    className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>3 dias</span>
                    <span>5 dias (padrão)</span>
                    <span>6 dias</span>
                  </div>
                </div>

                {/* Nota Sarcástica do Billy */}
                <div className="p-4 rounded-xl bg-[#0a0c10] border border-white/[0.06] text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <div className="text-slate-300 font-semibold font-mono text-[11px] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    REALIDADE COMERCIAL BILLY SUITE
                  </div>
                  <p>
                    Simulação baseada em fechar negócios reais, não em ver vídeos de motivação. Se você enviar 20 demonstrações por dia no WhatsApp e fechar duas, a matemática cuida do resto.
                  </p>
                </div>
              </div>

              {/* Painel de Resultados Estilo Trading / Cockpit */}
              <div className="bg-[#0a0c10] p-6 sm:p-7 rounded-xl border border-white/[0.08] space-y-5">
                <div className="border-b border-white/[0.06] pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Rendimento Semanal</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    R$ {weeklyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{weeklySales} contratos na semana</span>
                </div>

                <div className="border-b border-white/[0.06] pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Faturamento Mensal Estimado
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-1 tracking-tight">
                    R$ {monthlyIncome.toLocaleString('pt-BR')},00
                  </div>
                  <span className="text-xs text-slate-400 font-mono mt-1 block">
                    {monthlySales} vendas no mês • Repasses diretos via Pix
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Acumulado Anual Projetado</span>
                  <div className="text-xl font-bold font-mono text-violet-300 mt-1">
                    R$ {annualIncome.toLocaleString('pt-BR')},00 / ano
                  </div>
                </div>

                <a
                  href="#candidatura"
                  className="w-full mt-3 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-center text-xs uppercase tracking-wider font-mono transition shadow-md shadow-violet-600/20 block cursor-pointer"
                >
                  Solicitar Licença de Operador
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE CANDIDATURA EM SPLIT VIEW (2 COLUNAS) */}
      <section id="candidatura" className="py-20 bg-[#0e1217] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* COLUNA ESQUERDA: CRITÉRIOS & REALIDADE DO BILLY */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-violet-400 font-semibold block">
                  PROCESSO SELETIVO
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-2">
                  Critérios de Seleção para Operadores
                </h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Se você procura um emprego para fingir que trabalha no Teams entre as 9h e as 18h, esta vaga não é para você. Buscamos operadores comerciais focados em fechamento e volume diário.
                </p>
              </div>

              {/* Status de Vagas */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Vagas ativas para operadores com foco em execução
              </div>

              {/* Lista de Critérios Sem Rodeios */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-[#131720] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-semibold">Perfil autônomo e sangue frio:</strong>
                    <span className="text-xs text-slate-400">Capacidade de lidar com volume diário de conversas no WhatsApp sem desanimar no primeiro "não".</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#131720] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-semibold">Computador próprio com Windows:</strong>
                    <span className="text-xs text-slate-400">O Billy Suite é um aplicativo desktop nativo robusto. Não dá para ser operador profissional em tablet antigo ou smartphone.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#131720] p-4 rounded-xl border border-white/[0.08]">
                  <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block font-semibold">Proibido enrolação corporativa:</strong>
                    <span className="text-xs text-slate-400">Desculpas de falta de tempo, reuniões desnecessárias e jargões vazios não pagam boletos. O foco é demonstração pronta e Pix no bolso.</span>
                  </div>
                </div>
              </div>

              {/* Card de Realidade Billy */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  RESPONSABILIDADE CLARA
                </div>
                <p className="text-slate-400 leading-relaxed">
                  O Billy faz o trabalho sujo de garimpar os dados e montar a página em segundos; a sua única função é enviar o link e não estragar tudo na hora de negociar no WhatsApp.
                </p>
              </div>
            </div>

            {/* COLUNA DIREITA: FORMULÁRIO INTEGRADO */}
            <div className="lg:col-span-7">
              <div className="bg-[#131720] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="mb-6 pb-4 border-b border-white/[0.06]">
                  <h3 className="text-lg font-bold text-white">Formulário de Candidatura</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preencha os dados reais para emissão do seu Token Serial oficial e chave Pix de pagamento.
                  </p>
                </div>

                {successMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Candidatura Registrada!</strong>
                      {successMessage}
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Atenção aos dados:</strong>
                      {errorMessage}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        E-mail Principal *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="carlos.comercial@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(11) 98765-4321"
                        value={formData.whatsapp}
                        onChange={handleWhatsAppChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Campinas"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        UF *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0a0c10] border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono"
                      >
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dados do Pix para Pagamento de Comissões */}
                  <div className="p-3.5 rounded-xl bg-[#0a0c10] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                      <DollarSign className="w-3.5 h-3.5" />
                      Chave Pix para Repasse das Comissões
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Tipo de Chave *</label>
                        <select
                          value={formData.pixType}
                          onChange={(e) => setFormData({ ...formData, pixType: e.target.value as any })}
                          className="w-full px-2.5 py-2 rounded-lg bg-[#131720] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="phone">Telefone</option>
                          <option value="email">E-mail</option>
                          <option value="random">Chave Aleatória</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Chave Pix *</label>
                        <input
                          type="text"
                          required
                          placeholder="Informe sua chave Pix"
                          value={formData.pixKey}
                          onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#131720] border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                      LinkedIn ou Portfólio Online (Opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/seu-perfil"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Experiência Comercial / Vendas
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Já vendeu algo na vida ou pelo menos sabe responder uma mensagem no WhatsApp sem parecer um robô do suporte?"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none"
                    ></textarea>
                  </div>

                  {/* Checkbox Termos de Adesão */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-[#0a0c10] border-white/20 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400 leading-relaxed">
                        Declaro que li e aceito integralmente o{' '}
                        <button
                          type="button"
                          onClick={() => setShowContractModal(true)}
                          className="text-violet-400 hover:text-violet-300 underline font-medium inline"
                        >
                          Contrato de Parceria Autônoma e Termo de Confidencialidade Billy Suite
                        </button>
                        , ciente de que a atividade é 100% autônoma e comissionada.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processando Candidatura...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submeter Candidatura e Solicitar Licença
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DO CONTRATO DE PARCERIA E CONFIDENCIALIDADE */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131720] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white font-mono">Contrato de Parceria Autônoma e Confidencialidade</h3>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed font-sans">
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

            <div className="p-4 border-t border-white/[0.08] bg-[#0a0c10] flex justify-end gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, termsAccepted: true });
                  setShowContractModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER EXECUTIVO */}
      <footer className="border-t border-white/[0.06] bg-[#0a0c10] py-10 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center font-bold font-mono text-xs text-white">
              B
            </div>
            <div>
              <p className="font-semibold text-slate-300">WebBilly • webbilly.com.br</p>
              <p className="text-[11px] text-slate-500 font-mono">Rede Oficial de Operadores Comerciais • Billy Suite v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/operador/login" className="hover:text-white transition">Área do Operador</Link>
            <Link href="/admin/login" className="hover:text-white transition">Master Admin</Link>
            <button onClick={() => setShowContractModal(true)} className="hover:text-white transition cursor-pointer">
              Termos & Contrato
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

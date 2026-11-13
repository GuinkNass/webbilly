'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  DollarSign
} from 'lucide-react';

function CandidaturaForm() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    whatsapp: '',
    email: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    pixType: 'cpf',
    pixKey: '',
    experience: '',
    acceptedTerms: false,
    ref: refParam
  });

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (refParam) {
      setFormData(prev => ({ ...prev, ref: refParam }));
    }
  }, [refParam]);

  // Máscaras de entrada
  const maskCpf = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
  };

  const maskPhone = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
  };

  const maskCep = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    if (raw.length <= 5) return raw;
    return `${raw.slice(0, 5)}-${raw.slice(5, 8)}`;
  };

  // Busca automática via CEP (ViaCEP)
  const handleCepBlur = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setCepLoading(true);
    setCepError(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError('CEP não localizado. Preencha os campos de endereço manualmente.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state
      }));
    } catch (err) {
      setCepError('Falha ao consultar CEP. Preencha o endereço manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.acceptedTerms) {
      setErrorMessage('Você deve ler e aceitar o Contrato de Parceria Comercial para prosseguir.');
      return;
    }

    if (!formData.name || !formData.cpf || !formData.whatsapp || !formData.email || !formData.pixKey) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios destacados com asterisco (*).');
      return;
    }

    setSubmitting(true);

    try {
      const fullAddress = [
        formData.address,
        formData.number ? `nº ${formData.number}` : ''
      ].filter(Boolean).join(', ');

      const cityState = formData.city && formData.state ? `${formData.city} - ${formData.state}` : formData.city;

      const payload = {
        nome: formData.name,
        cpf: formData.cpf,
        whatsapp: formData.whatsapp,
        email: formData.email,
        cep: formData.cep,
        address: fullAddress,
        neighborhood: formData.neighborhood,
        cidade: formData.city,
        state: formData.state,
        city_state: cityState,
        pixType: formData.pixType,
        pixKey: formData.pixKey,
        experiencia: formData.experience,
        ref: formData.ref
      };

      const res = await fetch('/api/trabalhe-aqui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao enviar ficha de candidatura.');

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar sua candidatura. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#84cc16] selection:text-black">
      {/* Barra de Navegação */}
      <header className="sticky top-0 z-40 bg-[#07090e]/85 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-extrabold tracking-tight font-heading text-white">
            Web<span className="text-[#84cc16]">billy</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
            Recrutamento Comercial
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/contrato-operador"
            target="_blank"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Ler Contrato</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {submitSuccess ? (
          <div className="bg-[#0f121a] border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#84cc16]/15 border border-[#84cc16]/30 text-[#84cc16] flex items-center justify-center mx-auto shadow-lg shadow-[#84cc16]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/15 text-[#84cc16] border border-[#84cc16]/30">
                Ficha Recebida com Sucesso
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Candidatura Enviada para Admissão!
              </h1>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Olá, <strong className="text-white">{formData.name}</strong>! Seus dados foram registrados com sucesso em nossa base de credenciamento.
              </p>
            </div>

            <div className="bg-[#141824] border border-white/[0.06] rounded-2xl p-6 text-left space-y-3.5 text-xs text-zinc-300">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84cc16]" />
                <span>O que acontece agora?</span>
              </div>
              <p className="leading-relaxed">
                1. <strong>Análise de Praça e Vagas:</strong> Nossa equipe de expansão analisa as cotas regionais para a sua localidade.
              </p>
              <p className="leading-relaxed">
                2. <strong>Aprovação e Envio de Acessos:</strong> Sendo aprovado(a), você receberá no seu e-mail pessoal (<strong className="text-cyan-300 font-mono">{formData.email}</strong>):
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-400 font-mono text-[11px]">
                <li>Seu E-mail Corporativo Oficial (<strong className="text-[#84cc16]">@webbilly.com.br</strong>)</li>
                <li>Sua Senha Provisória de Acesso</li>
                <li>Sua Chave Serial do Programa Billy Suite Desktop</li>
              </ul>
              <p className="leading-relaxed text-zinc-400">
                3. Fique atento também às mensagens no seu WhatsApp (<strong className="text-emerald-400 font-mono">{formData.whatsapp}</strong>).
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#84cc16]/25"
              >
                <span>Voltar para a Página Inicial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cabeçalho de Destaque */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Credenciamento de Operadores Comerciais</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ficha Oficial de Candidatura
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Atue como parceiro autônomo da Webbilly: receba <strong className="text-white font-mono">R$ 10,00/mês</strong> por assinatura ativa, <strong className="text-[#84cc16] font-mono">30% (R$ 147,00)</strong> nas vendas de Domínio Próprio, bônus por medalhas de produtividade e comissão de afiliados.
              </p>

              {formData.ref && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium mt-2">
                  <span>Indicação de Operador Padrinho:</span>
                  <strong className="text-white font-mono">{formData.ref}</strong>
                </div>
              )}
            </div>

            {/* Mensagem de Erro Geral */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Formulário Dividido em 3 Seções */}
            <form onSubmit={handleSubmit} className="bg-[#0f121a] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
              {/* =============================================================
                  SEÇÃO 1 — DADOS PESSOAIS
                 ============================================================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Dados Pessoais & Contato
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Identificação oficial do titular da parceria.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nome Completo <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Carlos Eduardo da Silva"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      CPF <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: maskCpf(e.target.value) })}
                        placeholder="000.000.000-00"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      WhatsApp com DDD <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                  </div>

                  {/* E-mail Pessoal */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      E-mail Pessoal de Acompanhamento <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seuemail@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                      💡 <strong>Importante:</strong> Após a aprovação da sua ficha, seu novo <strong>E-mail Corporativo (@webbilly.com.br)</strong> e a <strong>Chave Serial do Desktop Billy</strong> serão enviados para este endereço.
                    </p>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  SEÇÃO 2 — ENDEREÇO & REGIÃO DE ATUAÇÃO
                 ============================================================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Endereço & Região de Atuação
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Definição da sua praça regional para prioridade na triagem.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CEP */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      CEP <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={formData.cep}
                        onBlur={handleCepBlur}
                        onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                        placeholder="00000-000"
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                      {cepLoading && (
                        <div className="w-3.5 h-3.5 border-2 border-[#84cc16]/30 border-t-[#84cc16] rounded-full animate-spin absolute right-3 top-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Logradouro / Rua */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Rua / Logradouro <span className="text-[#84cc16]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Av. Paulista"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                    />
                  </div>

                  {/* Número / Complemento */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Número / Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="1000, Apto 42"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                    />
                  </div>

                  {/* Bairro */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Bairro <span className="text-[#84cc16]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Ex: Bela Vista"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                    />
                  </div>

                  {/* Cidade / Estado */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Cidade / UF <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="São Paulo"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="SP"
                        className="w-14 px-2 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono text-center uppercase placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                  </div>
                </div>

                {cepError && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    ⚠️ {cepError}
                  </p>
                )}
              </div>

              {/* =============================================================
                  SEÇÃO 3 — DADOS PIX & EXPERIÊNCIA COMERCIAL
                 ============================================================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Repasses Pix & Experiência Comercial
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Onde você receberá suas comissões de R$ 10,00/mês e R$ 147,00 por domínio.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tipo de Chave Pix */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Tipo de Chave Pix <span className="text-[#84cc16]">*</span>
                    </label>
                    <select
                      value={formData.pixType}
                      onChange={(e) => setFormData({ ...formData, pixType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#84cc16] transition"
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  {/* Chave Pix */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Chave Pix Cadastrada <span className="text-[#84cc16]">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
                      <input
                        type="text"
                        required
                        value={formData.pixKey}
                        onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                        placeholder="Informe sua chave Pix oficial"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                  ⚠️ <strong>Atenção à Titularidade:</strong> A chave Pix deve ser de titularidade do mesmo CPF informado na Seção 1 para validação contábil automática dos repasses mensais.
                </div>

                {/* Experiência Comercial */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Breve Experiência Comercial ou com Vendas <span className="text-[#84cc16]">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                    <textarea
                      required
                      rows={3}
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Conte brevemente se já atuou com prospecção de comércios, vendas externas, marketing digital ou atendimento..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#84cc16] transition resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* =============================================================
                  ACEITE CONTRATUAL JURÍDICO (PROVA DIGITAL IP + TIMESTAMP)
                 ============================================================= */}
              <div className="pt-2 border-t border-white/[0.06] space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-white/[0.2] bg-zinc-900 text-[#84cc16] focus:ring-[#84cc16] focus:ring-offset-0 cursor-pointer accent-[#84cc16]"
                  />
                  <span className="text-xs text-zinc-300 leading-relaxed group-hover:text-white transition">
                    Li e concordo com os termos do{' '}
                    <Link
                      href="/contrato-operador"
                      target="_blank"
                      className="text-[#84cc16] font-semibold underline hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Contrato de Parceria Comercial Autônoma
                    </Link>{' '}
                    da Webbilly, declarando a veracidade de todos os dados preenchidos sob as penas da lei.
                  </span>
                </label>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#84cc16]/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      <span>Processando Candidatura...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Ficha de Candidatura Oficial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CandidaturaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#84cc16]/30 border-t-[#84cc16] rounded-full animate-spin" />
      </div>
    }>
      <CandidaturaForm />
    </Suspense>
  );
}

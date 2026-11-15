'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Globe,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  ExternalLink,
  XCircle,
  AlertTriangle,
  CreditCard,
  QrCode,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ProposalPage() {
  const params = useParams();
  const leadToken = (params?.leadToken as string) || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'mensal' | 'proprio'>('mensal');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);

  // Estados de Recusa/Cancelamento de Proposta
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  useEffect(() => {
    if (!leadToken) return;
    fetch(`/api/public/proposta/${leadToken}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        if (resData?.isDeclined) {
          setIsDeclined(true);
        }
        if (resData?.domains && resData.domains.length > 0) {
          setSelectedDomain(resData.domains[0].domain);
        }
        if (resData?.lead?.accepted_terms_at) {
          setTermsAccepted(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leadToken]);

  const handleToggleTerms = async (checked: boolean) => {
    setTermsAccepted(checked);
    if (checked && leadToken) {
      setTermsSubmitting(true);
      try {
        await fetch(`/api/public/proposta/${leadToken}/accept-terms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: 'v1.0' })
        });
      } catch (err) {
        console.warn('Erro ao salvar aceite eletrônico:', err);
      } finally {
        setTermsSubmitting(false);
      }
    }
  };

  const copyPix = () => {
    if (!data?.pix?.payload) return;
    navigator.clipboard.writeText(data.pix.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmDecline = async () => {
    setDeclining(true);
    try {
      const res = await fetch('/api/proposta/recusar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadToken,
          siteSlug: data?.lead?.subdomain ? data.lead.subdomain.replace('.webbilly.com.br', '') : '',
          reason: declineReason || 'Cliente optou por não contratar no momento.'
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar recusa.');

      setIsDeclined(true);
      setShowDeclineModal(false);
    } catch (err: any) {
      alert(err.message || 'Falha ao recusar proposta.');
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
          <span>Carregando proposta oficial...</span>
        </div>
      </div>
    );
  }

  const lead = data?.lead || {};
  const pix = data?.pix || {};
  const domains = data?.domains || [];
  const subscription = data?.subscription || {};

  // Tela de confirmação de proposta recusada / cancelada
  if (isDeclined) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 selection:bg-rose-600 selection:text-white">
        <div className="max-w-lg w-full bg-[#0b101c] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono mb-3">
              <Check className="w-3.5 h-3.5" />
              Proposta Encerrada com Sucesso
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Nenhuma Cobrança Será Efetuada
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Confirmamos que a proposta para <strong className="text-white">{lead.title || 'sua empresa'}</strong> foi encerrada e qualquer cobrança ou assinatura pendente no Asaas foi cancelada.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#070a11] border border-white/[0.06] text-xs text-slate-400 leading-relaxed text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantia de Isenção Total Webbilly:</span>
            </div>
            <p>
              • Zero faturas ativas no seu CPF ou CNPJ.<br />
              • Nenhuma assinatura recorrente ativada.<br />
              • Caso decida publicar seu site no futuro, nossa equipe estará à disposição.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="https://webbilly.com.br"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
            >
              <span>Voltar para a Página Inicial da Webbilly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-sky-600 selection:text-white font-sans antialiased py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img src="/billy-logo.png" alt="Webbilly" className="h-9 w-9 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Webbilly</span>
                <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  Proposta Oficial
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Ativação de Presença Digital para Negócios Locais</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Site Pronto para Lançamento
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-[#0b101c] border border-sky-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <span className="font-mono text-xs uppercase tracking-wider text-sky-400 font-bold block mb-2">
            Proposta Comercial Exclusiva
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Coloque a {lead.title || 'sua empresa'} no ar com endereço oficial e tecnologia de ponta.
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl">
            Sua demonstração foi personalizada e aprovada. Escolha abaixo a modalidade de contratação desejada para ativar seu site profissional:
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.08] text-xs font-mono">
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Hospedagem</span>
              <strong className="text-white">Inclusa (Vercel Edge)</strong>
            </div>
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Certificado SSL</span>
              <strong className="text-emerald-400">Segurança Ativa</strong>
            </div>
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Garantia</span>
              <strong className="text-sky-400">Sem Multa / Sem Fidelidade</strong>
            </div>
          </div>
        </div>

        {/* Seletor de Planos: Opção 1 (R$ 29,90/mês) vs Opção 2 (R$ 490,00 Domínio Próprio) */}
        <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 font-bold block mb-1">
              Modalidades Disponíveis
            </span>
            <h2 className="text-lg font-bold text-white">Escolha o seu plano de ativação</h2>
            <p className="text-xs text-slate-300">
              Você pode optar pela assinatura mensal de R$ 29,90 no subdomínio oficial ou pelo pacote completo com domínio próprio por 1 ano:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Opção 1: R$ 29,90/mês */}
            <div
              onClick={() => setSelectedPlan('mensal')}
              className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                selectedPlan === 'mensal'
                  ? 'bg-sky-500/15 border-sky-400/60 shadow-lg shadow-sky-950/40'
                  : 'bg-[#070a11] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Mais Popular
                </span>
                <input
                  type="radio"
                  name="plan_choice"
                  checked={selectedPlan === 'mensal'}
                  onChange={() => setSelectedPlan('mensal')}
                  className="accent-sky-500"
                />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                R$ 29,90<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">
                Presença Digital Oficial (Subdomínio)
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Site completo no subdomínio <code className="text-sky-300">{lead.subdomain || 'seunegocio.webbilly.com.br'}</code>. Zero taxa de criação, até 2 alterações inclusas por mês e cancelamento livre a qualquer momento.
              </p>
            </div>

            {/* Card Opção 2: R$ 490,00 Domínio Próprio */}
            <div
              onClick={() => setSelectedPlan('proprio')}
              className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                selectedPlan === 'proprio'
                  ? 'bg-emerald-500/15 border-emerald-400/60 shadow-lg shadow-emerald-950/40'
                  : 'bg-[#070a11] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Domínio Próprio
                </span>
                <input
                  type="radio"
                  name="plan_choice"
                  checked={selectedPlan === 'proprio'}
                  onChange={() => setSelectedPlan('proprio')}
                  className="accent-emerald-500"
                />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                R$ 490,00<span className="text-xs font-normal text-slate-400"> pagamento único</span>
              </div>
              <span className="text-xs font-bold text-slate-200 block mt-1">
                Site Completo + Domínio .com.br por 1 Ano
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Domínio próprio exclusivo incluso por 1 ano. Sem mensalidade obrigatória (renovação anual de R$ 70,00/ano e alterações avulsas por R$ 29,90 sob demanda).
              </p>
            </div>
          </div>
        </div>

        {/* Escolha do Domínio (Exibido na Opção 2) */}
        {selectedPlan === 'proprio' && (
          <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Registro de Titularidade
              </span>
              <h2 className="text-lg font-bold text-white">Escolha o seu endereço web oficial (.com.br)</h2>
              <p className="text-xs text-slate-300">
                O domínio será registrado com exclusividade no seu CPF ou CNPJ via Registro.br:
              </p>
            </div>

            <div className="space-y-2.5">
              {domains.map((d: any, idx: number) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedDomain === d.domain
                      ? 'bg-emerald-600/10 border-emerald-500/50 text-white'
                      : 'bg-[#070a11] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 font-mono text-xs font-bold">
                    <input
                      type="radio"
                      name="domain_option"
                      checked={selectedDomain === d.domain}
                      onChange={() => setSelectedDomain(d.domain)}
                      className="accent-emerald-500"
                    />
                    <span>{d.domain}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    DISPONÍVEL
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Termos de Uso e Aceite Obrigatório */}
        <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-5 shadow-xl">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => handleToggleTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shrink-0"
            />
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed block">
                Li e concordo com os{' '}
                <a
                  href="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 inline-flex items-center gap-1"
                >
                  <span>Termos de Uso e Licenciamento de Presença Digital da Webbilly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                .
              </span>
              <p className="text-[11px] text-slate-400">
                O aceite eletrônico é registrado com endereço IP, data e hora nos termos da legislação brasileira vigente.
              </p>
            </div>
          </label>
        </div>

        {/* Bloco de Pagamento Conforme Plano Selecionado */}
        {selectedPlan === 'mensal' ? (
          /* Checkout Opção 1: R$ 29,90/mês (Asaas Seguro) */
          <div
            className={`bg-[#0b101c] border border-sky-500/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-all ${
              !termsAccepted ? 'opacity-50 grayscale select-none pointer-events-none' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 font-bold block mb-1">
                  Assinatura Recorrente Mensal • Subdomínio Oficial
                </span>
                <div className="text-3xl font-black text-white font-mono">
                  R$ 29,90<span className="text-sm font-normal text-slate-400">/mês</span>
                </div>
                <span className="text-xs text-slate-400">
                  Sem taxa de adesão • Você só começa a pagar com o site pronto • Cancele quando quiser
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono font-bold">
                <CreditCard className="w-4 h-4 text-sky-400" />
                Pix ou Cartão de Crédito
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Clique no botão abaixo para abrir o checkout oficial do gateway <strong>Asaas</strong> e ativar a primeira mensalidade via Pix ou Cartão de Crédito. O seu site entrará no ar imediatamente após a confirmação:
              </p>

              <a
                href={subscription.checkoutUrl || `/api/subscription/create-checkout?leadId=${encodeURIComponent(leadToken)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar R$ 29,90 & Ativar Meu Site no Ar</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="p-3 rounded-xl bg-[#070a11] border border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cobrança 100% segura e blindada: nenhuma mensalidade futura será cobrada caso decida cancelar.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Opção 2: R$ 490,00 Pix Direto */
          <div
            className={`bg-[#0b101c] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-all ${
              !termsAccepted ? 'opacity-50 grayscale select-none pointer-events-none' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                  Pacote Completo • Domínio Próprio + Site por 1 Ano
                </span>
                <div className="text-3xl font-black text-white font-mono">
                  R$ 490,00
                </div>
                <span className="text-xs text-slate-400">
                  1 ano de domínio próprio incluso • Renovação anual de R$ 70,00/ano • Sem mensalidade
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Ativação Imediata via Pix
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center max-w-[220px] mx-auto">
                <img src={pix.qrCodeUrl} alt="QR Code Pix" className="w-44 h-44 object-contain" />
                <span className="text-[10px] font-mono text-zinc-900 font-bold mt-2">
                  Escaneie com o app do seu banco
                </span>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Pix Copia e Cola
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={pix.payload || ''}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-slate-300 text-xs font-mono pr-24 focus:outline-none"
                    />
                    <button
                      onClick={copyPix}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 space-y-1 bg-[#070a11] p-3.5 rounded-xl border border-white/[0.06]">
                  <div>Beneficiário: <strong className="text-white">{pix.name}</strong></div>
                  <div>Identificador: <strong className="text-sky-400">{pix.txid}</strong></div>
                  <div>Domínio selecionado: <strong className="text-emerald-400">{selectedDomain}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão Discreto: Recusar / Cancelar Proposta */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            className="text-xs text-zinc-500 hover:text-rose-400 transition inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Não desejo contratar agora / Cancelar proposta</span>
          </button>
        </div>

        {/* Modal de Confirmação de Recusa */}
        {showDeclineModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b101c] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Cancelar Proposta Comercial</h3>
                  <span className="text-xs text-zinc-400">
                    {lead.title || 'Sua Empresa'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 space-y-2 leading-relaxed">
                <p>
                  <strong>Atenção:</strong> Ao confirmar o cancelamento, qualquer cobrança pendente gerada no Asaas será cancelada imediatamente e nenhuma fatura será emitida no seu nome ou CNPJ.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Motivo (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vou deixar para o próximo mês..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070a11] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={declining}
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                >
                  Voltar à Proposta
                </button>
                <button
                  type="button"
                  disabled={declining}
                  onClick={handleConfirmDecline}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{declining ? 'Cancelando...' : 'Confirmar & Cancelar Proposta'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
